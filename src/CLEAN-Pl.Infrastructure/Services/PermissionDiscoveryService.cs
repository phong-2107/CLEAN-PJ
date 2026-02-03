using CLEAN_Pl.Domain.Constants;
using System.Reflection;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Common;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CLEAN_Pl.Infrastructure.Services;

public class PermissionDiscoveryService : IPermissionDiscoveryService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PermissionDiscoveryService> _logger;
    private static readonly HashSet<string> SystemEntities =
    [
        nameof(User),
        nameof(Role),
        nameof(Permission),
        nameof(UserRole),
        nameof(RolePermission)
    ];

    public PermissionDiscoveryService(
        ApplicationDbContext context,
        ILogger<PermissionDiscoveryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PermissionDiscoveryResult> DiscoverAndSyncAsync(
        Assembly apiAssembly,
        Assembly domainAssembly,
        CancellationToken ct = default)
    {
        _logger.LogInformation("?? Starting permission auto-discovery...");

        // 1. Discover from Entities (Auto-generate CRUD)
        var entityPermissions = DiscoverFromEntities(domainAssembly);
        _logger.LogDebug("Discovered {Count} permissions from entities", entityPermissions.Count);

        // 2. Discover from Attributes (Custom permissions)
        var attributePermissions = DiscoverFromAttributes(apiAssembly);
        _logger.LogDebug("Discovered {Count} permissions from attributes", attributePermissions.Count);

        // Merge: Attributes override entities if duplicate (they usually have better descriptions)
        var allPermissions = MergePermissions(entityPermissions, attributePermissions);

        // Diff with DB
        var existingNames = await _context.Permissions
            .Select(p => p.Name)
            .ToHashSetAsync(ct);

        var newPermissions = allPermissions
            .Where(p => !existingNames.Contains(p.Name))
            .ToList();

        // Sync new permissions
        var addedNames = new List<string>();
        if (newPermissions.Count > 0)
        {
            foreach (var info in newPermissions)
            {
                var permission = Permission.Create(
                    info.Name,
                    info.Resource,
                    info.Action,
                    info.Description
                );
                await _context.Permissions.AddAsync(permission, ct);
                addedNames.Add(info.Name);
            }

            await _context.SaveChangesAsync(ct);

            // Auto-assign new permissions to Admin role so they can use them immediately
            await AssignToAdminRoleAsync(addedNames, ct);

            _logger.LogInformation(
                "? Added {Count} new permissions: [{Names}]",
                newPermissions.Count,
                string.Join(", ", addedNames));
        }
        else
        {
            _logger.LogInformation("? All permissions already exist in database");
        }

        // Check for orphaned permissions (exist in DB but not in code)
        var discoveredNames = allPermissions.Select(p => p.Name).ToHashSet();
        var orphaned = existingNames
            .Where(n => !discoveredNames.Contains(n))
            .ToList();

        if (orphaned.Count > 0)
        {
            _logger.LogWarning(
                "?? Found {Count} orphaned permissions (in DB but not in code): [{Names}]",
                orphaned.Count,
                string.Join(", ", orphaned));
        }

        return new PermissionDiscoveryResult
        {
            TotalDiscovered = allPermissions.Count,
            NewlyAdded = newPermissions.Count,
            FromEntities = entityPermissions.Count,
            FromAttributes = attributePermissions.Count,
            AddedPermissions = addedNames,
            OrphanedPermissions = orphaned
        };
    }

    #region Private Methods - Entity Discovery

    /// <summary>
    /// Discovers CRUD permissions from Domain entities that inherit from AuditableEntity/BaseEntity.
    /// </summary>
    private List<DiscoveredPermission> DiscoverFromEntities(Assembly domainAssembly)
    {
        var permissions = new List<DiscoveredPermission>();

        var entityTypes = domainAssembly.GetTypes()
            .Where(t => t.IsClass
                && !t.IsAbstract
                && IsBusinessEntity(t))
            .ToList();

        foreach (var entityType in entityTypes)
        {
            var resourceName = entityType.Name;

            // Skip system entities
            if (SystemEntities.Contains(resourceName))
                continue;

            // Generate CRUD permissions
            foreach (var action in SystemConstants.Actions.Crud)
            {
                var permissionName = $"{resourceName}.{action}";
                permissions.Add(new DiscoveredPermission
                {
                    Name = permissionName,
                    Resource = resourceName,
                    Action = action,
                    Description = $"Auto-generated: {action} {resourceName}",
                    Source = PermissionSource.Entity
                });
            }

            _logger.LogDebug("Generated CRUD permissions for entity: {Entity}", resourceName);
        }

        return permissions;
    }

    /// <summary>
    /// Checks if a type is a business entity (inherits from BaseEntity or AuditableEntity).
    /// </summary>
    private static bool IsBusinessEntity(Type type)
    {
        var current = type.BaseType;
        while (current != null)
        {
            if (current.Name == nameof(AuditableEntity) || current.Name == nameof(BaseEntity))
                return true;
            current = current.BaseType;
        }
        return false;
    }

    #endregion

    #region Private Methods - Attribute Discovery

    // Discovers permissions from [Permission] attributes in API controllers.
    private List<DiscoveredPermission> DiscoverFromAttributes(Assembly apiAssembly)
    {
        var permissions = new Dictionary<string, DiscoveredPermission>(StringComparer.OrdinalIgnoreCase);

        var permissionAttrType = apiAssembly.GetTypes()
            .FirstOrDefault(t => t.Name == "PermissionAttribute" && t.IsClass);

        if (permissionAttrType == null)
        {
            _logger.LogWarning("PermissionAttribute not found in API assembly");
            return [];
        }

        var permissionProperty = permissionAttrType.GetProperty("Permission");

        var controllerTypes = apiAssembly.GetTypes()
            .Where(t => t.IsClass
                && !t.IsAbstract
                && t.Name.EndsWith("Controller", StringComparison.OrdinalIgnoreCase));

        foreach (var controller in controllerTypes)
        {
            // Class-level attributes
            ScanMemberForAttributes(controller, permissionAttrType, permissionProperty, permissions);

            // Method-level attributes
            var methods = controller.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);
            foreach (var method in methods)
            {
                ScanMemberForAttributes(method, permissionAttrType, permissionProperty, permissions);
            }
        }

        return [.. permissions.Values];
    }

    private void ScanMemberForAttributes(
        MemberInfo member,
        Type attrType,
        PropertyInfo? permissionProperty,
        Dictionary<string, DiscoveredPermission> permissions)
    {
        var attributes = member.GetCustomAttributes(attrType, inherit: true);

        foreach (var attr in attributes)
        {
            var permissionValue = permissionProperty?.GetValue(attr)?.ToString();

            if (string.IsNullOrWhiteSpace(permissionValue))
                continue;

            if (permissions.ContainsKey(permissionValue))
                continue;

            var parts = permissionValue.Split('.', 2);
            var resource = parts.Length > 1 ? parts[0] : "Unknown";
            var action = parts.Length > 1 ? parts[1] : parts[0];

            permissions[permissionValue] = new DiscoveredPermission
            {
                Name = permissionValue,
                Resource = resource,
                Action = action,
                Description = $"Discovered from [{member.DeclaringType?.Name}.{member.Name}]",
                Source = PermissionSource.Attribute
            };
        }
    }

    #endregion

    #region Private Methods - Merge & Assign

    private static List<DiscoveredPermission> MergePermissions(
        List<DiscoveredPermission> fromEntities,
        List<DiscoveredPermission> fromAttributes)
    {
        var merged = new Dictionary<string, DiscoveredPermission>(StringComparer.OrdinalIgnoreCase);

        foreach (var p in fromEntities)
            merged[p.Name] = p;
        foreach (var p in fromAttributes)
            merged[p.Name] = p;

        return [.. merged.Values];
    }

    private async Task AssignToAdminRoleAsync(List<string> permissionNames, CancellationToken ct)
    {
        if (permissionNames.Count == 0) return;

        var adminRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == SystemConstants.Roles.Admin && r.IsSystemRole, ct);

        if (adminRole == null)
        {
            _logger.LogWarning("Admin role not found. New permissions will not be auto-assigned.");
            return;
        }

        var newPermissions = await _context.Permissions
            .Where(p => permissionNames.Contains(p.Name))
            .ToListAsync(ct);

        var existingMappings = await _context.RolePermissions
            .Where(rp => rp.RoleId == adminRole.Id)
            .Select(rp => rp.PermissionId)
            .ToHashSetAsync(ct);

        var addedCount = 0;
        foreach (var permission in newPermissions)
        {
            if (existingMappings.Contains(permission.Id))
                continue;

            var rolePermission = RolePermission.Create(adminRole.Id, permission.Id, SystemConstants.SystemSource);
            await _context.RolePermissions.AddAsync(rolePermission, ct);
            addedCount++;
        }

        if (addedCount > 0)
        {
            await _context.SaveChangesAsync(ct);
            _logger.LogInformation("?? Auto-assigned {Count} new permissions to Admin role", addedCount);
        }
    }

    #endregion
}

#region Internal Types

internal sealed record DiscoveredPermission
{
    public required string Name { get; init; }
    public required string Resource { get; init; }
    public required string Action { get; init; }
    public required string Description { get; init; }
    public PermissionSource Source { get; init; }
}

internal enum PermissionSource
{
    Entity,
    Attribute
}

#endregion

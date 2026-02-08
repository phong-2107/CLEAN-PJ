using CLEAN_Pl.Application.DTOs.User;
using CLEAN_Pl.Application.Exceptions;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;

namespace CLEAN_Pl.Application.Services;

/// <summary>
/// Service implementation for user-specific permission management.
/// Implements Hybrid RBAC + ABAC pattern with audit trail.
/// </summary>
public sealed class UserPermissionService(
    IUnitOfWork unitOfWork,
    IPermissionCacheService cacheService) : IUserPermissionService
{
    public async Task<UserEffectivePermissionsDto> GetEffectivePermissionsAsync(
        int userId,
        CancellationToken ct = default)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user == null)
            throw new NotFoundException("User not found");

        // Use optimized Dapper query
        var effectivePermissions = await unitOfWork.Users.GetEffectivePermissionsOptimizedAsync(userId, ct);
        
        var permissions = effectivePermissions
            .Select(p => new UserEffectivePermissionItemDto(p.Id, p.Name, p.Resource, p.Action, p.Source))
            .ToList();

        var statistics = new PermissionStatistics(
            FromRoles: permissions.Count(p => p.Source == "Role"),
            FromDirectGrants: permissions.Count(p => p.Source == "DirectGrant"),
            TotalUnique: permissions.DistinctBy(p => p.Id).Count()
        );

        return new UserEffectivePermissionsDto(userId, user.Username, permissions, statistics);
    }

    public async Task<UserMissingPermissionsDto> GetMissingPermissionsAsync(
        int userId,
        CancellationToken ct = default)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user == null)
            throw new NotFoundException("User not found");

        // Use optimized Dapper query
        var missingPermissions = await unitOfWork.Users.GetMissingPermissionsOptimizedAsync(userId, ct);
        
        var missing = missingPermissions
            .Select(p => new MissingPermissionItemDto(p.Id, p.Name, p.Resource, p.Action))
            .ToList();

        // Get total permissions count
        var allPermissions = await unitOfWork.Permissions.GetAllAsync(ct);
        var totalCount = allPermissions.Count();

        var statistics = new MissingPermissionStatistics(
            TotalPermissions: totalCount,
            UserHasPermissions: totalCount - missing.Count,
            MissingPermissions: missing.Count
        );

        return new UserMissingPermissionsDto(userId, user.Username, missing, statistics);
    }

    public async Task<IEnumerable<UserPermissionDto>> GetUserPermissionOverridesAsync(
        int userId,
        CancellationToken ct = default)
    {
        var overrides = await unitOfWork.Users.GetUserPermissionOverridesAsync(userId, ct);

        return overrides.Select(up => new UserPermissionDto(
            up.PermissionId,
            up.Permission.Name,
            up.Permission.Resource,
            up.Permission.Action,
            up.IsGranted,
            up.Reason,
            up.AssignedAt,
            up.AssignedBy.Username
        ));
    }

    public async Task<UserPermissionDetailDto> GetUserPermissionDetailsAsync(
        int userId,
        CancellationToken ct = default)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user == null)
            throw new NotFoundException("User not found");

        var rolePermissions = await GetRoleBasedPermissionsAsync(userId, ct);
        var userRoles = await unitOfWork.Users.GetUserRolesAsync(userId, ct);
        var overrides = await unitOfWork.Users.GetUserPermissionOverridesAsync(userId, ct);

        var permissionSources = new List<PermissionSourceDto>();

        var deniedPermissionIds = overrides
            .Where(o => !o.IsGranted)
            .Select(o => o.PermissionId)
            .ToHashSet();

        foreach (var perm in rolePermissions.Where(p => !deniedPermissionIds.Contains(p.Id)))
        {
            var roleNames = string.Join(", ", userRoles.Select(r => r.Name));
            permissionSources.Add(new PermissionSourceDto(
                perm.Id,
                perm.Name,
                perm.Resource,
                perm.Action,
                "Role",
                roleNames
            ));
        }

        foreach (var grant in overrides.Where(o => o.IsGranted))
        {
            permissionSources.Add(new PermissionSourceDto(
                grant.PermissionId,
                grant.Permission.Name,
                grant.Permission.Resource,
                grant.Permission.Action,
                "Granted",
                grant.Reason ?? $"By {grant.AssignedBy.Username}"
            ));
        }

        foreach (var deny in overrides.Where(o => !o.IsGranted))
        {
            permissionSources.Add(new PermissionSourceDto(
                deny.PermissionId,
                deny.Permission.Name,
                deny.Permission.Resource,
                deny.Permission.Action,
                "Denied",
                deny.Reason ?? $"By {deny.AssignedBy.Username}"
            ));
        }

        return new UserPermissionDetailDto(
            userId,
            user.Username,
            permissionSources.OrderBy(p => p.Resource).ThenBy(p => p.Action)
        );
    }

    public async Task GrantPermissionAsync(
        int userId,
        int permissionId,
        int grantedByUserId,
        string? reason = null,
        CancellationToken ct = default)
    {
        await ValidateAsync(userId, permissionId, ct);

        var existing = await unitOfWork.Users.GetUserPermissionAsync(userId, permissionId, ct);
        if (existing != null)
        {
            existing.Revoke(grantedByUserId);
        }

        var userPermission = UserPermission.Grant(userId, permissionId, grantedByUserId, reason);
        await unitOfWork.Users.AddUserPermissionAsync(userPermission, ct);
        await unitOfWork.CommitAsync(ct);

        cacheService.InvalidateUserCache(userId);
    }

    public async Task DenyPermissionAsync(
        int userId,
        int permissionId,
        int deniedByUserId,
        string? reason = null,
        CancellationToken ct = default)
    {
        await ValidateAsync(userId, permissionId, ct);

        var existing = await unitOfWork.Users.GetUserPermissionAsync(userId, permissionId, ct);
        if (existing != null)
        {
            existing.Revoke(deniedByUserId);
        }

        var userPermission = UserPermission.Deny(userId, permissionId, deniedByUserId, reason);
        await unitOfWork.Users.AddUserPermissionAsync(userPermission, ct);
        await unitOfWork.CommitAsync(ct);

        cacheService.InvalidateUserCache(userId);
    }

    public async Task RevokePermissionAsync(
        int userId,
        int permissionId,
        int revokedByUserId,
        CancellationToken ct = default)
    {
        var existing = await unitOfWork.Users.GetUserPermissionAsync(userId, permissionId, ct);
        if (existing == null)
            throw new NotFoundException("User permission override not found");

        existing.Revoke(revokedByUserId);
        await unitOfWork.CommitAsync(ct);

        cacheService.InvalidateUserCache(userId);
    }

    private async Task ValidateAsync(int userId, int permissionId, CancellationToken ct)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user == null)
            throw new NotFoundException("User not found");

        var permission = await unitOfWork.Permissions.GetByIdAsync(permissionId, ct);
        if (permission == null)
            throw new NotFoundException("Permission not found");
    }

    private async Task<IEnumerable<Permission>> GetRoleBasedPermissionsAsync(
        int userId, 
        CancellationToken ct)
    {
        var rolePermissions = await unitOfWork.Users.GetUserRolesAsync(userId, ct);
        
        var permissions = rolePermissions
            .SelectMany(r => r.RolePermissions)
            .Select(rp => rp.Permission)
            .DistinctBy(p => p.Id)
            .ToList();

        return permissions;
    }
}

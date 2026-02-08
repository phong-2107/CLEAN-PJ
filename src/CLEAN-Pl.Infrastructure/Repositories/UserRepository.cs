using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CLEAN_Pl.Infrastructure.Repositories;

/// <summary>
/// User repository with role/permission handling.
/// </summary>
public class UserRepository(ApplicationDbContext context, IConfiguration configuration) 
    : BaseRepository<User>(context), IUserRepository
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string not found");

    public override async Task<User?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id, ct);
    }

    public async Task<IEnumerable<User>> GetAllAsync(bool includeInactive = false, CancellationToken ct = default)
    {
        var query = _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!includeInactive)
            query = query.Where(u => u.IsActive);

        return await query
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<(IEnumerable<User> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        bool? isActive = null,
        int? roleId = null,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken ct = default)
    {
        var query = _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(search) ||
                u.Email.ToLower().Contains(search) ||
                (u.FirstName != null && u.FirstName.ToLower().Contains(search)) ||
                (u.LastName != null && u.LastName.ToLower().Contains(search)));
        }

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (roleId.HasValue)
            query = query.Where(u => u.UserRoles.Any(ur => ur.RoleId == roleId.Value));

        var totalCount = await query.CountAsync(ct);

        query = sortBy?.ToLower() switch
        {
            "username" => sortDescending ? query.OrderByDescending(u => u.Username) : query.OrderBy(u => u.Username),
            "email" => sortDescending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "createdat" => sortDescending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
            _ => query.OrderByDescending(u => u.CreatedAt)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower(), ct);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), ct);
    }

    public async Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail, CancellationToken ct = default)
    {
        var normalized = usernameOrEmail.ToLower();
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u =>
                u.Username.ToLower() == normalized ||
                u.Email.ToLower() == normalized, ct);
    }

    public async Task<bool> UsernameExistsAsync(string username, CancellationToken ct = default)
    {
        return await AnyAsync(u => u.Username.ToLower() == username.ToLower(), ct);
    }

    public async Task<bool> EmailExistsAsync(string email, CancellationToken ct = default)
    {
        return await AnyAsync(u => u.Email.ToLower() == email.ToLower(), ct);
    }

    public async Task<IEnumerable<Role>> GetUserRolesAsync(int userId, CancellationToken ct = default)
    {
        return await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Role)
            .Select(ur => ur.Role)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Permission>> GetUserPermissionsAsync(int userId, CancellationToken ct = default)
    {
        var rolePermissions = await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission)
            .Distinct()
            .ToListAsync(ct);

        var userOverrides = await _context.UserPermissions
            .Where(up => up.UserId == userId && up.RevokedAt == null)
            .Include(up => up.Permission)
            .ToListAsync(ct);

        var deniedPermissionIds = userOverrides
            .Where(up => !up.IsGranted)
            .Select(up => up.PermissionId)
            .ToHashSet();

        var grantedPermissions = userOverrides
            .Where(up => up.IsGranted)
            .Select(up => up.Permission);

        var finalPermissions = rolePermissions
            .Where(p => !deniedPermissionIds.Contains(p.Id))
            .Union(grantedPermissions)
            .Distinct()
            .ToList();

        return finalPermissions;
    }

    public async Task AddUserRoleAsync(UserRole userRole, CancellationToken ct = default)
    {
        await _context.UserRoles.AddAsync(userRole, ct);
    }

    public async Task RemoveUserRoleAsync(int userId, int roleId, CancellationToken ct = default)
    {
        var userRole = await _context.UserRoles
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId, ct);

        if (userRole != null)
        {
            _context.UserRoles.Remove(userRole);
        }
    }

    public async Task<IEnumerable<UserPermission>> GetUserPermissionOverridesAsync(
        int userId, 
        CancellationToken ct = default)
    {
        return await _context.UserPermissions
            .Where(up => up.UserId == userId && up.RevokedAt == null)
            .Include(up => up.Permission)
            .Include(up => up.AssignedBy)
            .OrderByDescending(up => up.AssignedAt)
            .ToListAsync(ct);
    }

    public async Task AddUserPermissionAsync(
        UserPermission userPermission, 
        CancellationToken ct = default)
    {
        await _context.UserPermissions.AddAsync(userPermission, ct);
    }

    public async Task<UserPermission?> GetUserPermissionAsync(
        int userId, 
        int permissionId, 
        CancellationToken ct = default)
    {
        return await _context.UserPermissions
            .Include(up => up.Permission)
            .Include(up => up.AssignedBy)
            .FirstOrDefaultAsync(
                up => up.UserId == userId 
                   && up.PermissionId == permissionId 
                   && up.RevokedAt == null, 
                ct);
    }

    /// <summary>
    /// OPTIMIZED: Get effective permissions using Dapper.
    /// Formula: Role Permissions UNION Granted UserPermissions.
    /// NO deny logic - pure union of permissions user has access to.
    /// Performance: Single query with UNION, eliminates N+1.
    /// </summary>
    public async Task<IEnumerable<(int Id, string Name, string Resource, string Action, string Source)>> 
        GetEffectivePermissionsOptimizedAsync(int userId, CancellationToken ct = default)
    {
        const string sql = """
            -- Permissions from user's roles
            SELECT DISTINCT 
                p.Id, 
                p.Name, 
                p.Resource, 
                p.Action,
                'Role' AS Source
            FROM Permissions p
            INNER JOIN RolePermissions rp ON p.Id = rp.PermissionId
            INNER JOIN UserRoles ur ON rp.RoleId = ur.RoleId
            WHERE ur.UserId = @UserId

            UNION

            -- Direct granted permissions (advanced/supplementary permissions)
            SELECT DISTINCT 
                p.Id, 
                p.Name, 
                p.Resource, 
                p.Action,
                'DirectGrant' AS Source
            FROM Permissions p
            INNER JOIN UserPermissions up ON p.Id = up.PermissionId
            WHERE up.UserId = @UserId
              AND up.RevokedAt IS NULL
              AND up.IsGranted = 1
            
            ORDER BY Resource, Action;
            """;

        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryAsync<(int Id, string Name, string Resource, string Action, string Source)>(
            sql, 
            new { UserId = userId },
            commandTimeout: 30
        );

        return result;
    }

    /// <summary>
    /// OPTIMIZED: Get permissions that user does NOT have using Dapper.
    /// Formula: All Permissions - (Role Permissions UNION Granted UserPermissions).
    /// Use case: Admin wants to see which permissions can be granted to user.
    /// Performance: Single query with NOT EXISTS, highly optimized.
    /// </summary>
    public async Task<IEnumerable<(int Id, string Name, string Resource, string Action)>> 
        GetMissingPermissionsOptimizedAsync(int userId, CancellationToken ct = default)
    {
        const string sql = """
            -- All permissions that user does NOT have
            SELECT DISTINCT 
                p.Id, 
                p.Name, 
                p.Resource, 
                p.Action
            FROM Permissions p
            WHERE NOT EXISTS (
                -- Exclude permissions from user's roles
                SELECT 1
                FROM RolePermissions rp
                INNER JOIN UserRoles ur ON rp.RoleId = ur.RoleId
                WHERE ur.UserId = @UserId
                  AND rp.PermissionId = p.Id
            )
            AND NOT EXISTS (
                -- Exclude directly granted permissions
                SELECT 1
                FROM UserPermissions up
                WHERE up.UserId = @UserId
                  AND up.PermissionId = p.Id
                  AND up.RevokedAt IS NULL
                  AND up.IsGranted = 1
            )
            ORDER BY p.Resource, p.Action;
            """;

        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryAsync<(int Id, string Name, string Resource, string Action)>(
            sql, 
            new { UserId = userId },
            commandTimeout: 30
        );

        return result;
    }
}
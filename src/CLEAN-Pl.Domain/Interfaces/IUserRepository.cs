using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// User-specific repository operations.
/// </summary>
public interface IUserRepository : IBaseRepository<User>
{
    Task<IEnumerable<User>> GetAllAsync(bool includeInactive = false, CancellationToken ct = default);

    Task<(IEnumerable<User> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        bool? isActive = null,
        int? roleId = null,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken ct = default);
    
    Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail, CancellationToken ct = default);
    Task<bool> UsernameExistsAsync(string username, CancellationToken ct = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);
    Task<IEnumerable<Role>> GetUserRolesAsync(int userId, CancellationToken ct = default);
    Task<IEnumerable<Permission>> GetUserPermissionsAsync(int userId, CancellationToken ct = default);
    Task AddUserRoleAsync(UserRole userRole, CancellationToken ct = default);
    Task RemoveUserRoleAsync(int userId, int roleId, CancellationToken ct = default);
    
    // User-specific permission override methods (Hybrid RBAC + ABAC)
    Task<IEnumerable<UserPermission>> GetUserPermissionOverridesAsync(int userId, CancellationToken ct = default);
    Task AddUserPermissionAsync(UserPermission userPermission, CancellationToken ct = default);
    Task<UserPermission?> GetUserPermissionAsync(int userId, int permissionId, CancellationToken ct = default);
    
    /// <summary>
    /// OPTIMIZED: Get effective permissions using Dapper.
    /// Formula: Role Permissions UNION Granted UserPermissions (IsGranted = true).
    /// Performance: Single query, no deny logic overhead.
    /// </summary>
    Task<IEnumerable<(int Id, string Name, string Resource, string Action, string Source)>> 
        GetEffectivePermissionsOptimizedAsync(int userId, CancellationToken ct = default);
    
    /// <summary>
    /// OPTIMIZED: Get permissions that user does NOT have using Dapper.
    /// Formula: All Permissions - (Role Permissions UNION Granted UserPermissions).
    /// Use case: Show available permissions for granting to user.
    /// </summary>
    Task<IEnumerable<(int Id, string Name, string Resource, string Action)>> 
        GetMissingPermissionsOptimizedAsync(int userId, CancellationToken ct = default);
}

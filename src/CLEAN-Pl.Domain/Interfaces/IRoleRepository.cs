using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// Role-specific repository operations.
/// </summary>
public interface IRoleRepository : IBaseRepository<Role>
{
    Task<IEnumerable<Role>> GetAllAsync(bool includeInactive = false, CancellationToken ct = default);
    Task<Role?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<bool> NameExistsAsync(string name, CancellationToken ct = default);
    Task<IEnumerable<Permission>> GetRolePermissionsAsync(int roleId, CancellationToken ct = default);
    Task AddRolePermissionAsync(RolePermission rolePermission, CancellationToken ct = default);
    Task RemoveRolePermissionAsync(int roleId, int permissionId, CancellationToken ct = default);
}
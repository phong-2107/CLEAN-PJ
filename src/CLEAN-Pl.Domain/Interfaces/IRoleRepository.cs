using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// Role-specific repository operations.
/// </summary>
public interface IRoleRepository : IBaseRepository<Role>
{
    Task<IEnumerable<Role>> GetAllAsync(bool includeInactive = false);
    Task<Role?> GetByNameAsync(string name);
    Task<bool> NameExistsAsync(string name);
    Task<IEnumerable<Permission>> GetRolePermissionsAsync(int roleId);
    Task AddRolePermissionAsync(RolePermission rolePermission);
    Task RemoveRolePermissionAsync(int roleId, int permissionId);
}
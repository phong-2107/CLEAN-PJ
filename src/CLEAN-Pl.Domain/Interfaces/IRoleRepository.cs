using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Domain.Interfaces;

public interface IRoleRepository
{
    Task<IEnumerable<Role>> GetAllAsync(bool includeInactive = false);
    Task<Role?> GetByIdAsync(int id);
    Task<Role?> GetByNameAsync(string name);
    Task<Role> AddAsync(Role role);
    Task UpdateAsync(Role role);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> NameExistsAsync(string name);
    Task<IEnumerable<Permission>> GetRolePermissionsAsync(int roleId);
    Task AddRolePermissionAsync(RolePermission rolePermission);
    Task RemoveRolePermissionAsync(int roleId, int permissionId);
}
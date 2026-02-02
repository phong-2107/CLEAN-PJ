using CLEAN_Pl.Application.DTOs.Role;

namespace CLEAN_Pl.Application.Interfaces;

public interface IRoleService
{
    Task<IEnumerable<RoleDto>> GetAllAsync();
    Task<RoleDto?> GetByIdAsync(int id);
    Task<RoleDto> CreateAsync(CreateRoleDto dto);
    Task UpdateAsync(int id, CreateRoleDto dto);
    Task DeleteAsync(int id);
    Task AssignPermissionAsync(int roleId, int permissionId);
    Task RemovePermissionAsync(int roleId, int permissionId);
}
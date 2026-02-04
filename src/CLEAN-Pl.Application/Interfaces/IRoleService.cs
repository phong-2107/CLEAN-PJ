using CLEAN_Pl.Application.DTOs.Role;

namespace CLEAN_Pl.Application.Interfaces;

public interface IRoleService
{
    Task<IEnumerable<RoleDto>> GetAllAsync(CancellationToken ct = default);
    Task<RoleDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<RoleDto> CreateAsync(CreateRoleDto dto, CancellationToken ct = default);
    Task UpdateAsync(int id, CreateRoleDto dto, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
    Task AssignPermissionAsync(int roleId, int permissionId, CancellationToken ct = default);
    Task RemovePermissionAsync(int roleId, int permissionId, CancellationToken ct = default);
}
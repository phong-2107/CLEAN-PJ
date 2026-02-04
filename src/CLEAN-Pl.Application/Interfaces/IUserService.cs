using CLEAN_Pl.Application.Common;
using CLEAN_Pl.Application.DTOs.User;

namespace CLEAN_Pl.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync(CancellationToken ct = default);
    Task<PagedResult<UserDto>> GetPagedAsync(UserQueryParameters parameters, CancellationToken ct = default);
    Task<UserDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<UserDto> CreateAsync(CreateUserDto dto, CancellationToken ct = default);
    Task UpdateAsync(int id, UpdateUserDto dto, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
    Task AssignRoleAsync(int userId, int roleId, CancellationToken ct = default);
    Task RemoveRoleAsync(int userId, int roleId, CancellationToken ct = default);
    Task<IEnumerable<string>> GetUserPermissionsAsync(int userId, CancellationToken ct = default);
}

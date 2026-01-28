using CLEAN_Pl.Application.DTOs.User;

namespace CLEAN_Pl.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task UpdateAsync(int id, UpdateUserDto dto);
    Task DeleteAsync(int id);
    Task AssignRoleAsync(int userId, int roleId);
    Task RemoveRoleAsync(int userId, int roleId);
    Task<IEnumerable<string>> GetUserPermissionsAsync(int userId);
}
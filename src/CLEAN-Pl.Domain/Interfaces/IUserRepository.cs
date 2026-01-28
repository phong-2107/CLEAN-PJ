using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Domain.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllAsync(bool includeInactive = false);
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail);
    Task<User> AddAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> UsernameExistsAsync(string username);
    Task<bool> EmailExistsAsync(string email);
    Task<IEnumerable<Role>> GetUserRolesAsync(int userId);
    Task<IEnumerable<Permission>> GetUserPermissionsAsync(int userId);
    Task AddUserRoleAsync(UserRole userRole);
    Task RemoveUserRoleAsync(int userId, int roleId);
}
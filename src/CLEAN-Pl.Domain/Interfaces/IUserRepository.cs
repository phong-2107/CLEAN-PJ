using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// User-specific repository operations.
/// </summary>
public interface IUserRepository : IBaseRepository<User>
{
    Task<IEnumerable<User>> GetAllAsync(bool includeInactive = false);

    Task<(IEnumerable<User> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        bool? isActive = null,
        int? roleId = null,
        string? sortBy = null,
        bool sortDescending = false);

    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail);
    Task<bool> UsernameExistsAsync(string username);
    Task<bool> EmailExistsAsync(string email);
    Task<IEnumerable<Role>> GetUserRolesAsync(int userId);
    Task<IEnumerable<Permission>> GetUserPermissionsAsync(int userId);
    Task AddUserRoleAsync(UserRole userRole);
    Task RemoveUserRoleAsync(int userId, int roleId);
}


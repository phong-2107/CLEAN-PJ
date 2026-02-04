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
}

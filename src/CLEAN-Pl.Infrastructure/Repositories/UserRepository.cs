using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CLEAN_Pl.Infrastructure.Repositories;

/// <summary>
/// User repository with role/permission handling.
/// </summary>
public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<User?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<IEnumerable<User>> GetAllAsync(bool includeInactive = false)
    {
        var query = _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!includeInactive)
            query = query.Where(u => u.IsActive);

        return await query
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
    }

    public async Task<(IEnumerable<User> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        bool? isActive = null,
        int? roleId = null,
        string? sortBy = null,
        bool sortDescending = false)
    {
        var query = _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(search) ||
                u.Email.ToLower().Contains(search) ||
                (u.FirstName != null && u.FirstName.ToLower().Contains(search)) ||
                (u.LastName != null && u.LastName.ToLower().Contains(search)));
        }

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (roleId.HasValue)
            query = query.Where(u => u.UserRoles.Any(ur => ur.RoleId == roleId.Value));

        var totalCount = await query.CountAsync();

        query = sortBy?.ToLower() switch
        {
            "username" => sortDescending ? query.OrderByDescending(u => u.Username) : query.OrderBy(u => u.Username),
            "email" => sortDescending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "createdat" => sortDescending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
            _ => query.OrderByDescending(u => u.CreatedAt)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail)
    {
        var normalized = usernameOrEmail.ToLower();
        return await _dbSet
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u =>
                u.Username.ToLower() == normalized ||
                u.Email.ToLower() == normalized);
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await AnyAsync(u => u.Username.ToLower() == username.ToLower());
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await AnyAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<IEnumerable<Role>> GetUserRolesAsync(int userId)
    {
        return await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Role)
            .Select(ur => ur.Role)
            .ToListAsync();
    }

    public async Task<IEnumerable<Permission>> GetUserPermissionsAsync(int userId)
    {
        return await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission)
            .Distinct()
            .ToListAsync();
    }

    public async Task AddUserRoleAsync(UserRole userRole)
    {
        await _context.UserRoles.AddAsync(userRole);
    }

    public async Task RemoveUserRoleAsync(int userId, int roleId)
    {
        var userRole = await _context.UserRoles
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId);

        if (userRole != null)
        {
            _context.UserRoles.Remove(userRole);
        }
    }
}
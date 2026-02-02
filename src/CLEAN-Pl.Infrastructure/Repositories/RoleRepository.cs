using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CLEAN_Pl.Infrastructure.Repositories;

/// <summary>
/// Role repository with permission handling.
/// </summary>
public class RoleRepository : BaseRepository<Role>, IRoleRepository
{
    public RoleRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<Role?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<Role>> GetAllAsync(bool includeInactive = false)
    {
        var query = _dbSet
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .AsQueryable();

        if (!includeInactive)
            query = query.Where(r => r.IsActive);

        return await query
            .OrderBy(r => r.Name)
            .ToListAsync();
    }

    public async Task<Role?> GetByNameAsync(string name)
    {
        return await _dbSet
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Name == name);
    }

    public async Task<bool> NameExistsAsync(string name)
    {
        return await AnyAsync(r => r.Name == name);
    }

    public async Task<IEnumerable<Permission>> GetRolePermissionsAsync(int roleId)
    {
        return await _context.RolePermissions
            .Where(rp => rp.RoleId == roleId)
            .Include(rp => rp.Permission)
            .Select(rp => rp.Permission)
            .ToListAsync();
    }

    public async Task AddRolePermissionAsync(RolePermission rolePermission)
    {
        await _context.RolePermissions.AddAsync(rolePermission);
    }

    public async Task RemoveRolePermissionAsync(int roleId, int permissionId)
    {
        var rolePermission = await _context.RolePermissions
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

        if (rolePermission != null)
        {
            _context.RolePermissions.Remove(rolePermission);
        }
    }
}
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

    public override async Task<Role?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == id, ct);
    }

    public async Task<IEnumerable<Role>> GetAllAsync(bool includeInactive = false, CancellationToken ct = default)
    {
        var query = _dbSet
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .AsQueryable();

        if (!includeInactive)
            query = query.Where(r => r.IsActive);

        return await query
            .OrderBy(r => r.Name)
            .ToListAsync(ct);
    }

    public async Task<Role?> GetByNameAsync(string name, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Name == name, ct);
    }

    public async Task<bool> NameExistsAsync(string name, CancellationToken ct = default)
    {
        return await AnyAsync(r => r.Name == name, ct);
    }

    public async Task<IEnumerable<Permission>> GetRolePermissionsAsync(int roleId, CancellationToken ct = default)
    {
        return await _context.RolePermissions
            .Where(rp => rp.RoleId == roleId)
            .Include(rp => rp.Permission)
            .Select(rp => rp.Permission)
            .ToListAsync(ct);
    }

    public async Task AddRolePermissionAsync(RolePermission rolePermission, CancellationToken ct = default)
    {
        await _context.RolePermissions.AddAsync(rolePermission, ct);
    }

    public async Task RemoveRolePermissionAsync(int roleId, int permissionId, CancellationToken ct = default)
    {
        var rolePermission = await _context.RolePermissions
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId, ct);

        if (rolePermission != null)
        {
            _context.RolePermissions.Remove(rolePermission);
        }
    }
}
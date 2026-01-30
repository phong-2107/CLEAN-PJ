using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CLEAN_Pl.Infrastructure.Repositories;

public class PermissionRepository : IPermissionRepository
{
    private readonly ApplicationDbContext _context;

    public PermissionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Domain.Entities.Permission>> GetAllAsync()
    {
        return await _context.Permissions
            .OrderBy(p => p.Resource)
            .ThenBy(p => p.Action)
            .ToListAsync();
    }

    public async Task<Domain.Entities.Permission?> GetByIdAsync(int id)
    {
        return await _context.Permissions.FindAsync(id);
    }

    public async Task<Domain.Entities.Permission?> GetByNameAsync(string name)
    {
        return await _context.Permissions
            .FirstOrDefaultAsync(p => p.Name == name);
    }

    public async Task<IEnumerable<Domain.Entities.Permission>> GetByResourceAsync(string resource)
    {
        return await _context.Permissions
            .Where(p => p.Resource == resource)
            .OrderBy(p => p.Action)
            .ToListAsync();
    }

    public async Task<Domain.Entities.Permission> AddAsync(Domain.Entities.Permission permission)
    {
        await _context.Permissions.AddAsync(permission);
        return permission;
    }

    public async Task UpdateAsync(Domain.Entities.Permission permission)
    {
        _context.Permissions.Update(permission);
    }

    public async Task DeleteAsync(int id)
    {
        var permission = await GetByIdAsync(id);
        if (permission != null)
        {
            _context.Permissions.Remove(permission);
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Permissions.AnyAsync(p => p.Id == id);
    }
}
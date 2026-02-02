using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;

namespace CLEAN_Pl.Infrastructure.Repositories;

/// <summary>
/// Permission repository.
/// </summary>
public class PermissionRepository : BaseRepository<Permission>, IPermissionRepository
{
    public PermissionRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Permission?> GetByNameAsync(string name)
    {
        return await FirstOrDefaultAsync(p => p.Name == name);
    }

    public async Task<IEnumerable<Permission>> GetByResourceAsync(string resource)
    {
        return await FindAsync(p => p.Resource == resource);
    }
}
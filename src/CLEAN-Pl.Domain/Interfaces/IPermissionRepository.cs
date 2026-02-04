using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// Permission-specific repository operations.
/// </summary>
public interface IPermissionRepository : IBaseRepository<Permission>
{
    Task<Permission?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<IEnumerable<Permission>> GetByResourceAsync(string resource, CancellationToken ct = default);
}
using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Domain.Interfaces;

public interface IPermissionRepository
{
    Task<IEnumerable<Permission>> GetAllAsync();
    Task<Permission?> GetByIdAsync(int id);
    Task<Permission?> GetByNameAsync(string name);
    Task<IEnumerable<Permission>> GetByResourceAsync(string resource);
    Task<Permission> AddAsync(Permission permission);
    Task UpdateAsync(Permission permission);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// Category-specific repository operations.
/// </summary>
public interface ICategoryRepository : IBaseRepository<Category>
{
    Task<Category?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<IEnumerable<Category>> GetActiveAsync(CancellationToken ct = default);
    Task<IEnumerable<Category>> GetWithSubCategoriesAsync(CancellationToken ct = default);
}
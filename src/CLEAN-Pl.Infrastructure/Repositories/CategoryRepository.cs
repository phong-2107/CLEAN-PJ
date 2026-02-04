using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CLEAN_Pl.Infrastructure.Repositories;

/// <summary>
/// Category repository with hierarchical support.
/// </summary>
public class CategoryRepository : BaseRepository<Category>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Category?> GetByNameAsync(string name, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(c => c.Name == name, ct);

    public async Task<IEnumerable<Category>> GetActiveAsync(CancellationToken ct = default)
        => await _dbSet.Where(c => c.IsActive).OrderBy(c => c.Name).ToListAsync(ct);

    public async Task<IEnumerable<Category>> GetWithSubCategoriesAsync(CancellationToken ct = default)
        => await _dbSet.Include(c => c.SubCategories)
            .Where(c => c.ParentCategoryId == null)
            .OrderBy(c => c.Name).ToListAsync(ct);
}
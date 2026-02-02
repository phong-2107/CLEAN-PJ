using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CLEAN_Pl.Infrastructure.Repositories;

public class CategoryRepository : BaseRepository<Category>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Category?> GetByNameAsync(string name)
        => await _dbSet.FirstOrDefaultAsync(c => c.Name == name);

    public async Task<IEnumerable<Category>> GetActiveAsync()
        => await _dbSet.Where(c => c.IsActive).OrderBy(c => c.Name).ToListAsync();

    public async Task<IEnumerable<Category>> GetWithSubCategoriesAsync()
        => await _dbSet.Include(c => c.SubCategories)
            .Where(c => c.ParentCategoryId == null)
            .OrderBy(c => c.Name).ToListAsync();
}
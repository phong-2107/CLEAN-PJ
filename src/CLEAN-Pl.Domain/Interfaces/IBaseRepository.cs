using CLEAN_Pl.Domain.Common;
using System.Linq.Expressions;

namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// Base repository interface providing common CRUD operations.
/// </summary>
public interface IBaseRepository<TEntity> where TEntity : BaseEntity
{
    // Read
    Task<TEntity?> GetByIdAsync(int id);
    Task<TEntity?> GetByIdAsync(int id, params Expression<Func<TEntity, object>>[] includes);
    Task<IEnumerable<TEntity>> GetAllAsync();
    Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate);
    Task<IEnumerable<TEntity>> FindAsync(
        Expression<Func<TEntity, bool>> predicate,
        params Expression<Func<TEntity, object>>[] includes);
    Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate);
    Task<bool> ExistsAsync(int id);
    Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate);
    Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null);

    // Write (changes tracked, call UnitOfWork.CompleteAsync() to persist)
    Task<TEntity> AddAsync(TEntity entity);
    Task AddRangeAsync(IEnumerable<TEntity> entities);
    Task UpdateAsync(TEntity entity);
    Task UpdateRangeAsync(IEnumerable<TEntity> entities);
    Task DeleteAsync(int id);
    Task DeleteAsync(TEntity entity);
    Task DeleteRangeAsync(IEnumerable<TEntity> entities);

    // Pagination
    Task<(IEnumerable<TEntity> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<TEntity, bool>>? predicate = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        params Expression<Func<TEntity, object>>[] includes);
}

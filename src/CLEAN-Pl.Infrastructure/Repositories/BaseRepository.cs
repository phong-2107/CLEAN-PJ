using CLEAN_Pl.Domain.Common;
using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CLEAN_Pl.Infrastructure.Repositories;

/// <summary>
/// Generic base repository with common CRUD operations.
/// </summary>
public class BaseRepository<TEntity> : IBaseRepository<TEntity> where TEntity : BaseEntity
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<TEntity> _dbSet;

    public BaseRepository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<TEntity>();
    }

    #region Read Operations

    public virtual async Task<TEntity?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task<TEntity?> GetByIdAsync(int id, params Expression<Func<TEntity, object>>[] includes)
    {
        IQueryable<TEntity> query = _dbSet;

        foreach (var include in includes)
        {
            query = query.Include(include);
        }

        return await query.FirstOrDefaultAsync(e => e.Id == id);
    }

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public virtual async Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate)
    {
        return await _dbSet.Where(predicate).ToListAsync();
    }

    public virtual async Task<IEnumerable<TEntity>> FindAsync(
        Expression<Func<TEntity, bool>> predicate,
        params Expression<Func<TEntity, object>>[] includes)
    {
        IQueryable<TEntity> query = _dbSet.Where(predicate);

        foreach (var include in includes)
        {
            query = query.Include(include);
        }

        return await query.ToListAsync();
    }

    public virtual async Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate)
    {
        return await _dbSet.FirstOrDefaultAsync(predicate);
    }

    public virtual async Task<bool> ExistsAsync(int id)
    {
        return await _dbSet.AnyAsync(e => e.Id == id);
    }

    public virtual async Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate)
    {
        return await _dbSet.AnyAsync(predicate);
    }

    public virtual async Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null)
    {
        if (predicate == null)
            return await _dbSet.CountAsync();

        return await _dbSet.CountAsync(predicate);
    }

    #endregion

    #region Write Operations

    public virtual async Task<TEntity> AddAsync(TEntity entity)
    {
        await _dbSet.AddAsync(entity);
        return entity;
    }

    public virtual async Task AddRangeAsync(IEnumerable<TEntity> entities)
    {
        await _dbSet.AddRangeAsync(entities);
    }

    public virtual Task UpdateAsync(TEntity entity)
    {
        entity.SetUpdatedAt();
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public virtual Task UpdateRangeAsync(IEnumerable<TEntity> entities)
    {
        foreach (var entity in entities)
        {
            entity.SetUpdatedAt();
        }
        _dbSet.UpdateRange(entities);
        return Task.CompletedTask;
    }

    public virtual async Task DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
        }
    }

    public virtual Task DeleteAsync(TEntity entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public virtual Task DeleteRangeAsync(IEnumerable<TEntity> entities)
    {
        _dbSet.RemoveRange(entities);
        return Task.CompletedTask;
    }

    #endregion

    #region Pagination

    public virtual async Task<(IEnumerable<TEntity> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        Expression<Func<TEntity, bool>>? predicate = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        params Expression<Func<TEntity, object>>[] includes)
    {
        IQueryable<TEntity> query = _dbSet;

        foreach (var include in includes)
        {
            query = query.Include(include);
        }

        if (predicate != null)
        {
            query = query.Where(predicate);
        }

        var totalCount = await query.CountAsync();

        if (orderBy != null)
        {
            query = orderBy(query);
        }
        else
        {
            query = query.OrderByDescending(e => e.CreatedAt);
        }

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    #endregion

    #region Helpers

    protected IQueryable<TEntity> GetQueryable() => _dbSet.AsQueryable();

    protected IQueryable<TEntity> ApplyIncludes(
        IQueryable<TEntity> query,
        params Expression<Func<TEntity, object>>[] includes)
    {
        foreach (var include in includes)
        {
            query = query.Include(include);
        }
        return query;
    }

    #endregion
}


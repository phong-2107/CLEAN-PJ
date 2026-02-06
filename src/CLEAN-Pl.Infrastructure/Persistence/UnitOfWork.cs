using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;
using CLEAN_Pl.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;

namespace CLEAN_Pl.Infrastructure.Persistence;

/// <summary>
/// Unit of Work implementation for managing transactions and coordinating repositories.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private IDbContextTransaction? _transaction;

    private IProductRepository? _products;
    private IUserRepository? _users;
    private IRoleRepository? _roles;
    private IPermissionRepository? _permissions;
    private ICategoryRepository? _categories;
    private IAuditLogRepository? _auditLogs;

    public UnitOfWork(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    #region Repositories

    public IProductRepository Products
    {
        get
        {
            _products ??= new ProductRepository(_context);
            return _products;
        }
    }

    public IUserRepository Users
    {
        get
        {
            _users ??= new UserRepository(_context, _configuration);
            return _users;
        }
    }
    public IRoleRepository Roles
    {
        get
        {
            _roles ??= new RoleRepository(_context);
            return _roles;
        }
    }

    public IPermissionRepository Permissions
    {
        get
        {
            _permissions ??= new PermissionRepository(_context);
            return _permissions;
        }
    }

    public ICategoryRepository Categories
    {
        get
        {
            _categories ??= new CategoryRepository(_context);
            return _categories;
        }
    }

    public IAuditLogRepository AuditLogs
    {
        get
        {
            _auditLogs ??= new AuditLogRepository(_context);
            return _auditLogs;
        }
    }

    #endregion

    #region Transaction Methods

    public async Task<int> CompleteAsync(CancellationToken ct = default)
    {
        return await _context.SaveChangesAsync(ct);
    }

    public async Task BeginTransactionAsync(CancellationToken ct = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(ct);
    }

    public async Task CommitAsync(CancellationToken ct = default)
    {
        try
        {
            await _context.SaveChangesAsync(ct);
            if (_transaction != null)
            {
                await _transaction.CommitAsync(ct);
            }
        }
        catch
        {
            await RollbackAsync(ct);
            throw;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    public async Task RollbackAsync(CancellationToken ct = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(ct);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    #endregion

    #region ExecuteInTransactionAsync

    public async Task ExecuteInTransactionAsync(Func<Task> action, CancellationToken ct = default)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await BeginTransactionAsync(ct);
            try
            {
                await action();
                await CommitAsync(ct);
            }
            catch
            {
                await RollbackAsync(ct);
                throw;
            }
        });
    }

    /// <summary>
    /// Executes an action within a transaction.
    /// </summary>
    public async Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> action, CancellationToken ct = default)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await BeginTransactionAsync(ct);
            try
            {
                var result = await action();
                await CommitAsync(ct);
                return result;
            }
            catch
            {
                await RollbackAsync(ct);
                throw;
            }
        });
    }

    #endregion

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}

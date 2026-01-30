using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;
using CLEAN_Pl.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace CLEAN_Pl.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    private IProductRepository? _products;
    private IUserRepository? _users;
    private IRoleRepository? _roles;
    private IPermissionRepository? _permissions;
    
    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }
    
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
            _users ??= new UserRepository(_context);
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
    
    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }
    
    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }
    
    public async Task CommitAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
            }
        }
        catch
        {
            await RollbackAsync();
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
    
    public async Task RollbackAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }
    
    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}

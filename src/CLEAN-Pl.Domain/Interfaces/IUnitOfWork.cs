namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// Unit of Work pattern - manages transactions across multiple repositories
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IProductRepository Products { get; }
    
    // Add more repositories here
    // IOrderRepository Orders { get; }
    // ICustomerRepository Customers { get; }
    
    /// <summary>
    /// Save all changes to the database
    /// </summary>
    Task<int> CompleteAsync();
    
    /// <summary>
    /// Begin a transaction
    /// </summary>
    Task BeginTransactionAsync();
    
    /// <summary>
    /// Commit the transaction
    /// </summary>
    Task CommitAsync();
    
    /// <summary>
    /// Rollback the transaction
    /// </summary>
    Task RollbackAsync();
}

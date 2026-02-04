namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// Unit of Work pattern interface for managing transactions and coordinating repositories.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IProductRepository Products { get; }
    IUserRepository Users { get; }
    IRoleRepository Roles { get; }
    IPermissionRepository Permissions { get; }
    ICategoryRepository Categories { get; }

    /// <summary>
    /// Saves all pending changes to the database.
    /// </summary>
    Task<int> CompleteAsync(CancellationToken ct = default);

    /// <summary>
    /// Begins a new database transaction.
    /// </summary>
    Task BeginTransactionAsync(CancellationToken ct = default);

    /// <summary>
    /// Commits the current transaction and saves all changes.
    /// </summary>
    Task CommitAsync(CancellationToken ct = default);

    /// <summary>
    /// Rolls back the current transaction, discarding all changes.
    /// </summary>
    Task RollbackAsync(CancellationToken ct = default);

    /// <summary>
    /// Executes an action within a transaction. Automatically commits on success, rolls back on exception.
    /// </summary>
    Task ExecuteInTransactionAsync(Func<Task> action, CancellationToken ct = default);

    /// <summary>
    /// Executes an action within a transaction and returns a result. Automatically commits on success, rolls back on exception.
    /// </summary>
    Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> action, CancellationToken ct = default);
}

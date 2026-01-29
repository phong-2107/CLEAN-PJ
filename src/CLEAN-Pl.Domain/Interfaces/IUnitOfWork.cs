namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// Unit of Work pattern - manages transactions across multiple repositories
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IProductRepository Products { get; }


    Task<int> CompleteAsync();
    Task BeginTransactionAsync();


    Task CommitAsync();

    Task RollbackAsync();
}

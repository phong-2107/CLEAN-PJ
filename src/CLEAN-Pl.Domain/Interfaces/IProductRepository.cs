using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// Product-specific repository operations.
/// </summary>
public interface IProductRepository : IBaseRepository<Product>
{
    /// <summary>
    /// Advanced pagination with product-specific filters.
    /// </summary>
    Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        bool? isActive = null,
        bool? inStock = null,
        string? sortBy = null,
        bool sortDescending = false);
}


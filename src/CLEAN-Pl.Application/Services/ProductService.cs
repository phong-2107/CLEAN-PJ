using AutoMapper;
using CLEAN_Pl.Application.Common;
using CLEAN_Pl.Application.DTOs.Product;
using CLEAN_Pl.Application.Exceptions;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CLEAN_Pl.Application.Services;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ProductService> _logger;

    public ProductService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<ProductService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync(CancellationToken ct = default)
    {
        var products = await _unitOfWork.Products.GetAllAsync(ct);
        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }

    public async Task<PagedResult<ProductDto>> GetPagedAsync(ProductQueryParameters parameters, CancellationToken ct = default)
    {
        var (items, totalCount) = await _unitOfWork.Products.GetPagedAsync(
            parameters.PageNumber,
            parameters.PageSize,
            parameters.SearchTerm,
            parameters.MinPrice,
            parameters.MaxPrice,
            parameters.IsActive,
            parameters.InStock,
            parameters.SortBy,
            parameters.SortDescending,
            ct
        );

        var dtos = _mapper.Map<IEnumerable<ProductDto>>(items);

        return new PagedResult<ProductDto>(dtos, totalCount, parameters.PageNumber, parameters.PageSize);
    }

    public async Task<ProductDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        if (id <= 0)
        {
            _logger.LogWarning("GetByIdAsync called with invalid id: {Id}", id);
            return null;
        }

        var product = await _unitOfWork.Products.GetByIdAsync(id, ct);
        return product == null ? null : _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken ct = default)
    {
        var product = Product.Create(dto.Name, dto.Description, dto.Price, dto.StockQuantity);
        var createdProduct = await _unitOfWork.Products.AddAsync(product, ct);
        await _unitOfWork.CompleteAsync(ct);

        _logger.LogInformation("Product created: {ProductId} - {ProductName}", createdProduct.Id, createdProduct.Name);
        return _mapper.Map<ProductDto>(createdProduct);
    }

    public async Task UpdateAsync(int id, UpdateProductDto dto, CancellationToken ct = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, ct);
        if (product == null)
        {
            _logger.LogWarning("Update failed: Product {Id} not found", id);
            throw new NotFoundException($"Product with ID {id} not found");
        }

        product.UpdateDetails(dto.Name, dto.Description, dto.Price);
        product.UpdateStock(dto.StockQuantity);

        await _unitOfWork.Products.UpdateAsync(product, ct);
        await _unitOfWork.CompleteAsync(ct);
        _logger.LogInformation("Product updated: {ProductId}", id);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var exists = await _unitOfWork.Products.ExistsAsync(id, ct);
        if (!exists)
        {
            _logger.LogWarning("Delete failed: Product {Id} not found", id);
            throw new NotFoundException($"Product with ID {id} not found");
        }

        await _unitOfWork.Products.DeleteAsync(id, ct);
        await _unitOfWork.CompleteAsync(ct);
        _logger.LogInformation("Product deleted: {ProductId}", id);
    }
}

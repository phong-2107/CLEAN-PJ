using AutoMapper;
using CLEAN_Pl.Application.DTOs.Product;
using CLEAN_Pl.Application.Exceptions;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CLEAN_Pl.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<ProductService> _logger;

    public ProductService(
        IProductRepository repository,
        IMapper mapper,
        ILogger<ProductService> logger)
    {
        _repository = repository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync()
    {
        var products = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {

        if (id <= 0)
        {
            _logger.LogWarning("GetByIdAsync called with invalid id: {Id}", id);
            return null;
        }

        var product = await _repository.GetByIdAsync(id);
        return product == null ? null : _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var product = Product.Create(dto.Name, dto.Description, dto.Price, dto.StockQuantity);
        var createdProduct = await _repository.AddAsync(product);

        _logger.LogInformation("Product created: {ProductId} - {ProductName}", createdProduct.Id, createdProduct.Name);
        return _mapper.Map<ProductDto>(createdProduct);
    }

    public async Task UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null)
        {
            _logger.LogWarning("Update failed: Product {Id} not found", id);
            throw new NotFoundException($"Product with ID {id} not found");
        }

        product.UpdateDetails(dto.Name, dto.Description, dto.Price);
        product.UpdateStock(dto.StockQuantity);

        await _repository.UpdateAsync(product);
        _logger.LogInformation("Product updated: {ProductId}", id);
    }

    public async Task DeleteAsync(int id)
    {
        // check exists trước khi delete - tránh exception từ DB
        var exists = await _repository.ExistsAsync(id);
        if (!exists)
        {
            _logger.LogWarning("Delete failed: Product {Id} not found", id);
            throw new NotFoundException($"Product with ID {id} not found");
        }

        await _repository.DeleteAsync(id);
        _logger.LogInformation("Product deleted: {ProductId}", id);
    }
}

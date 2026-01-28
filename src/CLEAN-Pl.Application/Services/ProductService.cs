using AutoMapper;
using CLEAN_Pl.Application.DTOs.Product;
using CLEAN_Pl.Application.Exceptions;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;

namespace CLEAN_Pl.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;
    private readonly IMapper _mapper;

    public ProductService(IProductRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync()
    {
        var products = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        var product = await _repository.GetByIdAsync(id);
        return product == null ? null : _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var product = Product.Create(dto.Name, dto.Description, dto.Price, dto.StockQuantity);
        var createdProduct = await _repository.AddAsync(product);
        return _mapper.Map<ProductDto>(createdProduct);
    }

    public async Task UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null)
            throw new NotFoundException($"Product with ID {id} not found");

        product.UpdateDetails(dto.Name, dto.Description, dto.Price);
        product.UpdateStock(dto.StockQuantity);

        await _repository.UpdateAsync(product);
    }

    public async Task DeleteAsync(int id)
    {
        var exists = await _repository.ExistsAsync(id);
        if (!exists)
            throw new NotFoundException($"Product with ID {id} not found");

        await _repository.DeleteAsync(id);
    }
}
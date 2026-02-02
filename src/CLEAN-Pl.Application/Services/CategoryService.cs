using AutoMapper;
using CLEAN_Pl.Application.DTOs.Category;
using CLEAN_Pl.Application.Exceptions;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CLEAN_Pl.Application.Services;


public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<CategoryService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync()
    {
        var categories = await _unitOfWork.Categories.GetAllAsync();
        return _mapper.Map<IEnumerable<CategoryDto>>(categories);
    }

    public async Task<IEnumerable<CategoryDto>> GetActiveAsync()
    {
        var categories = await _unitOfWork.Categories.GetActiveAsync();
        return _mapper.Map<IEnumerable<CategoryDto>>(categories);
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        if (id <= 0)
        {
            _logger.LogWarning("GetByIdAsync called with invalid id: {Id}", id);
            return null;
        }

        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        return category == null ? null : _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        // Check for duplicate name
        var existing = await _unitOfWork.Categories.GetByNameAsync(dto.Name);
        if (existing != null)
            throw new DuplicateException($"Category with name '{dto.Name}' already exists");

        // Validate parent category if provided
        if (dto.ParentCategoryId.HasValue)
        {
            var parent = await _unitOfWork.Categories.GetByIdAsync(dto.ParentCategoryId.Value);
            if (parent == null)
                throw new NotFoundException($"Parent category with id {dto.ParentCategoryId} not found");
        }

        var category = Category.Create(dto.Name, dto.Description, dto.ParentCategoryId);
        var created = await _unitOfWork.Categories.AddAsync(category);
        await _unitOfWork.CompleteAsync();

        _logger.LogInformation("Category created: {CategoryId} - {CategoryName}", created.Id, created.Name);
        return _mapper.Map<CategoryDto>(created);
    }

    public async Task UpdateAsync(int id, UpdateCategoryDto dto)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id)
            ?? throw new NotFoundException($"Category with id {id} not found");

        // Check for duplicate name (excluding current)
        var existing = await _unitOfWork.Categories.GetByNameAsync(dto.Name);
        if (existing != null && existing.Id != id)
            throw new DuplicateException($"Category with name '{dto.Name}' already exists");

        category.Update(dto.Name, dto.Description, dto.ParentCategoryId);
        await _unitOfWork.Categories.UpdateAsync(category);
        await _unitOfWork.CompleteAsync();

        _logger.LogInformation("Category updated: {CategoryId}", id);
    }

    public async Task DeleteAsync(int id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id)
            ?? throw new NotFoundException($"Category with id {id} not found");

        await _unitOfWork.Categories.DeleteAsync(category);
        await _unitOfWork.CompleteAsync();

        _logger.LogInformation("Category deleted: {CategoryId}", id);
    }

    public async Task ActivateAsync(int id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id)
            ?? throw new NotFoundException($"Category with id {id} not found");

        category.Activate();
        await _unitOfWork.Categories.UpdateAsync(category);
        await _unitOfWork.CompleteAsync();

        _logger.LogInformation("Category activated: {CategoryId}", id);
    }

    public async Task DeactivateAsync(int id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id)
            ?? throw new NotFoundException($"Category with id {id} not found");

        category.Deactivate();
        await _unitOfWork.Categories.UpdateAsync(category);
        await _unitOfWork.CompleteAsync();

        _logger.LogInformation("Category deactivated: {CategoryId}", id);
    }
}
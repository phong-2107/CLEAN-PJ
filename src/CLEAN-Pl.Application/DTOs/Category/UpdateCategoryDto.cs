namespace CLEAN_Pl.Application.DTOs.Category;

public sealed record UpdateCategoryDto(
    string Name,
    string? Description,
    int? ParentCategoryId = null);
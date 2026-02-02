namespace CLEAN_Pl.Application.DTOs.Category;

public sealed record CreateCategoryDto(
    string Name,
    string? Description = null,
    int? ParentCategoryId = null);
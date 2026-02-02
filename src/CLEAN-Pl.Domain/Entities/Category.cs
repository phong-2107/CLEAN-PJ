using CLEAN_Pl.Domain.Common;
using CLEAN_Pl.Domain.Exceptions;

namespace CLEAN_Pl.Domain.Entities;

public class Category : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }
    public int? ParentCategoryId { get; private set; }

    public virtual Category? ParentCategory { get; private set; }
    public virtual ICollection<Category> SubCategories { get; private set; } = new List<Category>();

    private Category() { }

    public static Category Create(string name, string? description = null, int? parentCategoryId = null)
    {
        ValidateName(name);
        return new Category
        {
            Name = name,
            Description = description,
            ParentCategoryId = parentCategoryId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(string name, string? description, int? parentCategoryId = null)
    {
        ValidateName(name);
        if (parentCategoryId.HasValue && parentCategoryId.Value == Id)
            throw new DomainException("Category cannot be its own parent");

        Name = name;
        Description = description;
        ParentCategoryId = parentCategoryId;
        SetUpdatedAt();
    }

    public void Activate() { IsActive = true; SetUpdatedAt(); }
    public void Deactivate() { IsActive = false; SetUpdatedAt(); }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Category name is required");
        if (name.Length < 2 || name.Length > 100)
            throw new DomainException("Category name must be between 2 and 100 characters");
    }
}

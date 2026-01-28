using CLEAN_Pl.Domain.Common;
using CLEAN_Pl.Domain.Exceptions;

namespace CLEAN_Pl.Domain.Entities;

public class Role : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsSystemRole { get; private set; }
    
    public virtual ICollection<UserRole> UserRoles { get; private set; } = new List<UserRole>();
    public virtual ICollection<RolePermission> RolePermissions { get; private set; } = new List<RolePermission>();

    private Role() { }

    public static Role Create(string name, string? description = null, bool isSystemRole = false)
    {
        ValidateName(name);

        return new Role
        {
            Name = name,
            Description = description,
            IsActive = true,
            IsSystemRole = isSystemRole,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(string name, string? description)
    {
        ValidateName(name);

        Name = name;
        Description = description;
        SetUpdatedAt();
    }

    public void Activate()
    {
        IsActive = true;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        if (IsSystemRole)
            throw new DomainException("Cannot deactivate system role");

        IsActive = false;
        SetUpdatedAt();
    }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Role name is required");

        if (name.Length < 2 || name.Length > 100)
            throw new DomainException("Role name must be between 2 and 100 characters");
    }
}
using CLEAN_Pl.Domain.Common;
using CLEAN_Pl.Domain.Exceptions;

namespace CLEAN_Pl.Domain.Entities;

public class Permission : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Resource { get; private set; } = string.Empty; 
    public string Action { get; private set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<RolePermission> RolePermissions { get; private set; } = new List<RolePermission>();

    private Permission() { }

    public static Permission Create(string name, string resource, string action, string? description = null)
    {
        ValidateName(name);
        ValidateResource(resource);
        ValidateAction(action);

        return new Permission
        {
            Name = name,
            Resource = resource,
            Action = action,
            Description = description,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(string name, string resource, string action, string? description)
    {
        ValidateName(name);
        ValidateResource(resource);
        ValidateAction(action);

        Name = name;
        Resource = resource;
        Action = action;
        Description = description;
        SetUpdatedAt();
    }

    public string GetPermissionString() => $"{Resource}.{Action}";

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Permission name is required");
    }

    private static void ValidateResource(string resource)
    {
        if (string.IsNullOrWhiteSpace(resource))
            throw new DomainException("Resource is required");
    }

    private static void ValidateAction(string action)
    {
        if (string.IsNullOrWhiteSpace(action))
            throw new DomainException("Action is required");
    }
}
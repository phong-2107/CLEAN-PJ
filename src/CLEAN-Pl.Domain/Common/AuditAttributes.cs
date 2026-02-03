namespace CLEAN_Pl.Domain.Common;

/// <summary>
/// Marker interface to indicate an entity should be audited.
/// Only entities implementing this interface will have audit logs created.
/// </summary>
public interface IAuditableEntity
{
}

[AttributeUsage(AttributeTargets.Property, Inherited = true)]
public sealed class AuditIgnoreAttribute : Attribute
{
}

[AttributeUsage(AttributeTargets.Class, Inherited = true)]
public sealed class AuditableAttribute : Attribute
{
    public bool DeleteOnly { get; set; }
    public bool MetadataOnly { get; set; }
}

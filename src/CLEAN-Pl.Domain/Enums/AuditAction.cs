namespace CLEAN_Pl.Domain.Enums;

// Defines the type of action performed on an entity for audit logging.
public enum AuditAction
{
    Create = 1,
    Update = 2,
    Delete = 3,
    GrantPermission = 4,
    DenyPermission = 5,
    RevokePermission = 6
}

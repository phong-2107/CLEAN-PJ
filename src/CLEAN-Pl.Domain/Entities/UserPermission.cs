using CLEAN_Pl.Domain.Exceptions;

namespace CLEAN_Pl.Domain.Entities;

/// <summary>
/// Represents user-specific permission override (Grant/Deny).
/// Allows admin to customize permissions beyond role-based defaults.
/// Implements Hybrid RBAC + ABAC pattern with audit trail.
/// </summary>
public class UserPermission
{
    public int UserId { get; private set; }
    public int PermissionId { get; private set; }
    
    /// <summary>
    /// true = Explicitly Granted, false = Explicitly Denied.
    /// Precedence: DENY > GRANT > ROLE
    /// </summary>
    public bool IsGranted { get; private set; }
    
    public string? Reason { get; private set; }
    public DateTime AssignedAt { get; private set; }
    public int AssignedByUserId { get; private set; }
    
    // Soft delete pattern for audit trail
    public DateTime? RevokedAt { get; private set; }
    public int? RevokedByUserId { get; private set; }
    
    // Navigation properties
    public virtual User User { get; private set; } = null!;
    public virtual Permission Permission { get; private set; } = null!;
    public virtual User AssignedBy { get; private set; } = null!;
    public virtual User? RevokedBy { get; private set; }

    private UserPermission() { }

    /// <summary>
    /// Factory method: Grant a permission to user (add permission beyond their role).
    /// </summary>
    public static UserPermission Grant(
        int userId,
        int permissionId,
        int assignedByUserId,
        string? reason = null)
    {
        ValidateUserId(userId);
        ValidatePermissionId(permissionId);
        ValidateAssignedByUserId(assignedByUserId);
        ValidateReason(reason);

        return new UserPermission
        {
            UserId = userId,
            PermissionId = permissionId,
            IsGranted = true,
            Reason = reason,
            AssignedAt = DateTime.UtcNow,
            AssignedByUserId = assignedByUserId
        };
    }

    /// <summary>
    /// Factory method: Deny a permission to user (revoke permission from their role).
    /// </summary>
    public static UserPermission Deny(
        int userId,
        int permissionId,
        int assignedByUserId,
        string? reason = null)
    {
        ValidateUserId(userId);
        ValidatePermissionId(permissionId);
        ValidateAssignedByUserId(assignedByUserId);
        ValidateReason(reason);

        return new UserPermission
        {
            UserId = userId,
            PermissionId = permissionId,
            IsGranted = false,
            Reason = reason,
            AssignedAt = DateTime.UtcNow,
            AssignedByUserId = assignedByUserId
        };
    }

    /// <summary>
    /// Revoke this permission override (restore to role-based state).
    /// Implements soft delete for audit trail.
    /// </summary>
    public void Revoke(int revokedByUserId)
    {
        if (RevokedAt.HasValue)
            throw new DomainException("Permission override already revoked");

        if (revokedByUserId <= 0)
            throw new DomainException("Invalid revokedByUserId");

        RevokedAt = DateTime.UtcNow;
        RevokedByUserId = revokedByUserId;
    }

    public bool IsActive() => !RevokedAt.HasValue;

    // Validation methods
    private static void ValidateUserId(int userId)
    {
        if (userId <= 0)
            throw new DomainException("UserId must be greater than 0");
    }

    private static void ValidatePermissionId(int permissionId)
    {
        if (permissionId <= 0)
            throw new DomainException("PermissionId must be greater than 0");
    }

    private static void ValidateAssignedByUserId(int assignedByUserId)
    {
        if (assignedByUserId <= 0)
            throw new DomainException("AssignedByUserId must be greater than 0");
    }

    private static void ValidateReason(string? reason)
    {
        if (reason != null && reason.Length > 500)
            throw new DomainException("Reason cannot exceed 500 characters");
    }
}

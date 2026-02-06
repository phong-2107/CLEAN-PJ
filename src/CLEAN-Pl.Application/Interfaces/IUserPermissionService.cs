using CLEAN_Pl.Application.DTOs.User;

namespace CLEAN_Pl.Application.Interfaces;

/// <summary>
/// Service for managing user-specific permission overrides (Hybrid RBAC + ABAC).
/// Allows admins to grant/deny permissions beyond role-based defaults.
/// </summary>
public interface IUserPermissionService
{
    /// <summary>
    /// Get effective permissions that user currently has.
    /// Formula: Role Permissions UNION Granted UserPermissions.
    /// Use for: Authorization checks, permission display.
    /// </summary>
    Task<UserEffectivePermissionsDto> GetEffectivePermissionsAsync(
        int userId, 
        CancellationToken ct = default);
    
    /// <summary>
    /// Get permissions that user does NOT have.
    /// Formula: All Permissions - Effective Permissions.
    /// Use for: Admin UI to show available permissions for granting.
    /// </summary>
    Task<UserMissingPermissionsDto> GetMissingPermissionsAsync(
        int userId, 
        CancellationToken ct = default);
    
    /// <summary>
    /// Get all active permission overrides for a user.
    /// </summary>
    Task<IEnumerable<UserPermissionDto>> GetUserPermissionOverridesAsync(
        int userId, 
        CancellationToken ct = default);
    
    /// <summary>
    /// Get detailed permission analysis showing source (role vs override).
    /// </summary>
    Task<UserPermissionDetailDto> GetUserPermissionDetailsAsync(
        int userId, 
        CancellationToken ct = default);
    
    /// <summary>
    /// Grant a permission to user (add permission beyond their role).
    /// </summary>
    Task GrantPermissionAsync(
        int userId, 
        int permissionId, 
        int grantedByUserId, 
        string? reason = null, 
        CancellationToken ct = default);
    
    /// <summary>
    /// Deny a permission for user (revoke permission from their role).
    /// </summary>
    Task DenyPermissionAsync(
        int userId, 
        int permissionId, 
        int deniedByUserId, 
        string? reason = null, 
        CancellationToken ct = default);
    
    /// <summary>
    /// Revoke permission override (restore to role-based state).
    /// </summary>
    Task RevokePermissionAsync(
        int userId, 
        int permissionId, 
        int revokedByUserId, 
        CancellationToken ct = default);
}

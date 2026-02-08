namespace CLEAN_Pl.Application.DTOs.User;

/// <summary>
/// DTO for user-specific permission override (grant/deny).
/// </summary>
public sealed record UserPermissionDto(
    int PermissionId,
    string PermissionName,
    string Resource,
    string Action,
    bool IsGranted,
    string? Reason,
    DateTime AssignedAt,
    string AssignedByUsername
);

/// <summary>
/// Request to grant a permission to a specific user.
/// </summary>
public sealed record GrantUserPermissionRequest(
    int PermissionId,
    string? Reason
);

/// <summary>
/// Request to deny a permission for a specific user.
/// </summary>
public sealed record DenyUserPermissionRequest(
    int PermissionId,
    string? Reason
);

/// <summary>
/// Detailed view of user's effective permissions with sources.
/// </summary>
public sealed record UserPermissionDetailDto(
    int UserId,
    string Username,
    IEnumerable<PermissionSourceDto> Permissions
);

/// <summary>
/// Permission with its source (Role, Granted, or Denied).
/// </summary>
public sealed record PermissionSourceDto(
    int PermissionId,
    string PermissionName,
    string Resource,
    string Action,
    string Source, // "Role", "Granted", "Denied"
    string? SourceDetails // Role name or Reason
);

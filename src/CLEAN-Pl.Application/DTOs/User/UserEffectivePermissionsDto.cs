namespace CLEAN_Pl.Application.DTOs.User;

/// <summary>
/// Effective permissions that user currently has.
/// Formula: Role Permissions UNION Granted UserPermissions.
/// </summary>
public sealed record UserEffectivePermissionsDto(
    int UserId,
    string Username,
    IEnumerable<UserEffectivePermissionItemDto> Permissions,
    PermissionStatistics Statistics
);

public sealed record UserEffectivePermissionItemDto(
    int Id,
    string Name,
    string Resource,
    string Action,
    string Source // "Role" or "DirectGrant"
);

public sealed record PermissionStatistics(
    int FromRoles,
    int FromDirectGrants,
    int TotalUnique
);
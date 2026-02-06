namespace CLEAN_Pl.Application.DTOs.User;

/// <summary>
/// Permissions that user does NOT have.
/// Formula: All Permissions - (Role Permissions UNION Granted UserPermissions).
/// </summary>
public sealed record UserMissingPermissionsDto(
    int UserId,
    string Username,
    IEnumerable<MissingPermissionItemDto> MissingPermissions,
    MissingPermissionStatistics Statistics
);

public sealed record MissingPermissionItemDto(
    int Id,
    string Name,
    string Resource,
    string Action
);

public sealed record MissingPermissionStatistics(
    int TotalPermissions,
    int UserHasPermissions,
    int MissingPermissions
);

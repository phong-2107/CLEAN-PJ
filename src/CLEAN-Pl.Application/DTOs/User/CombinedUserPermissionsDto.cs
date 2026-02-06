namespace CLEAN_Pl.Application.DTOs.User;

/// <summary>
/// Combined permissions from roles and user-specific overrides.
/// </summary>
public sealed record CombinedUserPermissionsDto(
    int UserId,
    string Username,
    IEnumerable<PermissionDto> Permissions,
    PermissionBreakdown Breakdown
);

public sealed record PermissionBreakdown(
    int FromRoles,
    int Granted,
    int Denied,
    int Total
);

public sealed record PermissionDto(
    int Id,
    string Name,
    string Resource,
    string Action,
    string Source
);
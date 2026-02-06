using CLEAN_Pl.API.Attributes;
using CLEAN_Pl.Application.DTOs.User;
using CLEAN_Pl.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CLEAN_Pl.API.Controllers;

[ApiController]
[Route("api/users/{userId:int}/permissions")]
[Authorize]
public class UserPermissionsController(IUserPermissionService permissionService) : ControllerBase
{
    /// <summary>
    /// Get effective permissions that user currently has.
    /// Returns: Role Permissions + Direct Granted Permissions (supplementary).
    /// Use for: Authorization checks, permission display in UI.
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="ct">Cancellation token</param>
    [HttpGet("effective")]
    [Permission("User.ReadPermissions")]
    [ProducesResponseType(typeof(UserEffectivePermissionsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetEffectivePermissions(
        int userId,
        CancellationToken ct)
    {
        var result = await permissionService.GetEffectivePermissionsAsync(userId, ct);
        return Ok(result);
    }

    /// <summary>
    /// Get permissions that user does NOT have.
    /// Returns: All Permissions - (Role Permissions + Direct Granted Permissions).
    /// Use for: Admin UI to show available permissions for granting to user.
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="ct">Cancellation token</param>
    [HttpGet("missing")]
    [Permission("User.ReadPermissions")]
    [ProducesResponseType(typeof(UserMissingPermissionsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMissingPermissions(
        int userId,
        CancellationToken ct)
    {
        var result = await permissionService.GetMissingPermissionsAsync(userId, ct);
        return Ok(result);
    }

    /// <summary>
    /// Get user-specific permission overrides (grants/denies).
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="ct">Cancellation token</param>
    [HttpGet("overrides")]
    [Permission("User.ReadPermissions")]
    [ProducesResponseType(typeof(IEnumerable<UserPermissionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserPermissionOverrides(
        int userId,
        CancellationToken ct)
    {
        var overrides = await permissionService.GetUserPermissionOverridesAsync(userId, ct);
        return Ok(overrides);
    }

    /// <summary>
    /// Get detailed permission analysis (role + overrides with sources).
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="ct">Cancellation token</param>
    [HttpGet("details")]
    [Permission("User.ReadPermissions")]
    [ProducesResponseType(typeof(UserPermissionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserPermissionDetails(
        int userId,
        CancellationToken ct)
    {
        var details = await permissionService.GetUserPermissionDetailsAsync(userId, ct);
        return Ok(details);
    }

    /// <summary>
    /// Grant a specific permission to a user (beyond their roles).
    /// Example: Staff normally can't delete products, but admin grants temporary access.
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="request">Grant request with permission ID and reason</param>
    /// <param name="ct">Cancellation token</param>
    [HttpPost("grant")]
    [Permission("User.GrantPermission")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GrantPermission(
        int userId,
        [FromBody] GrantUserPermissionRequest request,
        CancellationToken ct)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        await permissionService.GrantPermissionAsync(
            userId,
            request.PermissionId,
            currentUserId,
            request.Reason,
            ct);

        return Ok(new { Message = "Permission granted successfully" });
    }

    /// <summary>
    /// Deny a specific permission for a user (override role permission).
    /// Example: Admin has delete rights, but we deny it for a junior admin.
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="request">Deny request with permission ID and reason</param>
    /// <param name="ct">Cancellation token</param>
    [HttpPost("deny")]
    [Permission("User.DenyPermission")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DenyPermission(
        int userId,
        [FromBody] DenyUserPermissionRequest request,
        CancellationToken ct)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        await permissionService.DenyPermissionAsync(
            userId,
            request.PermissionId,
            currentUserId,
            request.Reason,
            ct);

        return Ok(new { Message = "Permission denied successfully" });
    }

    /// <summary>
    /// Revoke a permission override (restore to role-based state).
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="permissionId">Permission ID to revoke</param>
    /// <param name="ct">Cancellation token</param>
    [HttpDelete("{permissionId:int}")]
    [Permission("User.RevokePermission")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RevokePermission(
        int userId,
        int permissionId,
        CancellationToken ct)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        await permissionService.RevokePermissionAsync(
            userId,
            permissionId,
            currentUserId,
            ct);

        return Ok(new { Message = "Permission override revoked successfully" });
    }
}

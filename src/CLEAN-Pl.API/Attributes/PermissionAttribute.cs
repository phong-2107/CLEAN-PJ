using CLEAN_Pl.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace CLEAN_Pl.API.Attributes;

/// <summary>
/// Authorization filter that checks if the current user has the required permission.
/// Permission string format: "Resource.Action" (e.g., "Product.Read", "User.Create")
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class PermissionAttribute : Attribute, IAsyncAuthorizationFilter
{
    /// <summary>
    /// Gets the permission string (e.g., "Product.Read").
    /// Made public for reflection-based auto-discovery by PermissionDiscoveryService.
    /// </summary>
    public string Permission { get; }

    public PermissionAttribute(string permission)
    {
        Permission = permission;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var cacheService = context.HttpContext.RequestServices
            .GetService<IPermissionCacheService>();

        if (cacheService == null)
        {
            context.Result = new StatusCodeResult(500);
            return;
        }

        var userPermissions = await cacheService.GetUserPermissionsAsync(userId);
        var hasPermission = userPermissions.Contains(Permission);

        if (!hasPermission)
        {
            context.Result = new ForbidResult();
        }
    }
}

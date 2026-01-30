using CLEAN_Pl.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace CLEAN_Pl.API.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class PermissionAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string _permission;

    public PermissionAttribute(string permission)
    {
        _permission = permission;
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
        var hasPermission = userPermissions.Contains(_permission);

        if (!hasPermission)
        {
            context.Result = new ForbidResult();
        }
    }
}

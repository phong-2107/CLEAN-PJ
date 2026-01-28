using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CLEAN_Pl.API.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class PermissionAttribute : Attribute, IAuthorizationFilter
{
    private readonly string _permission;

    public PermissionAttribute(string permission)
    {
        _permission = permission;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var hasPermission = user.Claims.Any(c =>
            c.Type == "Permission" && c.Value == _permission);

        if (!hasPermission)
        {
            context.Result = new ForbidResult();
        }
    }
}
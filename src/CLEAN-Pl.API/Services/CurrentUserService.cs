using System.Security.Claims;
using CLEAN_Pl.Application.Interfaces;

namespace CLEAN_Pl.API.Services;

/// <summary>
/// Service that provides current authenticated user information from HttpContext.
/// Used for audit logging and authorization.
/// </summary>
public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public string? UserId => User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? UserName => User?.FindFirstValue(ClaimTypes.Name);

    public string? Email => User?.FindFirstValue(ClaimTypes.Email);

    public string? IpAddress => GetClientIpAddress();

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    private string? GetClientIpAddress()
    {
        var context = httpContextAccessor.HttpContext;
        if (context is null) return null;

        // Check for forwarded IP (behind proxy/load balancer)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',').FirstOrDefault()?.Trim();
        }

        // Fallback to direct connection IP
        return context.Connection.RemoteIpAddress?.ToString();
    }
}

using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace CLEAN_Pl.Application.Services;

/// Cache service for permissions to optimize performance
public class PermissionCacheService : IPermissionCacheService
{
    private readonly IMemoryCache _cache;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PermissionCacheService> _logger;
    
    private const string USER_PERMISSIONS_KEY_PREFIX = "user_perms_";
    private const string USER_ROLES_KEY_PREFIX = "user_roles_";
    private const int CACHE_DURATION_MINUTES = 30;

    public PermissionCacheService(
        IMemoryCache cache, 
        IUnitOfWork unitOfWork,
        ILogger<PermissionCacheService> logger)
    {
        _cache = cache;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<string>> GetUserPermissionsAsync(int userId)
    {
        var cacheKey = $"{USER_PERMISSIONS_KEY_PREFIX}{userId}";
        
        if (_cache.TryGetValue(cacheKey, out IEnumerable<string>? cachedPermissions) && cachedPermissions != null)
        {
            _logger.LogDebug("Permission cache HIT for user {UserId}", userId);
            return cachedPermissions;
        }

        _logger.LogDebug("Permission cache MISS for user {UserId}, fetching from database", userId);
        
        var permissions = await _unitOfWork.Users.GetUserPermissionsAsync(userId);
        var permissionStrings = permissions.Select(p => p.GetPermissionString()).ToList();
        
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES))
            .SetPriority(CacheItemPriority.Normal);
        
        _cache.Set(cacheKey, permissionStrings, cacheOptions);
        
        return permissionStrings;
    }

    public async Task<IEnumerable<string>> GetUserRolesAsync(int userId)
    {
        var cacheKey = $"{USER_ROLES_KEY_PREFIX}{userId}";
        
        if (_cache.TryGetValue(cacheKey, out IEnumerable<string>? cachedRoles) && cachedRoles != null)
        {
            _logger.LogDebug("Roles cache HIT for user {UserId}", userId);
            return cachedRoles;
        }

        _logger.LogDebug("Roles cache MISS for user {UserId}, fetching from database", userId);
        
        var roles = await _unitOfWork.Users.GetUserRolesAsync(userId);
        var roleNames = roles.Select(r => r.Name).ToList();
        
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES))
            .SetPriority(CacheItemPriority.Normal);
        
        _cache.Set(cacheKey, roleNames, cacheOptions);
        
        return roleNames;
    }

    public void InvalidateUserCache(int userId)
    {
        _cache.Remove($"{USER_PERMISSIONS_KEY_PREFIX}{userId}");
        _cache.Remove($"{USER_ROLES_KEY_PREFIX}{userId}");
        _logger.LogInformation("Cache invalidated for user {UserId}", userId);
    }

    public void InvalidateAllUsersCache()
    {
        _logger.LogWarning("InvalidateAllUsersCache called - consider implementing CancellationToken pattern for production");
    }
}

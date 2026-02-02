namespace CLEAN_Pl.Application.Interfaces;

public interface IPermissionCacheService
{
    Task<IEnumerable<string>> GetUserPermissionsAsync(int userId);
    Task<IEnumerable<string>> GetUserRolesAsync(int userId);
    void InvalidateUserCache(int userId);
    void InvalidateAllUsersCache();
}

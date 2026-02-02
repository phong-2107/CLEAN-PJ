using CLEAN_Pl.Application.DTOs.Permission;

namespace CLEAN_Pl.Application.Interfaces;

public interface IPermissionService
{
    Task<IEnumerable<PermissionDto>> GetAllAsync();
    Task<PermissionDto?> GetByIdAsync(int id);
    Task<IEnumerable<PermissionDto>> GetByResourceAsync(string resource);
}
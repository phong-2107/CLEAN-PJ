using AutoMapper;
using CLEAN_Pl.Application.DTOs.Permission;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Interfaces;

namespace CLEAN_Pl.Application.Services;

public class PermissionService : IPermissionService
{
    private readonly IPermissionRepository _permissionRepository;
    private readonly IMapper _mapper;

    public PermissionService(IPermissionRepository permissionRepository, IMapper mapper)
    {
        _permissionRepository = permissionRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PermissionDto>> GetAllAsync()
    {
        var permissions = await _permissionRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<PermissionDto>>(permissions);
    }

    public async Task<PermissionDto?> GetByIdAsync(int id)
    {
        var permission = await _permissionRepository.GetByIdAsync(id);
        return permission == null ? null : _mapper.Map<PermissionDto>(permission);
    }

    public async Task<IEnumerable<PermissionDto>> GetByResourceAsync(string resource)
    {
        var permissions = await _permissionRepository.GetByResourceAsync(resource);
        return _mapper.Map<IEnumerable<PermissionDto>>(permissions);
    }
}   
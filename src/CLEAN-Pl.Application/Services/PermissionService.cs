using AutoMapper;
using CLEAN_Pl.Application.DTOs.Permission;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Interfaces;

namespace CLEAN_Pl.Application.Services;

public class PermissionService : IPermissionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public PermissionService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PermissionDto>> GetAllAsync()
    {
        var permissions = await _unitOfWork.Permissions.GetAllAsync();
        return _mapper.Map<IEnumerable<PermissionDto>>(permissions);
    }

    public async Task<PermissionDto?> GetByIdAsync(int id)
    {
        var permission = await _unitOfWork.Permissions.GetByIdAsync(id);
        return permission == null ? null : _mapper.Map<PermissionDto>(permission);
    }

    public async Task<IEnumerable<PermissionDto>> GetByResourceAsync(string resource)
    {
        var permissions = await _unitOfWork.Permissions.GetByResourceAsync(resource);
        return _mapper.Map<IEnumerable<PermissionDto>>(permissions);
    }
}
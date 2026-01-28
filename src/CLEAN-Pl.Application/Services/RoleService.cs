using AutoMapper;
using CLEAN_Pl.Application.DTOs.Role;
using CLEAN_Pl.Application.Exceptions;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;

namespace CLEAN_Pl.Application.Services;

public class RoleService : IRoleService
{
    private readonly IRoleRepository _roleRepository;
    private readonly IPermissionRepository _permissionRepository;
    private readonly IMapper _mapper;

    public RoleService(
        IRoleRepository roleRepository,
        IPermissionRepository permissionRepository,
        IMapper mapper)
    {
        _roleRepository = roleRepository;
        _permissionRepository = permissionRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<RoleDto>> GetAllAsync()
    {
        var roles = await _roleRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<RoleDto>>(roles);
    }

    public async Task<RoleDto?> GetByIdAsync(int id)
    {
        var role = await _roleRepository.GetByIdAsync(id);
        return role == null ? null : _mapper.Map<RoleDto>(role);
    }

    public async Task<RoleDto> CreateAsync(CreateRoleDto dto)
    {
        if (await _roleRepository.NameExistsAsync(dto.Name))
            throw new DuplicateException("Role", nameof(dto.Name), dto.Name);

        var role = Role.Create(dto.Name, dto.Description);
        await _roleRepository.AddAsync(role);

        // Assign permissions
        foreach (var permissionId in dto.PermissionIds)
        {
            if (!await _permissionRepository.ExistsAsync(permissionId))
                throw new NotFoundException($"Permission with ID {permissionId} not found");

            await _roleRepository.AddRolePermissionAsync(
                RolePermission.Create(role.Id, permissionId));
        }

        return _mapper.Map<RoleDto>(role);
    }

    public async Task UpdateAsync(int id, CreateRoleDto dto)
    {
        var role = await _roleRepository.GetByIdAsync(id);
        if (role == null)
            throw new NotFoundException($"Role with ID {id} not found");

        role.Update(dto.Name, dto.Description);
        await _roleRepository.UpdateAsync(role);
    }

    public async Task DeleteAsync(int id)
    {
        var role = await _roleRepository.GetByIdAsync(id);
        if (role == null)
            throw new NotFoundException($"Role with ID {id} not found");

        if (role.IsSystemRole)
            throw new ForbiddenException("Cannot delete system role");

        await _roleRepository.DeleteAsync(id);
    }

    public async Task AssignPermissionAsync(int roleId, int permissionId)
    {
        if (!await _roleRepository.ExistsAsync(roleId))
            throw new NotFoundException($"Role with ID {roleId} not found");

        if (!await _permissionRepository.ExistsAsync(permissionId))
            throw new NotFoundException($"Permission with ID {permissionId} not found");

        await _roleRepository.AddRolePermissionAsync(
            RolePermission.Create(roleId, permissionId));
    }

    public async Task RemovePermissionAsync(int roleId, int permissionId)
    {
        if (!await _roleRepository.ExistsAsync(roleId))
            throw new NotFoundException($"Role with ID {roleId} not found");

        await _roleRepository.RemoveRolePermissionAsync(roleId, permissionId);
    }
}
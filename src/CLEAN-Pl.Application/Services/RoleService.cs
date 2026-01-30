using AutoMapper;
using CLEAN_Pl.Application.DTOs.Role;
using CLEAN_Pl.Application.Exceptions;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CLEAN_Pl.Application.Services;

public class RoleService : IRoleService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<RoleService> _logger;

    public RoleService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<RoleService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<RoleDto>> GetAllAsync()
    {
        // include inactive = false, chỉ lấy role active
        var roles = await _unitOfWork.Roles.GetAllAsync();
        return _mapper.Map<IEnumerable<RoleDto>>(roles);
    }

    public async Task<RoleDto?> GetByIdAsync(int id)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(id);
        return role == null ? null : _mapper.Map<RoleDto>(role);
    }

    public async Task<RoleDto> CreateAsync(CreateRoleDto dto)
    {
        if (await _unitOfWork.Roles.NameExistsAsync(dto.Name))
            throw new DuplicateException("Role", nameof(dto.Name), dto.Name);

        var role = Role.Create(dto.Name, dto.Description);
        await _unitOfWork.Roles.AddAsync(role);

        // Assign permissions
        foreach (var permissionId in dto.PermissionIds)
        {
            if (!await _unitOfWork.Permissions.ExistsAsync(permissionId))
                throw new NotFoundException($"Permission with ID {permissionId} not found");

            await _unitOfWork.Roles.AddRolePermissionAsync(
                RolePermission.Create(role.Id, permissionId));
        }

        await _unitOfWork.CompleteAsync();
        return _mapper.Map<RoleDto>(role);
    }

    public async Task UpdateAsync(int id, CreateRoleDto dto)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(id);
        if (role == null)
            throw new NotFoundException($"Role with ID {id} not found");

        role.Update(dto.Name, dto.Description);
        await _unitOfWork.Roles.UpdateAsync(role);
        await _unitOfWork.CompleteAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(id);
        if (role == null)
            throw new NotFoundException($"Role với ID {id} không tồn tại");

        // QUAN TRỌNG: không cho xóa system role 
        if (role.IsSystemRole)
        {
            _logger.LogWarning("Attempted to delete system role: {RoleName}", role.Name);
            throw new ForbiddenException("Không thể xóa system role");
        }

        await _unitOfWork.Roles.DeleteAsync(id);
        await _unitOfWork.CompleteAsync();
        _logger.LogInformation("Role deleted: {RoleId} - {RoleName}", id, role.Name);
    }

    public async Task AssignPermissionAsync(int roleId, int permissionId)
    {
        if (!await _unitOfWork.Roles.ExistsAsync(roleId))
            throw new NotFoundException($"Role with ID {roleId} not found");

        if (!await _unitOfWork.Permissions.ExistsAsync(permissionId))
            throw new NotFoundException($"Permission with ID {permissionId} not found");

        await _unitOfWork.Roles.AddRolePermissionAsync(
            RolePermission.Create(roleId, permissionId));
        await _unitOfWork.CompleteAsync();
    }

    public async Task RemovePermissionAsync(int roleId, int permissionId)
    {
        if (!await _unitOfWork.Roles.ExistsAsync(roleId))
            throw new NotFoundException($"Role with ID {roleId} not found");

        await _unitOfWork.Roles.RemoveRolePermissionAsync(roleId, permissionId);
        await _unitOfWork.CompleteAsync();
    }
}
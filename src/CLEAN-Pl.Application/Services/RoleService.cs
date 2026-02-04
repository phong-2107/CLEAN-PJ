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

    public async Task<IEnumerable<RoleDto>> GetAllAsync(CancellationToken ct = default)
    {
        var roles = await _unitOfWork.Roles.GetAllAsync(false, ct);
        return _mapper.Map<IEnumerable<RoleDto>>(roles);
    }

    public async Task<RoleDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(id, ct);
        return role == null ? null : _mapper.Map<RoleDto>(role);
    }

    public async Task<RoleDto> CreateAsync(CreateRoleDto dto, CancellationToken ct = default)
    {
        if (await _unitOfWork.Roles.NameExistsAsync(dto.Name, ct))
            throw new DuplicateException("Role", nameof(dto.Name), dto.Name);

        return await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var role = Role.Create(dto.Name, dto.Description);
            await _unitOfWork.Roles.AddAsync(role, ct);
            await _unitOfWork.CompleteAsync(ct);

            var permissionStrings = new List<string>();
            if (dto.PermissionIds.Any())
            {
                foreach (var permissionId in dto.PermissionIds)
                {
                    var permission = await _unitOfWork.Permissions.GetByIdAsync(permissionId, ct);
                    if (permission == null)
                        throw new NotFoundException($"Permission with ID {permissionId} not found");

                    permissionStrings.Add(permission.GetPermissionString());
                    await _unitOfWork.Roles.AddRolePermissionAsync(
                        RolePermission.Create(role.Id, permissionId), ct);
                }
            }

            await _unitOfWork.CompleteAsync(ct);

            return new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                IsActive = role.IsActive,
                IsSystemRole = role.IsSystemRole,
                Permissions = permissionStrings
            };
        }, ct);
    }

    public async Task UpdateAsync(int id, CreateRoleDto dto, CancellationToken ct = default)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(id, ct);
        if (role == null)
            throw new NotFoundException($"Role with ID {id} not found");

        role.Update(dto.Name, dto.Description);
        await _unitOfWork.Roles.UpdateAsync(role, ct);
        await _unitOfWork.CompleteAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var role = await _unitOfWork.Roles.GetByIdAsync(id, ct);
        if (role == null)
            throw new NotFoundException($"Role với ID {id} không tồn tại");

        if (role.IsSystemRole)
        {
            _logger.LogWarning("Attempted to delete system role: {RoleName}", role.Name);
            throw new ForbiddenException("Không thể xóa system role");
        }

        await _unitOfWork.Roles.DeleteAsync(id, ct);
        await _unitOfWork.CompleteAsync(ct);
        _logger.LogInformation("Role deleted: {RoleId} - {RoleName}", id, role.Name);
    }

    public async Task AssignPermissionAsync(int roleId, int permissionId, CancellationToken ct = default)
    {
        if (!await _unitOfWork.Roles.ExistsAsync(roleId, ct))
            throw new NotFoundException($"Role with ID {roleId} not found");

        if (!await _unitOfWork.Permissions.ExistsAsync(permissionId, ct))
            throw new NotFoundException($"Permission with ID {permissionId} not found");

        await _unitOfWork.Roles.AddRolePermissionAsync(
            RolePermission.Create(roleId, permissionId), ct);
        await _unitOfWork.CompleteAsync(ct);
    }

    public async Task RemovePermissionAsync(int roleId, int permissionId, CancellationToken ct = default)
    {
        if (!await _unitOfWork.Roles.ExistsAsync(roleId, ct))
            throw new NotFoundException($"Role with ID {roleId} not found");

        await _unitOfWork.Roles.RemoveRolePermissionAsync(roleId, permissionId, ct);
        await _unitOfWork.CompleteAsync(ct);
    }
}
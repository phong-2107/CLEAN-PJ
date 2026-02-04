using AutoMapper;
using CLEAN_Pl.Application.Common;
using CLEAN_Pl.Application.DTOs.User;
using CLEAN_Pl.Application.Exceptions;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CLEAN_Pl.Application.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPermissionCacheService _cacheService;
    private readonly IMapper _mapper;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUnitOfWork unitOfWork,
        IPermissionCacheService cacheService,
        IMapper mapper,
        ILogger<UserService> logger)
    {
        _unitOfWork = unitOfWork;
        _cacheService = cacheService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync(CancellationToken ct = default)
    {
        var users = await _unitOfWork.Users.GetAllAsync(false, ct);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<PagedResult<UserDto>> GetPagedAsync(UserQueryParameters parameters, CancellationToken ct = default)
    {
        var (items, totalCount) = await _unitOfWork.Users.GetPagedAsync(
            parameters.PageNumber,
            parameters.PageSize,
            parameters.SearchTerm,
            parameters.IsActive,
            parameters.RoleId,
            parameters.SortBy,
            parameters.SortDescending,
            ct
        );

        var dtos = _mapper.Map<IEnumerable<UserDto>>(items);

        return new PagedResult<UserDto>(dtos, totalCount, parameters.PageNumber, parameters.PageSize);
    }

    public async Task<UserDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, ct);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto, CancellationToken ct = default)
    {
        if (await _unitOfWork.Users.UsernameExistsAsync(dto.Username, ct))
            throw new DuplicateException("User", nameof(dto.Username), dto.Username);

        if (await _unitOfWork.Users.EmailExistsAsync(dto.Email, ct))
            throw new DuplicateException("User", nameof(dto.Email), dto.Email);

        return await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            var user = User.Create(dto.Username, dto.Email, passwordHash, dto.FirstName, dto.LastName);
            await _unitOfWork.Users.AddAsync(user, ct);
            await _unitOfWork.CompleteAsync(ct);

            var roleNames = new List<string>();
            if (dto.RoleIds != null && dto.RoleIds.Any())
            {
                foreach (var roleId in dto.RoleIds)
                {
                    var role = await _unitOfWork.Roles.GetByIdAsync(roleId, ct);
                    if (role == null)
                    {
                        _logger.LogWarning("CreateUser: Role {RoleId} not found", roleId);
                        throw new NotFoundException($"Role với ID {roleId} không tồn tại");
                    }

                    roleNames.Add(role.Name);
                    await _unitOfWork.Users.AddUserRoleAsync(UserRole.Create(user.Id, roleId), ct);
                }
            }

            await _unitOfWork.CompleteAsync(ct);

            _logger.LogInformation("User created: {Username} (ID: {UserId})", dto.Username, user.Id);
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                IsActive = user.IsActive,
                EmailConfirmed = user.EmailConfirmed,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt,
                Roles = roleNames
            };
        }, ct);
    }

    public async Task UpdateAsync(int id, UpdateUserDto dto, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id, ct);
        if (user == null)
            throw new NotFoundException($"User with ID {id} not found");

        user.UpdateProfile(dto.FirstName ?? string.Empty, dto.LastName ?? string.Empty, dto.Email);
        await _unitOfWork.Users.UpdateAsync(user, ct);
        await _unitOfWork.CompleteAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var exists = await _unitOfWork.Users.ExistsAsync(id, ct);
        if (!exists)
            throw new NotFoundException($"User with ID {id} not found");

        await _unitOfWork.Users.DeleteAsync(id, ct);
        await _unitOfWork.CompleteAsync(ct);
    }

    public async Task AssignRoleAsync(int userId, int roleId, CancellationToken ct = default)
    {
        if (!await _unitOfWork.Users.ExistsAsync(userId, ct))
            throw new NotFoundException($"User with ID {userId} not found");

        if (!await _unitOfWork.Roles.ExistsAsync(roleId, ct))
            throw new NotFoundException($"Role with ID {roleId} not found");

        await _unitOfWork.Users.AddUserRoleAsync(UserRole.Create(userId, roleId), ct);
        await _unitOfWork.CompleteAsync(ct);

        _cacheService.InvalidateUserCache(userId);
    }

    public async Task RemoveRoleAsync(int userId, int roleId, CancellationToken ct = default)
    {
        if (!await _unitOfWork.Users.ExistsAsync(userId, ct))
            throw new NotFoundException($"User with ID {userId} not found");

        await _unitOfWork.Users.RemoveUserRoleAsync(userId, roleId, ct);
        await _unitOfWork.CompleteAsync(ct);
        _cacheService.InvalidateUserCache(userId);
    }

    public async Task<IEnumerable<string>> GetUserPermissionsAsync(int userId, CancellationToken ct = default)
    {
        var permissions = await _unitOfWork.Users.GetUserPermissionsAsync(userId, ct);
        return permissions.Select(p => p.GetPermissionString());
    }
}
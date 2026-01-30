using AutoMapper;
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
    private readonly IMapper _mapper;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<UserService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        // TODO: thêm pagination
        var users = await _unitOfWork.Users.GetAllAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        // check username trước - thông báo lỗi
        if (await _unitOfWork.Users.UsernameExistsAsync(dto.Username))
            throw new DuplicateException("User", nameof(dto.Username), dto.Username);

        if (await _unitOfWork.Users.EmailExistsAsync(dto.Email))
            throw new DuplicateException("User", nameof(dto.Email), dto.Email);

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        var user = User.Create(dto.Username, dto.Email, passwordHash, dto.FirstName, dto.LastName);
        await _unitOfWork.Users.AddAsync(user);

        // assign roles - nếu roleId không tồn tại thì báo lỗi 
        if (dto.RoleIds != null && dto.RoleIds.Any())
        {
            foreach (var roleId in dto.RoleIds)
            {
                if (!await _unitOfWork.Roles.ExistsAsync(roleId))
                {
                    _logger.LogWarning("CreateUser: Role {RoleId} not found", roleId);
                    throw new NotFoundException($"Role với ID {roleId} không tồn tại");
                }
                await _unitOfWork.Users.AddUserRoleAsync(UserRole.Create(user.Id, roleId));
            }
        }

        await _unitOfWork.CompleteAsync();
        _logger.LogInformation("User created: {Username} (ID: {UserId})", dto.Username, user.Id);
        return _mapper.Map<UserDto>(user);
    }

    public async Task UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null)
            throw new NotFoundException($"User with ID {id} not found");

        user.UpdateProfile(dto.FirstName ?? string.Empty, dto.LastName ?? string.Empty, dto.Email);
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.CompleteAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var exists = await _unitOfWork.Users.ExistsAsync(id);
        if (!exists)
            throw new NotFoundException($"User with ID {id} not found");

        await _unitOfWork.Users.DeleteAsync(id);
        await _unitOfWork.CompleteAsync();
    }

    public async Task AssignRoleAsync(int userId, int roleId)
    {
        if (!await _unitOfWork.Users.ExistsAsync(userId))
            throw new NotFoundException($"User with ID {userId} not found");

        if (!await _unitOfWork.Roles.ExistsAsync(roleId))
            throw new NotFoundException($"Role with ID {roleId} not found");

        await _unitOfWork.Users.AddUserRoleAsync(UserRole.Create(userId, roleId));
        await _unitOfWork.CompleteAsync();
    }

    public async Task RemoveRoleAsync(int userId, int roleId)
    {
        if (!await _unitOfWork.Users.ExistsAsync(userId))
            throw new NotFoundException($"User with ID {userId} not found");

        await _unitOfWork.Users.RemoveUserRoleAsync(userId, roleId);
        await _unitOfWork.CompleteAsync();
    }

    public async Task<IEnumerable<string>> GetUserPermissionsAsync(int userId)
    {
        var permissions = await _unitOfWork.Users.GetUserPermissionsAsync(userId);
        return permissions.Select(p => p.GetPermissionString());
    }
}
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
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IMapper mapper,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        // TODO: thêm pagination
        var users = await _userRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        // check username trước - thông báo lỗi dễ hiểu hơn cho user
        if (await _userRepository.UsernameExistsAsync(dto.Username))
            throw new DuplicateException("User", nameof(dto.Username), dto.Username);

        if (await _userRepository.EmailExistsAsync(dto.Email))
            throw new DuplicateException("User", nameof(dto.Email), dto.Email);

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        var user = User.Create(dto.Username, dto.Email, passwordHash, dto.FirstName, dto.LastName);
        await _userRepository.AddAsync(user);

        // assign roles - nếu roleId không tồn tại thì báo lỗi rõ ràng
        if (dto.RoleIds != null && dto.RoleIds.Any())
        {
            foreach (var roleId in dto.RoleIds)
            {
                if (!await _roleRepository.ExistsAsync(roleId))
                {
                    _logger.LogWarning("CreateUser: Role {RoleId} not found", roleId);
                    throw new NotFoundException($"Role với ID {roleId} không tồn tại");
                }
                await _userRepository.AddUserRoleAsync(UserRole.Create(user.Id, roleId));
            }
        }

        _logger.LogInformation("User created: {Username} (ID: {UserId})", dto.Username, user.Id);
        return _mapper.Map<UserDto>(user);
    }

    public async Task UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            throw new NotFoundException($"User with ID {id} not found");

        user.UpdateProfile(dto.FirstName ?? string.Empty, dto.LastName ?? string.Empty, dto.Email);
        await _userRepository.UpdateAsync(user);
    }

    public async Task DeleteAsync(int id)
    {
        var exists = await _userRepository.ExistsAsync(id);
        if (!exists)
            throw new NotFoundException($"User with ID {id} not found");

        await _userRepository.DeleteAsync(id);
    }

    public async Task AssignRoleAsync(int userId, int roleId)
    {
        if (!await _userRepository.ExistsAsync(userId))
            throw new NotFoundException($"User with ID {userId} not found");

        if (!await _roleRepository.ExistsAsync(roleId))
            throw new NotFoundException($"Role with ID {roleId} not found");

        await _userRepository.AddUserRoleAsync(UserRole.Create(userId, roleId));
    }

    public async Task RemoveRoleAsync(int userId, int roleId)
    {
        if (!await _userRepository.ExistsAsync(userId))
            throw new NotFoundException($"User with ID {userId} not found");

        await _userRepository.RemoveUserRoleAsync(userId, roleId);
    }

    public async Task<IEnumerable<string>> GetUserPermissionsAsync(int userId)
    {
        var permissions = await _userRepository.GetUserPermissionsAsync(userId);
        return permissions.Select(p => p.GetPermissionString());
    }
}
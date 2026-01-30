using AutoMapper;
using CLEAN_Pl.Application.Common;
using CLEAN_Pl.Application.DTOs.Auth;
using CLEAN_Pl.Application.Exceptions;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CLEAN_Pl.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _tokenService;
    private readonly IMapper _mapper;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;

    // TODO: move to config
    private const string DefaultRoleName = "User";

    public AuthService(
        IUnitOfWork unitOfWork,
        IJwtTokenService tokenService,
        IMapper mapper,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _mapper = mapper;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // check username first
        if (await _unitOfWork.Users.UsernameExistsAsync(dto.Username))
            throw new DuplicateException("User", nameof(dto.Username), dto.Username);

        if (await _unitOfWork.Users.EmailExistsAsync(dto.Email))
            throw new DuplicateException("User", nameof(dto.Email), dto.Email);

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        var user = User.Create(dto.Username, dto.Email, passwordHash, dto.FirstName, dto.LastName);
        await _unitOfWork.Users.AddAsync(user);

        // NOTE: phải ensure role "User" exists trong DB seed, không thì register sẽ fail
        var defaultRole = await GetOrCreateDefaultUserRole();
        await _unitOfWork.Users.AddUserRoleAsync(UserRole.Create(user.Id, defaultRole.Id));
        
        await _unitOfWork.CompleteAsync();
        _logger.LogInformation("New user registered: {Username}", dto.Username);

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _unitOfWork.Users.GetByUsernameOrEmailAsync(dto.UsernameOrEmail);
        if (user == null)
        {
            // log failed attempts 
            // KHÔNG log password, chỉ log identifier
            _logger.LogWarning("Failed login attempt for: {UsernameOrEmail}", dto.UsernameOrEmail);
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            _logger.LogWarning("Invalid password for user: {UserId}", user.Id);
            throw new UnauthorizedException("Invalid credentials");
        }

        // edge case: admin deactivate user nhưng user vẫn có token cũ
        if (!user.IsActive)
        {
            _logger.LogWarning("Deactivated user attempted login: {UserId}", user.Id);
            throw new UnauthorizedException("Account is deactivated");
        }

        user.UpdateLastLogin();
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.CompleteAsync();

        _logger.LogInformation("User logged in: {UserId}", user.Id);
        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(dto.RefreshToken);
        if (principal == null)
            throw new UnauthorizedException("Invalid token");

        var userId = _tokenService.GetUserIdFromToken(dto.RefreshToken);
        if (userId == null)
            throw new UnauthorizedException("Invalid token");

        var user = await _unitOfWork.Users.GetByIdAsync(userId.Value);
        if (user == null || user.RefreshToken != dto.RefreshToken || !user.IsRefreshTokenValid())
            throw new UnauthorizedException("Invalid refresh token");

        return await GenerateAuthResponse(user);
    }

    public async Task RevokeTokenAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException($"User with ID {userId} not found");

        user.RevokeRefreshToken();
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.CompleteAsync();
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException($"User with ID {userId} not found");

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new BusinessRuleException("Current password is incorrect");

        // Hash new password
        var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.ChangePassword(newPasswordHash);

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.CompleteAsync();
    }

    private async Task<AuthResponseDto> GenerateAuthResponse(User user)
    {
        // Get user roles and permissions
        var roles = await _unitOfWork.Users.GetUserRolesAsync(user.Id);
        var permissions = await _unitOfWork.Users.GetUserPermissionsAsync(user.Id);

        var roleNames = roles.Select(r => r.Name).ToList();
        var permissionStrings = permissions.Select(p => p.GetPermissionString()).ToList();

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user, roleNames, permissionStrings);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Save refresh token
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);
        user.SetRefreshToken(refreshToken, refreshTokenExpiry);
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.CompleteAsync();

        // Map to response
        var response = _mapper.Map<AuthResponseDto>(user);
        response.AccessToken = accessToken;
        response.RefreshToken = refreshToken;
        response.TokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
        response.Roles = roleNames;
        response.Permissions = permissionStrings;

        return response;
    }

    private async Task<Role> GetOrCreateDefaultUserRole()
    {
        // tìm role "User" - nếu không có thì throw error vì DB seed chưa chạy
        var role = await _unitOfWork.Roles.GetByNameAsync(DefaultRoleName);

        if (role == null)
        {
            _logger.LogError("Default role '{RoleName}' not found! Did you run DB seed?", DefaultRoleName);
            throw new InvalidOperationException(
                $"Role '{DefaultRoleName}' không tồn tại. Chạy database seed trước.");
        }

        return role;
    }
}

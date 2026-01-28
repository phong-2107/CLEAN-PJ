using AutoMapper;
using CLEAN_Pl.Application.Common;
using CLEAN_Pl.Application.DTOs.Auth;
using CLEAN_Pl.Application.Exceptions;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Interfaces;
using Microsoft.Extensions.Options;

namespace CLEAN_Pl.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _tokenService;
    private readonly IMapper _mapper;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        IUserRepository userRepository,
        IJwtTokenService tokenService,
        IMapper mapper,
        IOptions<JwtSettings> jwtSettings)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _mapper = mapper;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Check if username exists
        if (await _userRepository.UsernameExistsAsync(dto.Username))
            throw new DuplicateException("User", nameof(dto.Username), dto.Username);

        // Check if email exists
        if (await _userRepository.EmailExistsAsync(dto.Email))
            throw new DuplicateException("User", nameof(dto.Email), dto.Email);

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        // Create user
        var user = User.Create(dto.Username, dto.Email, passwordHash, dto.FirstName, dto.LastName);
        await _userRepository.AddAsync(user);

        // Assign default "User" role (you need to ensure this role exists)
        var defaultRole = await GetOrCreateDefaultUserRole();
        await _userRepository.AddUserRoleAsync(UserRole.Create(user.Id, defaultRole.Id));

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        // Find user by username or email
        var user = await _userRepository.GetByUsernameOrEmailAsync(dto.UsernameOrEmail);
        if (user == null)
            throw new UnauthorizedException("Invalid credentials");

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials");

        // Check if user is active
        if (!user.IsActive)
            throw new UnauthorizedException("Account is deactivated");

        // Update last login
        user.UpdateLastLogin();
        await _userRepository.UpdateAsync(user);

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

        var user = await _userRepository.GetByIdAsync(userId.Value);
        if (user == null || user.RefreshToken != dto.RefreshToken || !user.IsRefreshTokenValid())
            throw new UnauthorizedException("Invalid refresh token");

        return await GenerateAuthResponse(user);
    }

    public async Task RevokeTokenAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException($"User with ID {userId} not found");

        user.RevokeRefreshToken();
        await _userRepository.UpdateAsync(user);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException($"User with ID {userId} not found");

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new BusinessRuleException("Current password is incorrect");

        // Hash new password
        var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.ChangePassword(newPasswordHash);

        await _userRepository.UpdateAsync(user);
    }

    private async Task<AuthResponseDto> GenerateAuthResponse(User user)
    {
        // Get user roles and permissions
        var roles = await _userRepository.GetUserRolesAsync(user.Id);
        var permissions = await _userRepository.GetUserPermissionsAsync(user.Id);

        var roleNames = roles.Select(r => r.Name).ToList();
        var permissionStrings = permissions.Select(p => p.GetPermissionString()).ToList();

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user, roleNames, permissionStrings);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Save refresh token
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);
        user.SetRefreshToken(refreshToken, refreshTokenExpiry);
        await _userRepository.UpdateAsync(user);

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
        // This is a placeholder - implement role repository method
        // For now, assume role with ID 1 is "User" role
        throw new NotImplementedException("Implement default role retrieval");
    }
}
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
    private readonly IPermissionCacheService _cacheService;
    private readonly IMapper _mapper;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;

    private const string DefaultRoleName = "User";

    public AuthService(
        IUnitOfWork unitOfWork,
        IJwtTokenService tokenService,
        IPermissionCacheService cacheService,
        IMapper mapper,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _cacheService = cacheService;
        _mapper = mapper;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken ct = default)
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

            var defaultRole = await GetOrCreateDefaultUserRole(ct);
            await _unitOfWork.Users.AddUserRoleAsync(UserRole.Create(user.Id, defaultRole.Id), ct);
            await _unitOfWork.CompleteAsync(ct);

            _logger.LogInformation("New user registered: {Username}", dto.Username);

            var registeredUser = await _unitOfWork.Users.GetByIdAsync(user.Id, ct);
            return await GenerateAuthResponse(registeredUser!, ct);
        }, ct);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByUsernameOrEmailAsync(dto.UsernameOrEmail, ct);
        if (user == null)
        {
            _logger.LogWarning("Failed login attempt for: {UsernameOrEmail}", dto.UsernameOrEmail);
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            _logger.LogWarning("Invalid password for user: {UserId}", user.Id);
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Deactivated user attempted login: {UserId}", user.Id);
            throw new UnauthorizedException("Account is deactivated");
        }

        user.UpdateLastLogin();
        await _unitOfWork.Users.UpdateAsync(user, ct);
        await _unitOfWork.CompleteAsync(ct);

        _logger.LogInformation("User logged in: {UserId}", user.Id);
        return await GenerateAuthResponse(user, ct);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto, CancellationToken ct = default)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(dto.RefreshToken);
        if (principal == null)
            throw new UnauthorizedException("Invalid token");

        var userId = _tokenService.GetUserIdFromToken(dto.RefreshToken);
        if (userId == null)
            throw new UnauthorizedException("Invalid token");

        var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, ct);
        if (user == null || user.RefreshToken != dto.RefreshToken || !user.IsRefreshTokenValid())
            throw new UnauthorizedException("Invalid refresh token");

        return await GenerateAuthResponse(user, ct);
    }

    public async Task RevokeTokenAsync(int userId, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user == null)
            throw new NotFoundException($"User with ID {userId} not found");

        user.RevokeRefreshToken();
        await _unitOfWork.Users.UpdateAsync(user, ct);
        await _unitOfWork.CompleteAsync(ct);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user == null)
            throw new NotFoundException($"User with ID {userId} not found");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new BusinessRuleException("Current password is incorrect");

        var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.ChangePassword(newPasswordHash);

        await _unitOfWork.Users.UpdateAsync(user, ct);
        await _unitOfWork.CompleteAsync(ct);
    }

    private async Task<AuthResponseDto> GenerateAuthResponse(User user, CancellationToken ct = default)
    {
        var roleNames = (await _cacheService.GetUserRolesAsync(user.Id)).ToList();
        var permissionStrings = (await _cacheService.GetUserPermissionsAsync(user.Id)).ToList();
        var accessToken = _tokenService.GenerateAccessToken(user, roleNames, permissionStrings);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);

        user.SetRefreshToken(refreshToken, refreshTokenExpiry);
        await _unitOfWork.Users.UpdateAsync(user, ct);
        await _unitOfWork.CompleteAsync(ct);

        var response = _mapper.Map<AuthResponseDto>(user);
        response.AccessToken = accessToken;
        response.RefreshToken = refreshToken;
        response.TokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
        response.Roles = roleNames;

        return response;
    }

    private async Task<Role> GetOrCreateDefaultUserRole(CancellationToken ct = default)
    {
        var role = await _unitOfWork.Roles.GetByNameAsync(DefaultRoleName, ct);

        if (role == null)
        {
            _logger.LogError("Default role '{RoleName}' not found! Did you run DB seed?", DefaultRoleName);
            throw new InvalidOperationException(
                $"Role '{DefaultRoleName}' không tồn tại. Chạy database seed trước.");
        }

        return role;
    }
}

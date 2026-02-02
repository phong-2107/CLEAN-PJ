using CLEAN_Pl.Application.DTOs.Auth;

namespace CLEAN_Pl.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto);
    Task RevokeTokenAsync(int userId);
    Task ChangePasswordAsync(int userId, ChangePasswordDto dto);
}
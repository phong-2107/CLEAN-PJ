using CLEAN_Pl.Application.DTOs.Auth;

namespace CLEAN_Pl.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken ct = default);
    Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken ct = default);
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto, CancellationToken ct = default);
    Task RevokeTokenAsync(int userId, CancellationToken ct = default);
    Task ChangePasswordAsync(int userId, ChangePasswordDto dto, CancellationToken ct = default);
}
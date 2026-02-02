using System.Security.Claims;
using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user, IEnumerable<string> roles, IEnumerable<string> permissions);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    int? GetUserIdFromToken(string token);
}
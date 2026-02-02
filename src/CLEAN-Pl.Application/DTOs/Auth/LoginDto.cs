namespace CLEAN_Pl.Application.DTOs.Auth;

public class LoginDto
{
    public string UsernameOrEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
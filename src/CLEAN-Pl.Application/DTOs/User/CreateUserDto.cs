namespace CLEAN_Pl.Application.DTOs.User;

public class CreateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public IEnumerable<int> RoleIds { get; set; } = new List<int>();
}
namespace CLEAN_Pl.Application.DTOs.Role;

public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public bool IsSystemRole { get; set; }
    public IEnumerable<string> Permissions { get; set; } = new List<string>();
}
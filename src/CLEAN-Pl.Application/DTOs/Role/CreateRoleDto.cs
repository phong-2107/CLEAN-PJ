namespace CLEAN_Pl.Application.DTOs.Role;

public class CreateRoleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IEnumerable<int> PermissionIds { get; set; } = new List<int>();
}
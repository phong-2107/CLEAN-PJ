namespace CLEAN_Pl.Domain.Entities;

public class RolePermission
{
    public int RoleId { get; set; }
    public virtual Role Role { get; set; } = null!;

    public int PermissionId { get; set; }
    public virtual Permission Permission { get; set; } = null!;

    public DateTime AssignedAt { get; set; }
    public string? AssignedBy { get; set; }

    private RolePermission() { }

    public static RolePermission Create(int roleId, int permissionId, string? assignedBy = null)
    {
        return new RolePermission
        {
            RoleId = roleId,
            PermissionId = permissionId,
            AssignedAt = DateTime.UtcNow,
            AssignedBy = assignedBy
        };
    }
}
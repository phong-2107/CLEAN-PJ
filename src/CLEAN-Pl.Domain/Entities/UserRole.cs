namespace CLEAN_Pl.Domain.Entities;

public class UserRole
{
    public int UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public int RoleId { get; set; }
    public virtual Role Role { get; set; } = null!;

    public DateTime AssignedAt { get; set; }
    public string? AssignedBy { get; set; }

    private UserRole() { }

    public static UserRole Create(int userId, int roleId, string? assignedBy = null)
    {
        return new UserRole
        {
            UserId = userId,
            RoleId = roleId,
            AssignedAt = DateTime.UtcNow,
            AssignedBy = assignedBy
        };
    }
}
using CLEAN_Pl.Domain.Enums;

namespace CLEAN_Pl.Domain.Entities;

// Represents an audit log entry that tracks changes to entities.
public sealed class AuditLog
{
    public long Id { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public string? UserName { get; private set; }
    public AuditAction Action { get; private set; }
    public string EntityName { get; private set; } = string.Empty;
    public string EntityId { get; private set; } = string.Empty;
    public string? OldValues { get; private set; }
    public string? NewValues { get; private set; }
    public string? AffectedColumns { get; private set; }
    public DateTime Timestamp { get; private set; }
    public string? IpAddress { get; private set; }

    private AuditLog() { }

    public static AuditLog Create(
        string userId,
        string? userName,
        AuditAction action,
        string entityName,
        string entityId,
        string? oldValues = null,
        string? newValues = null,
        string? affectedColumns = null,
        string? ipAddress = null)
    {
        if (string.IsNullOrWhiteSpace(entityName))
            throw new ArgumentException("Entity name is required", nameof(entityName));

        return new AuditLog
        {
            UserId = userId ?? "system",
            UserName = userName,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            AffectedColumns = affectedColumns,
            Timestamp = DateTime.UtcNow,
            IpAddress = ipAddress
        };
    }
}

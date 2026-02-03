namespace CLEAN_Pl.Application.DTOs.AuditLog;


// DTO for audit log entries.
public sealed record AuditLogDto(
    long Id,
    string UserId,
    string? UserName,
    string Action,
    string EntityName,
    string EntityId,
    string? OldValues,
    string? NewValues,
    string? AffectedColumns,
    DateTime Timestamp,
    string? IpAddress 
);

using CLEAN_Pl.Domain.Enums;

namespace CLEAN_Pl.Application.DTOs.AuditLog;

// Filter parameters for querying audit logs.
public sealed record AuditLogFilterDto
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? EntityName { get; init; }
    public string? UserId { get; init; }
    public AuditAction? Action { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

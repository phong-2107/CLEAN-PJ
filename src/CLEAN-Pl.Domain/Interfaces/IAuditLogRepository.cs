using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Enums;

namespace CLEAN_Pl.Domain.Interfaces;

/// <summary>
/// Specialized repository for Audit Log queries (Read-only, Filter-heavy).
/// </summary>
public interface IAuditLogRepository
{
    /// <summary>
    /// Adds a single audit log entry.
    /// </summary>
    Task AddAsync(AuditLog auditLog, CancellationToken ct = default);

    /// <summary>
    /// Adds multiple audit log entries.
    /// </summary>
    Task AddRangeAsync(IEnumerable<AuditLog> auditLogs, CancellationToken ct = default);

    /// <summary>
    /// Gets audit logs for a specific entity.
    /// </summary>
    Task<IEnumerable<AuditLog>> GetByEntityAsync(
        string entityName,
        string entityId,
        CancellationToken ct = default);

    /// <summary>
    /// Gets audit logs by user with pagination.
    /// </summary>
    Task<IEnumerable<AuditLog>> GetByUserAsync(
        string userId,
        int take = 50,
        CancellationToken ct = default);

    /// <summary>
    /// Gets audit logs with advanced filtering.
    /// </summary>
    Task<(IEnumerable<AuditLog> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? entityName = null,
        string? userId = null,
        AuditAction? action = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken ct = default);
}

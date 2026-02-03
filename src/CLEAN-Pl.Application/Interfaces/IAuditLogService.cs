using CLEAN_Pl.Application.Common;
using CLEAN_Pl.Application.DTOs.AuditLog;

namespace CLEAN_Pl.Application.Interfaces;

/// <summary>
/// Service for querying audit logs.
/// </summary>
public interface IAuditLogService
{
    /// <summary>
    /// Gets audit logs for a specific entity.
    /// </summary>
    Task<IEnumerable<AuditLogDto>> GetByEntityAsync(
        string entityName,
        string entityId,
        CancellationToken ct = default);

    /// <summary>
    /// Gets audit logs by user.
    /// </summary>
    Task<IEnumerable<AuditLogDto>> GetByUserAsync(
        string userId,
        int take = 50,
        CancellationToken ct = default);

    /// <summary>
    /// Gets paged audit logs with filters.
    /// </summary>
    Task<PagedResult<AuditLogDto>> GetPagedAsync(
        AuditLogFilterDto filter,
        CancellationToken ct = default);
}

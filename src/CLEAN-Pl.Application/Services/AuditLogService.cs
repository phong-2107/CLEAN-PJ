using CLEAN_Pl.Application.Common;
using CLEAN_Pl.Application.DTOs.AuditLog;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Interfaces;

namespace CLEAN_Pl.Application.Services;

/// <summary>
/// Service implementation for querying audit logs.
/// </summary>
public sealed class AuditLogService(IUnitOfWork unitOfWork) : IAuditLogService
{
    public async Task<IEnumerable<AuditLogDto>> GetByEntityAsync(
        string entityName,
        string entityId,
        CancellationToken ct = default)
    {
        var logs = await unitOfWork.AuditLogs.GetByEntityAsync(entityName, entityId, ct);

        return logs.Select(MapToDto);
    }

    public async Task<IEnumerable<AuditLogDto>> GetByUserAsync(
        string userId,
        int take = 50,
        CancellationToken ct = default)
    {
        var logs = await unitOfWork.AuditLogs.GetByUserAsync(userId, take, ct);

        return logs.Select(MapToDto);
    }

    public async Task<PagedResult<AuditLogDto>> GetPagedAsync(
        AuditLogFilterDto filter,
        CancellationToken ct = default)
    {
        var (items, totalCount) = await unitOfWork.AuditLogs.GetPagedAsync(
            filter.PageNumber,
            filter.PageSize,
            filter.EntityName,
            filter.UserId,
            filter.Action,
            filter.FromDate,
            filter.ToDate,
            ct);

        var dtos = items.Select(MapToDto).ToList();

        return new PagedResult<AuditLogDto>(
            dtos,
            totalCount,
            filter.PageNumber,
            filter.PageSize);
    }

    private static AuditLogDto MapToDto(Domain.Entities.AuditLog log) => new(
        log.Id,
        log.UserId,
        log.UserName,
        log.Action.ToString(),
        log.EntityName,
        log.EntityId,
        log.OldValues,
        log.NewValues,
        log.AffectedColumns,
        log.Timestamp,
        log.IpAddress);
}

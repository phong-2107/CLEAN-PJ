using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Enums;
using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CLEAN_Pl.Infrastructure.Repositories;

public sealed class AuditLogRepository(ApplicationDbContext context) : IAuditLogRepository
{
    public async Task AddAsync(AuditLog auditLog, CancellationToken ct = default)
    {
        await context.AuditLogs.AddAsync(auditLog, ct);
    }

    public async Task AddRangeAsync(IEnumerable<AuditLog> auditLogs, CancellationToken ct = default)
    {
        await context.AuditLogs.AddRangeAsync(auditLogs, ct);
    }

    public async Task<IEnumerable<AuditLog>> GetByEntityAsync(
        string entityName,
        string entityId,
        CancellationToken ct = default)
    {
        return await context.AuditLogs
            .AsNoTracking()
            .Where(x => x.EntityName == entityName && x.EntityId == entityId)
            .OrderByDescending(x => x.Timestamp)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<AuditLog>> GetByUserAsync(
        string userId,
        int take = 50,
        CancellationToken ct = default)
    {
        return await context.AuditLogs
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.Timestamp)
            .Take(take)
            .ToListAsync(ct);
    }

    public async Task<(IEnumerable<AuditLog> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? entityName = null,
        string? userId = null,
        AuditAction? action = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken ct = default)
    {
        var query = context.AuditLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(entityName))
            query = query.Where(x => x.EntityName == entityName);

        if (!string.IsNullOrWhiteSpace(userId))
            query = query.Where(x => x.UserId == userId);

        if (action.HasValue)
            query = query.Where(x => x.Action == action.Value);

        if (fromDate.HasValue)
            query = query.Where(x => x.Timestamp >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(x => x.Timestamp <= toDate.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(x => x.Timestamp)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }
}

using System.Text.Json;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Common;
using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Enums;
using CLEAN_Pl.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

namespace CLEAN_Pl.Infrastructure.Interceptors;

/// <summary>
/// EF Core interceptor that automatically:
/// 1. Updates CreatedBy/UpdatedBy on AuditableEntity
/// 2. Queues AuditLog entries for background processing (non-blocking)
/// </summary>
public sealed class AuditableEntityInterceptor(
    ICurrentUserService currentUserService,
    AuditLogQueue auditLogQueue,
    ILogger<AuditableEntityInterceptor> logger) : SaveChangesInterceptor
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = false,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    // Entities to exclude from audit logging
    private static readonly HashSet<string> ExcludedEntities =
    [
        nameof(AuditLog) 
    ];

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken ct = default)
    {
        if (eventData.Context is null)
            return await base.SavingChangesAsync(eventData, result, ct);

        var context = eventData.Context;

        UpdateAuditableEntities(context);
        await QueueAuditLogsAsync(context, ct);

        return await base.SavingChangesAsync(eventData, result, ct);
    }

    /// <summary>
    /// Updates CreatedBy/UpdatedBy fields on AuditableEntity instances.
    /// </summary>
    private void UpdateAuditableEntities(DbContext context)
    {
        var entries = context.ChangeTracker
            .Entries<AuditableEntity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified);

        foreach (var entry in entries)
        {
            var userId = currentUserService.UserId;

            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedBy = userId;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedBy = userId;
            }
        }
    }

    /// <summary>
    /// Queues AuditLog entries for background processing instead of blocking insert.
    /// </summary>
    private async Task QueueAuditLogsAsync(DbContext context, CancellationToken ct)
    {
        var auditLogs = new List<AuditLog>();

        var entries = context.ChangeTracker
            .Entries()
            .Where(e => !ExcludedEntities.Contains(e.Entity.GetType().Name)
                        && e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .ToList();

        foreach (var entry in entries)
        {
            var auditLog = CreateAuditLogEntry(entry);
            if (auditLog is not null)
            {
                auditLogs.Add(auditLog);
            }
        }

        if (auditLogs.Count > 0)
        {
            try
            {
                await auditLogQueue.EnqueueRangeAsync(auditLogs, ct);
                logger.LogDebug("Queued {Count} audit logs for background processing", auditLogs.Count);
            }
            catch (Exception ex)
            {
                // Don't fail the main transaction if audit queue fails
                logger.LogWarning(ex, "Failed to queue {Count} audit logs", auditLogs.Count);
            }
        }
    }

    private AuditLog? CreateAuditLogEntry(EntityEntry entry)
    {
        var entityName = entry.Entity.GetType().Name;
        var primaryKey = GetPrimaryKey(entry);

        var action = entry.State switch
        {
            EntityState.Added => AuditAction.Create,
            EntityState.Modified => AuditAction.Update,
            EntityState.Deleted => AuditAction.Delete,
            _ => throw new InvalidOperationException($"Unexpected entity state: {entry.State}")
        };

        string? oldValues = null;
        string? newValues = null;
        string? affectedColumns = null;

        switch (entry.State)
        {
            case EntityState.Added:
                newValues = SerializeProperties(entry.Properties, p => p.CurrentValue);
                break;

            case EntityState.Modified:
                var modifiedProps = entry.Properties
                    .Where(p => p.IsModified && !Equals(p.OriginalValue, p.CurrentValue))
                    .ToList();

                if (modifiedProps.Count == 0)
                    return null;

                oldValues = SerializeProperties(modifiedProps, p => p.OriginalValue);
                newValues = SerializeProperties(modifiedProps, p => p.CurrentValue);
                affectedColumns = string.Join(",", modifiedProps.Select(p => p.Metadata.Name));
                break;

            case EntityState.Deleted:
                oldValues = SerializeProperties(entry.Properties, p => p.OriginalValue);
                break;
        }

        return AuditLog.Create(
            userId: currentUserService.UserId ?? "system",
            userName: currentUserService.UserName,
            action: action,
            entityName: entityName,
            entityId: primaryKey,
            oldValues: oldValues,
            newValues: newValues,
            affectedColumns: affectedColumns,
            ipAddress: currentUserService.IpAddress);
    }

    private static string GetPrimaryKey(EntityEntry entry)
    {
        var keyProperties = entry.Properties
            .Where(p => p.Metadata.IsPrimaryKey())
            .Select(p => p.CurrentValue?.ToString() ?? string.Empty);

        // Normalize keys to string for composite or non-int PKs.
        return string.Join(",", keyProperties);
    }

    private static string SerializeProperties(
        IEnumerable<PropertyEntry> properties,
        Func<PropertyEntry, object?> valueSelector)
    {
        var dict = properties
            .Where(p => !p.Metadata.IsPrimaryKey())
            .ToDictionary(
                p => p.Metadata.Name,
                p => valueSelector(p));

        return JsonSerializer.Serialize(dict, JsonOptions);
    }
}

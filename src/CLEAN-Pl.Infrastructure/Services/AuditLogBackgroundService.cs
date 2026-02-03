using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CLEAN_Pl.Infrastructure.Services;

/// <summary>
/// Background service that processes audit logs from the queue in batches.
/// This decouples audit logging from the main request pipeline for better performance.
/// </summary>
public sealed class AuditLogBackgroundService : BackgroundService
{
    private readonly AuditLogQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AuditLogBackgroundService> _logger;

    private const int BatchSize = 100;
    private const int FlushIntervalSeconds = 5;

    public AuditLogBackgroundService(
        AuditLogQueue queue,
        IServiceScopeFactory scopeFactory,
        ILogger<AuditLogBackgroundService> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("?? AuditLog background service started");

        var batch = new List<AuditLog>(BatchSize);
        var lastFlush = DateTime.UtcNow;

        try
        {
            await foreach (var auditLog in _queue.ReadAllAsync(stoppingToken))
            {
                batch.Add(auditLog);

                var shouldFlush = batch.Count >= BatchSize
                    || (DateTime.UtcNow - lastFlush).TotalSeconds >= FlushIntervalSeconds;

                if (shouldFlush && batch.Count > 0)
                {
                    await FlushBatchAsync(batch, stoppingToken);
                    batch.Clear();
                    lastFlush = DateTime.UtcNow;
                }
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Graceful shutdown - flush remaining items
            if (batch.Count > 0)
            {
                _logger.LogInformation("Flushing {Count} remaining audit logs before shutdown", batch.Count);
                await FlushBatchAsync(batch, CancellationToken.None);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in AuditLog background service");
            throw;
        }

        _logger.LogInformation("?? AuditLog background service stopped");
    }

    private async Task FlushBatchAsync(List<AuditLog> batch, CancellationToken ct)
    {
        if (batch.Count == 0) return;

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            await context.AuditLogs.AddRangeAsync(batch, ct);
            await context.SaveChangesAsync(ct);

            _logger.LogDebug("? Flushed {Count} audit logs to database", batch.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Failed to flush {Count} audit logs", batch.Count);
            // TODO: Consider retry logic or dead-letter queue
        }
    }
}

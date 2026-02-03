using CLEAN_Pl.Application.Common;
using CLEAN_Pl.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CLEAN_Pl.Infrastructure.Services;

/// <summary>
/// Background service that cleans up old audit logs based on retention policy.
/// Runs daily to archive/delete logs older than configured retention period.
/// </summary>
public sealed class AuditLogCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AuditLogCleanupService> _logger;
    private readonly AuditSettings _settings;

    private static readonly TimeSpan CleanupInterval = TimeSpan.FromHours(24);

    public AuditLogCleanupService(
        IServiceScopeFactory scopeFactory,
        IOptions<AuditSettings> settings,
        ILogger<AuditLogCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("?? AuditLog cleanup service started (retention: {Days} days)", _settings.RetentionDays);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupOldLogsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during audit log cleanup");
            }

            await Task.Delay(CleanupInterval, stoppingToken);
        }
    }

    private async Task CleanupOldLogsAsync(CancellationToken ct)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-_settings.RetentionDays);

        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Delete in batches to avoid long-running transactions
        const int batchSize = 1000;
        int totalDeleted = 0;
        int deletedInBatch;

        do
        {
            deletedInBatch = await context.AuditLogs
                .Where(x => x.Timestamp < cutoffDate)
                .Take(batchSize)
                .ExecuteDeleteAsync(ct);

            totalDeleted += deletedInBatch;

            if (deletedInBatch > 0)
            {
                _logger.LogDebug("Deleted {Count} old audit logs (batch)", deletedInBatch);
            }

        } while (deletedInBatch == batchSize);

        if (totalDeleted > 0)
        {
            _logger.LogInformation("??? Cleaned up {Count} audit logs older than {Date:yyyy-MM-dd}",
                totalDeleted, cutoffDate);
        }
    }
}

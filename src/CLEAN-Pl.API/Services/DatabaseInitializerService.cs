using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Common;
using CLEAN_Pl.Infrastructure.Data;

namespace CLEAN_Pl.API.Services;

public class DatabaseInitializerService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DatabaseInitializerService> _logger;

    public DatabaseInitializerService(
        IServiceScopeFactory scopeFactory,
        ILogger<DatabaseInitializerService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🚀 Database initialization started");

        try
        {
            using var scope = _scopeFactory.CreateScope();

            // Seed initial data (Roles, Admin user, etc.)
            var seeder = scope.ServiceProvider.GetRequiredService<DbSeeder>();
            await seeder.SeedAsync();

            // Auto-discover and sync permissions from code
            var discoveryService = scope.ServiceProvider
                .GetRequiredService<IPermissionDiscoveryService>();

            var apiAssembly = typeof(Program).Assembly;
            var domainAssembly = typeof(AuditableEntity).Assembly;

            var result = await discoveryService.DiscoverAndSyncAsync(
                apiAssembly,
                domainAssembly,
                stoppingToken);

            _logger.LogInformation(
                "📊 Permission discovery: Total={Total} (Entities={Entities}, Attributes={Attrs}), Added={New}",
                result.TotalDiscovered,
                result.FromEntities,
                result.FromAttributes,
                result.NewlyAdded);

            _logger.LogInformation("✅ Database initialization completed successfully");
        }
        catch (Exception ex)
        {
            // Log error but don't crash app (it might be a transient DB issue)
            _logger.LogError(ex, "Database initialization failed.");

        }
    }
}

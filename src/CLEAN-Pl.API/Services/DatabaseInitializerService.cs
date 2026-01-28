using CLEAN_Pl.Infrastructure.Data;

namespace CLEAN_Pl.API.Services;

/// <summary>
/// Background service for database initialization and seeding.
/// Runs once when the application starts without blocking startup.
/// </summary>
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
        _logger.LogInformation("Database initialization started");

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var seeder = scope.ServiceProvider.GetRequiredService<DbSeeder>();
            
            await seeder.SeedAsync();
            
            _logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database seeding failed. The application will continue running. " +
                                 "Please check database connectivity and run seeding manually if needed.");
            // Không throw exception - cho phép app tiếp tục chạy
        }
    }
}

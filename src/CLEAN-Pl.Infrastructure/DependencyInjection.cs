using CLEAN_Pl.Application.Common;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Interfaces;
using CLEAN_Pl.Infrastructure.Data;
using CLEAN_Pl.Infrastructure.Interceptors;
using CLEAN_Pl.Infrastructure.Persistence;
using CLEAN_Pl.Infrastructure.Repositories;
using CLEAN_Pl.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CLEAN_Pl.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Audit Settings
        services.Configure<AuditSettings>(configuration.GetSection(AuditSettings.SectionName));

        // Audit Log Queue
        services.AddSingleton<AuditLogQueue>();

        // Audit Log Background Services
        services.AddHostedService<AuditLogBackgroundService>();
        services.AddHostedService<AuditLogCleanupService>();

        // Interceptors
        services.AddScoped<AuditableEntityInterceptor>();

        // Database with Interceptor
        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var auditInterceptor = sp.GetRequiredService<AuditableEntityInterceptor>();

            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b =>
                {
                    b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    b.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorNumbersToAdd: null);
                });

            options.AddInterceptors(auditInterceptor);
           
            options.EnableSensitiveDataLogging(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development");
        });

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Repositories
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IPermissionRepository, PermissionRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();

        // Database Seeder
        services.AddScoped<DbSeeder>();

        // Permission Auto-Discovery Service
        services.AddScoped<IPermissionDiscoveryService, PermissionDiscoveryService>();

        return services;
    }
}
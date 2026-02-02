namespace CLEAN_Pl.API.Extensions;

/// <summary>
/// Extension methods for configuring CORS policies
/// </summary>
public static class CorsExtensions
{
    public const string DevelopmentPolicy = "DevelopmentCors";
    public const string ProductionPolicy = "ProductionCors";

    public static IServiceCollection AddCorsPolicy(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        services.AddCors(options =>
        {
            // Development - cho phép localhost
            options.AddPolicy(DevelopmentPolicy, policy =>
            {
                policy.WithOrigins(
                        "http://localhost:3000",
                        "http://localhost:5173",
                        "http://localhost:5036",
                        "https://localhost:7170")
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });

            // Production - chỉ cho phép domain được cấu hình
            var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
            
            options.AddPolicy(ProductionPolicy, policy =>
            {
                if (allowedOrigins != null && allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins)
                          .WithMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                          .AllowAnyHeader()
                          .AllowCredentials();
                }
                else
                {
                    // Fallback: không cho phép cross-origin nếu chưa cấu hình
                    policy.WithOrigins("https://localhost")
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                }
            });
        });

        return services;
    }

    public static IApplicationBuilder UseCorsPolicy(
        this IApplicationBuilder app,
        IWebHostEnvironment environment)
    {
        var policyName = environment.IsDevelopment() ? DevelopmentPolicy : ProductionPolicy;
        app.UseCors(policyName);
        return app;
    }
}

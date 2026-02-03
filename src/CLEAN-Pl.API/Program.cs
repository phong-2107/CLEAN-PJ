using CLEAN_Pl.API.Extensions;
using CLEAN_Pl.API.Middleware;
using CLEAN_Pl.API.Services;
using CLEAN_Pl.Application;
using CLEAN_Pl.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// --- Services setup ---

// Controllers
builder.Services.AddControllers();

// Application & Infrastructure layers (Clean Architecture)
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);

// Authentication & Authorization
builder.Services.AddJwtAuthentication(builder.Configuration);

// Swagger Documentation
builder.Services.AddSwaggerDocumentation();

// CORS Policy
builder.Services.AddCorsPolicy(builder.Configuration, builder.Environment);

// Rate Limiting
builder.Services.AddRateLimitingPolicy();

// Health Checks
builder.Services.AddHealthChecksConfiguration();

// Database Seeder (Background Service - non-blocking)
builder.Services.AddHostedService<DatabaseInitializerService>();

// --- Middleware pipeline ---

var app = builder.Build();

// Global Exception Handler - MUST be first to catch all exceptions
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Development only: Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerDocumentation();
}

// Security & CORS
app.UseHttpsRedirection();
app.UseCorsPolicy(app.Environment);

// Rate Limiting
app.UseRateLimiter();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Endpoints
app.MapControllers();
app.MapHealthCheckEndpoints();

// API Info endpoint
app.MapGet("/api", () => Results.Ok(new
{
    message = "CLEAN-Pl API is running",
    version = "v1",
    documentation = "/swagger",
    health = "/health"
})).WithName("ApiInfo");

app.Run();
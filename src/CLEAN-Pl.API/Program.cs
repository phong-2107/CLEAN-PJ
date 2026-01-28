using CLEAN_Pl.API.Middleware;
using CLEAN_Pl.Application;
using CLEAN_Pl.Infrastructure;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "CLEAN-PL API",
        Version = "v1",
        Description = "Clean Architecture API with .NET 10"
    });
});

// Application Layer
builder.Services.AddApplication(builder.Configuration);

// Infrastructure Layer
builder.Services.AddInfrastructure(builder.Configuration);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "CLEAN-PL API v1");
        options.RoutePrefix = "swagger";
    });
}

// Global Exception Handler
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// Health Check Endpoint
app.MapHealthChecks("/health");

app.MapGet("/", () => Results.Ok(new
{
    message = "CLEAN-PL API is running",
    version = "1.0",
    swagger = "/swagger"
}))
.WithName("Root");

app.Run();
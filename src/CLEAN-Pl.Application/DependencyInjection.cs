using System.Reflection;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace CLEAN_Pl.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // AutoMapper
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        // FluentValidation
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Services
        services.AddScoped<IProductService, ProductService>();

        return services;
    }
}
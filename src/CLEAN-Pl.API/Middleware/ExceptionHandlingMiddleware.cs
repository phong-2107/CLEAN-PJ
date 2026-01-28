using System.Net;
using System.Text.Json;
using CLEAN_Pl.Application.Exceptions;
using CLEAN_Pl.Domain.Exceptions;

namespace CLEAN_Pl.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An error occurred: {Message}", exception.Message);

        var response = context.Response;
        response.ContentType = "application/json";

        int statusCode;
        object errorResponse;

        switch (exception)
        {
            case NotFoundException notFoundEx:
                statusCode = (int)HttpStatusCode.NotFound;
                errorResponse = new
                {
                    StatusCode = statusCode,
                    Message = notFoundEx.Message
                };
                break;
            case UnauthorizedException unauthorizedEx:
                statusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse = new
                {
                    StatusCode = statusCode,
                    Message = unauthorizedEx.Message
                };
                break;
            case DomainException domainEx:
                statusCode = (int)HttpStatusCode.BadRequest;
                errorResponse = new
                {
                    StatusCode = statusCode,
                    Message = domainEx.Message
                };
                break;
            case ValidationException validationEx:
                statusCode = (int)HttpStatusCode.BadRequest;
                errorResponse = new
                {
                    StatusCode = statusCode,
                    Message = "Validation failed",
                    Errors = validationEx.Errors
                };
                break;
            default:
                statusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse = new
                {
                    StatusCode = statusCode,
                    Message = "An internal server error occurred"
                };
                break;
        }

        response.StatusCode = statusCode;
        await response.WriteAsync(JsonSerializer.Serialize(errorResponse));
    }
}
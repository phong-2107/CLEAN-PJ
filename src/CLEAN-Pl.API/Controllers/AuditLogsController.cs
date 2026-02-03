using CLEAN_Pl.API.Attributes;
using CLEAN_Pl.Application.Common;
using CLEAN_Pl.Application.DTOs.AuditLog;
using CLEAN_Pl.Application.Interfaces;
using CLEAN_Pl.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CLEAN_Pl.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuditLogsController(
    IAuditLogService auditLogService,
    ILogger<AuditLogsController> logger) : ControllerBase
{
    
    // Gets audit logs for a specific entity.
    [HttpGet("entity/{entityName}/{entityId}")]
    [Permission("AuditLog.Read")]
    [ProducesResponseType(typeof(IEnumerable<AuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByEntity(
        string entityName,
        string entityId,
        CancellationToken ct)
    {
        logger.LogDebug("Getting audit logs for entity {EntityName} with ID {EntityId}", entityName, entityId);

        var logs = await auditLogService.GetByEntityAsync(entityName, entityId, ct);
        return Ok(logs);
    }

    
    // Gets audit logs by user.
    [HttpGet("user/{userId}")]
    [Permission("AuditLog.Read")]
    [ProducesResponseType(typeof(IEnumerable<AuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetByUser(
        string userId,
        [FromQuery] int take = 50,
        CancellationToken ct = default)
    {
        logger.LogDebug("Getting audit logs for user {UserId}, take {Take}", userId, take);

        var logs = await auditLogService.GetByUserAsync(userId, take, ct);
        return Ok(logs);
    }

    
    // Gets paged audit logs with filters.
    [HttpGet]
    [Permission("AuditLog.Read")]
    [ProducesResponseType(typeof(PagedResult<AuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<AuditLogDto>>> GetPaged(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? entityName = null,
        [FromQuery] string? userId = null,
        [FromQuery] AuditAction? action = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken ct = default)
    {
        var filter = new AuditLogFilterDto
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            EntityName = entityName,
            UserId = userId,
            Action = action,
            FromDate = fromDate,
            ToDate = toDate
        };

        logger.LogDebug("Getting paged audit logs with filter: {@Filter}", filter);

        var result = await auditLogService.GetPagedAsync(filter, ct);
        return Ok(result);
    }
}

using CLEAN_Pl.API.Attributes;
using CLEAN_Pl.Application.DTOs.Permission;
using CLEAN_Pl.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CLEAN_Pl.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;
    private readonly ILogger<PermissionsController> _logger;

    public PermissionsController(
        IPermissionService permissionService,
        ILogger<PermissionsController> logger)
    {
        _permissionService = permissionService;
        _logger = logger;
    }

    // lấy all permissions
    [HttpGet]
    [Permission("Permission.Read")]
    [ProducesResponseType(typeof(IEnumerable<PermissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetAll()
    {
        var permissions = await _permissionService.GetAllAsync();
        return Ok(permissions);
    }

    // Get permission by ID
    [HttpGet("{id}")]
    [Permission("Permission.Read")]
    [ProducesResponseType(typeof(PermissionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PermissionDto>> GetById(int id)
    {
        var permission = await _permissionService.GetByIdAsync(id);
        if (permission == null)
            return NotFound();

        return Ok(permission);
    }

    // lấy permissions theo resource
    [HttpGet("resource/{resource}")]
    [Permission("Permission.Read")]
    [ProducesResponseType(typeof(IEnumerable<PermissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetByResource(string resource)
    {
        var permissions = await _permissionService.GetByResourceAsync(resource);
        return Ok(permissions);
    }
}
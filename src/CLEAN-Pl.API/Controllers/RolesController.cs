using CLEAN_Pl.API.Attributes;
using CLEAN_Pl.Application.DTOs.Role;
using CLEAN_Pl.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CLEAN_Pl.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;
    private readonly ILogger<RolesController> _logger;

    public RolesController(IRoleService roleService, ILogger<RolesController> logger)
    {
        _roleService = roleService;
        _logger = logger;
    }

    // lấy all roles
    [HttpGet]
    [Permission("Role.Read")]
    [ProducesResponseType(typeof(IEnumerable<RoleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetAll()
    {
        var roles = await _roleService.GetAllAsync();
        return Ok(roles);
    }

    // Get role by ID
    [HttpGet("{id}")]
    [Permission("Role.Read")]
    [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<RoleDto>> GetById(int id)
    {
        var role = await _roleService.GetByIdAsync(id);
        if (role == null)
            return NotFound();

        return Ok(role);
    }

    // Create a new role
    [HttpPost]
    [Permission("Role.Create")]
    [ProducesResponseType(typeof(RoleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<RoleDto>> Create([FromBody] CreateRoleDto dto)
    {
        var role = await _roleService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = role.Id }, role);
    }

    // Update role
    [HttpPut("{id}")]
    [Permission("Role.Update")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(int id, [FromBody] CreateRoleDto dto)
    {
        await _roleService.UpdateAsync(id, dto);
        return NoContent();
    }

    // xóa role - KHÔNG cho xóa system role
    [HttpDelete("{id}")]
    [Permission("Role.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(int id)
    {
        await _roleService.DeleteAsync(id);
        return NoContent();
    }

    // Assign permission to role
    [HttpPost("{roleId}/permissions/{permissionId}")]
    [Permission("Role.Update")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AssignPermission(int roleId, int permissionId)
    {
        await _roleService.AssignPermissionAsync(roleId, permissionId);
        return NoContent();
    }

    // Remove permission from role
    [HttpDelete("{roleId}/permissions/{permissionId}")]
    [Permission("Role.Update")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RemovePermission(int roleId, int permissionId)
    {
        await _roleService.RemovePermissionAsync(roleId, permissionId);
        return NoContent();
    }
}
using CLEAN_Pl.Application.DTOs.Auth;
using CLEAN_Pl.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CLEAN_Pl.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IPermissionCacheService _cacheService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService, 
        IPermissionCacheService cacheService,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _cacheService = cacheService;
        _logger = logger;
    }

    // Register a new user
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var response = await _authService.RegisterAsync(dto);
        return CreatedAtAction(nameof(Register), response);
    }

    // Login with username/email and password
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var response = await _authService.LoginAsync(dto);
        return Ok(response);
    }

    // Refresh access token using refresh token
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenDto dto)
    {
        var response = await _authService.RefreshTokenAsync(dto);
        return Ok(response);
    }

    // Logout - xóa refresh token
    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout()
    {
        // lấy userId từ JWT claim
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            _logger.LogWarning("Logout failed: invalid userId claim");
            return Unauthorized();
        }
        
        await _authService.RevokeTokenAsync(userId);
        return NoContent();
    }

    // Đổi password - cần đăng nhập
    [Authorize]
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }
        
        await _authService.ChangePasswordAsync(userId, dto);
        return NoContent();
    }

    // Get current user info
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var username = User.FindFirstValue(ClaimTypes.Name);
        var email = User.FindFirstValue(ClaimTypes.Email);
        var fullName = User.FindFirstValue("FullName");
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);

        return Ok(new
        {
            UserId = userId,
            Username = username,
            Email = email,
            FullName = fullName,
            Roles = roles
        });
    }

    [Authorize]
    [HttpGet("me/permissions")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<string>>> GetCurrentUserPermissions()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var permissions = await _cacheService.GetUserPermissionsAsync(userId);
        return Ok(permissions);
    }
}
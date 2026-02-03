namespace CLEAN_Pl.Application.Interfaces;

/// <summary>
/// Service to access current authenticated user information.
/// Used for audit logging and authorization.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the current user's ID.
    /// </summary>
    string? UserId { get; }

    /// <summary>
    /// Gets the current user's username.
    /// </summary>
    string? UserName { get; }

    /// <summary>
    /// Gets the current user's email.
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Gets the client's IP address.
    /// </summary>
    string? IpAddress { get; }

    /// <summary>
    /// Indicates whether the current user is authenticated.
    /// </summary>
    bool IsAuthenticated { get; }
}

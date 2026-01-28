using CLEAN_Pl.Domain.Common;
using CLEAN_Pl.Domain.Exceptions;

namespace CLEAN_Pl.Domain.Entities;

public class User : AuditableEntity
{
    public string Username { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string? FirstName { get; private set; }
    public string? LastName { get; private set; }
    public bool IsActive { get; private set; }
    public bool EmailConfirmed { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiryTime { get; private set; }

    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; private set; } = new List<UserRole>();

    // Computed property
    public string FullName => $"{FirstName} {LastName}".Trim();

    private User() { }

    // Factory method
    public static User Create(
        string username,
        string email,
        string passwordHash,
        string? firstName = null,
        string? lastName = null)
    {
        ValidateUsername(username);
        ValidateEmail(email);
        ValidatePasswordHash(passwordHash);

        return new User
        {
            Username = username.ToLower(),
            Email = email.ToLower(),
            PasswordHash = passwordHash,
            FirstName = firstName,
            LastName = lastName,
            IsActive = true,
            EmailConfirmed = false,
            CreatedAt = DateTime.UtcNow
        };
    }

    // Business methods
    public void UpdateProfile(string firstName, string lastName, string email)
    {
        ValidateEmail(email);

        FirstName = firstName;
        LastName = lastName;
        Email = email.ToLower();
        SetUpdatedAt();
    }

    public void ChangePassword(string newPasswordHash)
    {
        ValidatePasswordHash(newPasswordHash);
        PasswordHash = newPasswordHash;
        SetUpdatedAt();
    }

    public void Activate()
    {
        IsActive = true;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }

    public void ConfirmEmail()
    {
        EmailConfirmed = true;
        SetUpdatedAt();
    }

    public void UpdateLastLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }

    public void SetRefreshToken(string refreshToken, DateTime expiryTime)
    {
        RefreshToken = refreshToken;
        RefreshTokenExpiryTime = expiryTime;
        SetUpdatedAt();
    }

    public void RevokeRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiryTime = null;
        SetUpdatedAt();
    }

    public bool IsRefreshTokenValid()
    {
        return !string.IsNullOrEmpty(RefreshToken)
               && RefreshTokenExpiryTime.HasValue
               && RefreshTokenExpiryTime.Value > DateTime.UtcNow;
    }

    // Validations
    private static void ValidateUsername(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
            throw new DomainException("Username is required");

        if (username.Length < 3 || username.Length > 50)
            throw new DomainException("Username must be between 3 and 50 characters");

        if (!System.Text.RegularExpressions.Regex.IsMatch(username, @"^[a-zA-Z0-9_]+$"))
            throw new DomainException("Username can only contain letters, numbers, and underscores");
    }

    private static void ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("Email is required");

        if (!System.Text.RegularExpressions.Regex.IsMatch(email,
            @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            throw new DomainException("Invalid email format");
    }

    private static void ValidatePasswordHash(string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new DomainException("Password hash is required");
    }
}
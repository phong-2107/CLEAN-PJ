using CLEAN_Pl.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CLEAN_Pl.Infrastructure.Data;

/// <summary>
/// Seeds initial data (permissions, roles, admin user).
/// Skips if data already exists.
/// </summary>
public class DbSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DbSeeder>? _logger;

    public DbSeeder(ApplicationDbContext context, ILogger<DbSeeder>? logger = null)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        var seedResult = new SeedResult();

        // Seed Permissions
        seedResult.PermissionsSeeded = await SeedPermissionsAsync();

        // Seed Roles
        seedResult.RolesSeeded = await SeedRolesAsync();

        // Seed Default Admin User
        seedResult.UsersSeeded = await SeedDefaultAdminAsync();

        // Log summary
        LogSeedSummary(seedResult);
    }

    private async Task<bool> SeedPermissionsAsync()
    {
        var existingCount = await _context.Permissions.CountAsync();

        if (existingCount > 0)
        {
            _logger?.LogDebug("Permissions already exist ({Count} records). Skipping seed.", existingCount);
            return false;
        }

        _logger?.LogInformation("Seeding permissions...");

        var permissions = new List<Domain.Entities.Permission>
        {
            // Product Permissions
            Domain.Entities.Permission.Create("Product.Create", "Product", "Create", "Create new products"),
            Domain.Entities.Permission.Create("Product.Read", "Product", "Read", "View products"),
            Domain.Entities.Permission.Create("Product.Update", "Product", "Update", "Update products"),
            Domain.Entities.Permission.Create("Product.Delete", "Product", "Delete", "Delete products"),

            // User Permissions
            Domain.Entities.Permission.Create("User.Create", "User", "Create", "Create new users"),
            Domain.Entities.Permission.Create("User.Read", "User", "Read", "View users"),
            Domain.Entities.Permission.Create("User.Update", "User", "Update", "Update users"),
            Domain.Entities.Permission.Create("User.Delete", "User", "Delete", "Delete users"),

            // Role Permissions
            Domain.Entities.Permission.Create("Role.Create", "Role", "Create", "Create new roles"),
            Domain.Entities.Permission.Create("Role.Read", "Role", "Read", "View roles"),
            Domain.Entities.Permission.Create("Role.Update", "Role", "Update", "Update roles"),
            Domain.Entities.Permission.Create("Role.Delete", "Role", "Delete", "Delete roles"),

            // Permission Permissions
            Domain.Entities.Permission.Create("Permission.Read", "Permission", "Read", "View permissions"),
        };

        await _context.Permissions.AddRangeAsync(permissions);
        await _context.SaveChangesAsync();

        _logger?.LogInformation("Seeded {Count} permissions.", permissions.Count);
        return true;
    }

    private async Task<bool> SeedRolesAsync()
    {
        var existingCount = await _context.Roles.CountAsync();

        if (existingCount > 0)
        {
            _logger?.LogDebug("Roles already exist ({Count} records). Skipping seed.", existingCount);
            return false;
        }

        _logger?.LogInformation("Seeding roles...");

        // Create Admin Role
        var adminRole = Role.Create("Admin", "System Administrator", isSystemRole: true);
        await _context.Roles.AddAsync(adminRole);
        await _context.SaveChangesAsync();

        // Assign all permissions to Admin
        var allPermissions = await _context.Permissions.ToListAsync();
        foreach (var permission in allPermissions)
        {
            await _context.RolePermissions.AddAsync(
                RolePermission.Create(adminRole.Id, permission.Id, "System"));
        }

        // Create User Role
        var userRole = Role.Create("User", "Regular User", isSystemRole: true);
        await _context.Roles.AddAsync(userRole);
        await _context.SaveChangesAsync();

        // Assign basic permissions to User
        var userPermissions = await _context.Permissions
            .Where(p => p.Resource == "Product" && p.Action == "Read")
            .ToListAsync();

        foreach (var permission in userPermissions)
        {
            await _context.RolePermissions.AddAsync(
                RolePermission.Create(userRole.Id, permission.Id, "System"));
        }

        // Create Manager Role
        var managerRole = Role.Create("Manager", "Product Manager", isSystemRole: false);
        await _context.Roles.AddAsync(managerRole);
        await _context.SaveChangesAsync();

        // Assign product management permissions to Manager
        var managerPermissions = await _context.Permissions
            .Where(p => p.Resource == "Product")
            .ToListAsync();

        foreach (var permission in managerPermissions)
        {
            await _context.RolePermissions.AddAsync(
                RolePermission.Create(managerRole.Id, permission.Id, "System"));
        }

        await _context.SaveChangesAsync();

        _logger?.LogInformation("Seeded 3 roles (Admin, User, Manager) with permissions successfully.");
        return true;
    }

    private async Task<bool> SeedDefaultAdminAsync()
    {
        var existingCount = await _context.Users.CountAsync();

        if (existingCount > 0)
        {
            _logger?.LogDebug("Users already exist ({Count} records). Skipping seed.", existingCount);
            return false;
        }

        _logger?.LogInformation("Seeding default admin...");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        var adminUser = User.Create("admin", "admin@cleanpl.com", passwordHash, "System", "Administrator");
        adminUser.ConfirmEmail();

        await _context.Users.AddAsync(adminUser);
        await _context.SaveChangesAsync();

        // Assign Admin role
        var adminRole = await _context.Roles.FirstAsync(r => r.Name == "Admin");
        await _context.UserRoles.AddAsync(UserRole.Create(adminUser.Id, adminRole.Id, "System"));

        await _context.SaveChangesAsync();

        _logger?.LogInformation("Seeded default admin user (username: admin) successfully.");
        return true;
    }

    private void LogSeedSummary(SeedResult result)
    {
        if (result.AnythingSeeded)
        {
            _logger?.LogInformation(
                "Database seeding completed. Permissions: {Permissions}, Roles: {Roles}, Users: {Users}",
                result.PermissionsSeeded ? "Seeded" : "Existed",
                result.RolesSeeded ? "Seeded" : "Existed",
                result.UsersSeeded ? "Seeded" : "Existed");
        }
        else
        {
            _logger?.LogInformation("Database already contains seed data. No seeding required.");
        }
    }

    private class SeedResult
    {
        public bool PermissionsSeeded { get; set; }
        public bool RolesSeeded { get; set; }
        public bool UsersSeeded { get; set; }
        public bool AnythingSeeded => PermissionsSeeded || RolesSeeded || UsersSeeded;
    }
}
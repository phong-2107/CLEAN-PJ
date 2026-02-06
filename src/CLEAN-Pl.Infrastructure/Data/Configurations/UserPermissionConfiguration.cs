using CLEAN_Pl.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CLEAN_Pl.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for UserPermission entity.
/// Implements composite key and optimized indexes for hybrid permission system.
/// </summary>
public class UserPermissionConfiguration : IEntityTypeConfiguration<UserPermission>
{
    public void Configure(EntityTypeBuilder<UserPermission> builder)
    {
        builder.ToTable("UserPermissions");

        // Composite Primary Key (UserId + PermissionId)
        builder.HasKey(up => new { up.UserId, up.PermissionId });

        // Properties
        builder.Property(up => up.IsGranted)
            .IsRequired();

        builder.Property(up => up.Reason)
            .HasMaxLength(500);

        builder.Property(up => up.AssignedAt)
            .IsRequired();

        builder.Property(up => up.AssignedByUserId)
            .IsRequired();

        builder.Property(up => up.RevokedAt);

        builder.Property(up => up.RevokedByUserId);

        // Relationships
        builder.HasOne(up => up.User)
            .WithMany(u => u.UserPermissions)
            .HasForeignKey(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(up => up.Permission)
            .WithMany(p => p.UserPermissions)
            .HasForeignKey(up => up.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(up => up.AssignedBy)
            .WithMany(u => u.AssignedPermissions)
            .HasForeignKey(up => up.AssignedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(up => up.RevokedBy)
            .WithMany(u => u.RevokedPermissions)
            .HasForeignKey(up => up.RevokedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes for performance optimization
        builder.HasIndex(up => up.UserId)
            .HasDatabaseName("IX_UserPermissions_UserId");

        builder.HasIndex(up => up.PermissionId)
            .HasDatabaseName("IX_UserPermissions_PermissionId");

        builder.HasIndex(up => up.AssignedAt)
            .HasDatabaseName("IX_UserPermissions_AssignedAt");

        builder.HasIndex(up => new { up.UserId, up.IsGranted })
            .HasDatabaseName("IX_UserPermissions_UserId_IsGranted");

        builder.HasIndex(up => new { up.UserId, up.RevokedAt })
            .HasDatabaseName("IX_UserPermissions_UserId_RevokedAt");
    }
}

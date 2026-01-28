using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CLEAN_Pl.Infrastructure.Data.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Domain.Entities.Permission>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Permission> builder)
    {
        builder.ToTable("Permissions");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.Resource)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Action)
            .IsRequired()
            .HasMaxLength(50);

        // Indexes
        builder.HasIndex(p => p.Name).IsUnique();
        builder.HasIndex(p => new { p.Resource, p.Action }).IsUnique();

        // Relationships
        builder.HasMany(p => p.RolePermissions)
            .WithOne(rp => rp.Permission)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
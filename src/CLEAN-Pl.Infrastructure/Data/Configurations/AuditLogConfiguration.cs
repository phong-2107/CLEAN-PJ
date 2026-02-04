using CLEAN_Pl.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CLEAN_Pl.Infrastructure.Data.Configurations;

public sealed class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.UserId)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.UserName)
            .HasMaxLength(100);

        builder.Property(x => x.Action)
            .IsRequired();

        builder.Property(x => x.EntityName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.EntityId)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.OldValues)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.NewValues)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.AffectedColumns)
            .HasMaxLength(500);

        builder.Property(x => x.Timestamp)
            .IsRequired();

        builder.Property(x => x.IpAddress)
            .HasMaxLength(45);

        // Indexes for query performance
        builder.HasIndex(x => x.Timestamp);
        builder.HasIndex(x => new { x.EntityName, x.EntityId });
        builder.HasIndex(x => x.UserId);
    }
}

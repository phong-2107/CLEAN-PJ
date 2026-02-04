namespace CLEAN_Pl.Application.Common;

/// <summary>
/// Configuration settings for audit logging.
/// </summary>
public sealed class AuditSettings
{
    public const string SectionName = "AuditSettings";
    public bool Enabled { get; set; } = true;
    public bool UseBackgroundQueue { get; set; } = true;
    public int BatchSize { get; set; } = 100;
    public int FlushIntervalSeconds { get; set; } = 5;
    public int MaxQueueSize { get; set; } = 10_000;
    public int RetentionDays { get; set; } = 90;
    public List<string> ExcludedEntities { get; set; } =
    [
        "AuditLog",
        "RefreshToken"
    ];
    public List<string> ExcludedProperties { get; set; } =
    [
        "PasswordHash",
        "RefreshToken",
        "SecurityStamp"
    ];
}

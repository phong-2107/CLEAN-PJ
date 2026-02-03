using System.Reflection;

namespace CLEAN_Pl.Application.Interfaces;

/// <summary>
/// Service for auto-discovering and syncing permissions from code to database.
/// Scans Domain entities and Controller attributes to discover permissions.
/// </summary>
public interface IPermissionDiscoveryService
{
    /// <summary>
    /// Discovers permissions from:
    /// 1. Domain entities (auto-generates CRUD: Create, Read, Update, Delete)
    /// 2. [Permission] attributes in controllers (custom permissions)
    /// Then syncs newly discovered permissions to database.
    /// </summary>
    /// <param name="apiAssembly">Assembly containing API controllers</param>
    /// <param name="domainAssembly">Assembly containing Domain entities</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Result containing discovery statistics</returns>
    Task<PermissionDiscoveryResult> DiscoverAndSyncAsync(
        Assembly apiAssembly,
        Assembly domainAssembly,
        CancellationToken ct = default);
}

/// <summary>
/// Result of permission discovery and sync operation.
/// </summary>
public sealed record PermissionDiscoveryResult
{
    /// <summary>Total permissions found in code.</summary>
    public int TotalDiscovered { get; init; }

    /// <summary>New permissions added to database.</summary>
    public int NewlyAdded { get; init; }

    /// <summary>Permissions auto-generated from entities.</summary>
    public int FromEntities { get; init; }

    /// <summary>Permissions discovered from [Permission] attributes.</summary>
    public int FromAttributes { get; init; }

    /// <summary>List of newly added permission names.</summary>
    public IReadOnlyList<string> AddedPermissions { get; init; } = [];

    /// <summary>Permissions in DB but not in code (orphaned).</summary>
    public IReadOnlyList<string> OrphanedPermissions { get; init; } = [];
}

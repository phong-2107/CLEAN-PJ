using System.Reflection;

namespace CLEAN_Pl.Application.Interfaces;

//
/// Service for auto-discovering and syncing permissions from code to database.
/// Scans Domain entities and Controller attributes to discover permissions.
/// 
public interface IPermissionDiscoveryService
{
    //
    /// Discovers permissions from:
    /// 1. Domain entities (auto-generates CRUD: Create, Read, Update, Delete)
    /// 2. [Permission] attributes in controllers (custom permissions)
    /// Then syncs newly discovered permissions to database.
    /// 
    /// <param name="apiAssembly">Assembly containing API controllers</param>
    /// <param name="domainAssembly">Assembly containing Domain entities</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Result containing discovery statistics</returns>
    Task<PermissionDiscoveryResult> DiscoverAndSyncAsync(
        Assembly apiAssembly,
        Assembly domainAssembly,
        CancellationToken ct = default);
}

/// Result of permission discovery and sync operation.
public sealed record PermissionDiscoveryResult
{
    //Total permissions found in code.
    public int TotalDiscovered { get; init; }

    //New permissions added to database.
    public int NewlyAdded { get; init; }

    //Permissions auto-generated from entities.
    public int FromEntities { get; init; }

    //Permissions discovered from [Permission] attributes.
    public int FromAttributes { get; init; }

    //List of newly added permission names.
    public IReadOnlyList<string> AddedPermissions { get; init; } = [];

    //Permissions in DB but not in code (orphaned).
    public IReadOnlyList<string> OrphanedPermissions { get; init; } = [];
}

-- ====================================================
-- SQL VERIFICATION QUERIES
-- Use these to verify User Permission System in database
-- ====================================================

USE CleanPlDb;
GO

PRINT '========================================';
PRINT '1. CHECK NEW PERMISSIONS';
PRINT '========================================';
SELECT 
    p.Id,
    p.Name,
    p.Resource,
    p.[Action],
    p.Description
FROM Permissions p
WHERE p.[Action] IN ('ReadPermissions', 'GrantPermission', 'DenyPermission', 'RevokePermission')
ORDER BY p.Id;
GO

PRINT '';
PRINT '========================================';
PRINT '2. CHECK USERPERMISSIONS TABLE';
PRINT '========================================';
SELECT 
    COUNT(*) AS TotalOverrides,
    SUM(CASE WHEN IsGranted = 1 THEN 1 ELSE 0 END) AS GrantedCount,
    SUM(CASE WHEN IsGranted = 0 THEN 1 ELSE 0 END) AS DeniedCount,
    SUM(CASE WHEN RevokedAt IS NULL THEN 1 ELSE 0 END) AS ActiveCount,
    SUM(CASE WHEN RevokedAt IS NOT NULL THEN 1 ELSE 0 END) AS RevokedCount
FROM UserPermissions;
GO

PRINT '';
PRINT '========================================';
PRINT '3. USER PERMISSION OVERRIDES DETAIL';
PRINT '========================================';
SELECT 
    u.Id AS UserId,
    u.Username,
    p.Name AS PermissionName,
    p.Resource + '.' + p.[Action] AS PermissionCode,
    CASE 
        WHEN up.IsGranted = 1 THEN 'GRANTED'
        ELSE 'DENIED'
    END AS OverrideType,
    up.Reason,
    up.AssignedAt,
    assignedBy.Username AS AssignedBy,
    up.RevokedAt,
    revokedBy.Username AS RevokedBy,
    CASE 
        WHEN up.RevokedAt IS NULL THEN 'ACTIVE'
        ELSE 'REVOKED'
    END AS Status
FROM UserPermissions up
JOIN Users u ON up.UserId = u.Id
JOIN Permissions p ON up.PermissionId = p.Id
JOIN Users assignedBy ON up.AssignedByUserId = assignedBy.Id
LEFT JOIN Users revokedBy ON up.RevokedByUserId = revokedBy.Id
ORDER BY up.AssignedAt DESC;
GO

PRINT '';
PRINT '========================================';
PRINT '4. USER EFFECTIVE PERMISSIONS';
PRINT '========================================';
-- Show effective permissions for a specific user (change UserId as needed)
DECLARE @TestUserId INT = 2;

WITH RolePermissions AS (
    -- Get permissions from roles
    SELECT DISTINCT
        @TestUserId AS UserId,
        p.Id AS PermissionId,
        p.Name AS PermissionName,
        p.Resource,
        p.[Action],
        'ROLE' AS Source,
        STRING_AGG(r.Name, ', ') AS SourceDetail
    FROM UserRoles ur
    JOIN Roles r ON ur.RoleId = r.Id
    JOIN RolePermissions rp ON r.Id = rp.RoleId
    JOIN Permissions p ON rp.PermissionId = p.Id
    WHERE ur.UserId = @TestUserId
    GROUP BY p.Id, p.Name, p.Resource, p.[Action]
),
UserOverrides AS (
    -- Get user-specific overrides
    SELECT
        up.UserId,
        up.PermissionId,
        p.Name AS PermissionName,
        p.Resource,
        p.[Action],
        CASE 
            WHEN up.IsGranted = 1 THEN 'GRANTED'
            ELSE 'DENIED'
        END AS Source,
        up.Reason AS SourceDetail,
        up.IsGranted
    FROM UserPermissions up
    JOIN Permissions p ON up.PermissionId = p.Id
    WHERE up.UserId = @TestUserId
      AND up.RevokedAt IS NULL
)
-- Combine: (Role Permissions - Denied) + Granted
SELECT 
    rp.UserId,
    u.Username,
    rp.PermissionId,
    rp.PermissionName,
    rp.Resource,
    rp.[Action],
    rp.Source,
    rp.SourceDetail
FROM RolePermissions rp
JOIN Users u ON rp.UserId = u.Id
LEFT JOIN UserOverrides uo ON rp.PermissionId = uo.PermissionId 
    AND uo.IsGranted = 0 -- Denied
WHERE uo.PermissionId IS NULL -- Not denied

UNION

-- Add granted permissions
SELECT 
    uo.UserId,
    u.Username,
    uo.PermissionId,
    uo.PermissionName,
    uo.Resource,
    uo.[Action],
    uo.Source,
    uo.SourceDetail
FROM UserOverrides uo
JOIN Users u ON uo.UserId = u.Id
WHERE uo.IsGranted = 1

ORDER BY Resource, [Action];
GO

PRINT '';
PRINT '========================================';
PRINT '5. AUDIT TRAIL';
PRINT '========================================';
-- Show audit trail for user permission changes
SELECT TOP 20
    u.Username AS TargetUser,
    p.Name AS Permission,
    CASE 
        WHEN up.IsGranted = 1 THEN 'GRANT'
        ELSE 'DENY'
    END AS ActionType,
    up.Reason,
    up.AssignedAt AS Timestamp,
    assignedBy.Username AS PerformedBy,
    CASE 
        WHEN up.RevokedAt IS NOT NULL 
        THEN CONCAT('Revoked at ', FORMAT(up.RevokedAt, 'yyyy-MM-dd HH:mm'), ' by ', revokedBy.Username)
        ELSE 'Active'
    END AS CurrentStatus
FROM UserPermissions up
JOIN Users u ON up.UserId = u.Id
JOIN Permissions p ON up.PermissionId = p.Id
JOIN Users assignedBy ON up.AssignedByUserId = assignedBy.Id
LEFT JOIN Users revokedBy ON up.RevokedByUserId = revokedBy.Id
ORDER BY up.AssignedAt DESC;
GO

PRINT '';
PRINT '========================================';
PRINT '6. INDEX PERFORMANCE CHECK';
PRINT '========================================';
SELECT 
    i.name AS IndexName,
    OBJECT_NAME(i.object_id) AS TableName,
    i.type_desc AS IndexType,
    COL_NAME(ic.object_id, ic.column_id) AS ColumnName
FROM sys.indexes i
JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
WHERE OBJECT_NAME(i.object_id) = 'UserPermissions'
ORDER BY i.index_id, ic.key_ordinal;
GO

PRINT '';
PRINT 'Verification Complete!';
PRINT '========================================';

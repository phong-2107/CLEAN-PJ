-- ====================================================
-- SEED NEW USER PERMISSION MANAGEMENT PERMISSIONS
-- Run this if your database already has existing data
-- ====================================================

USE CleanPlDb;
GO

-- Check if permissions already exist
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE [Action] = 'ReadPermissions')
BEGIN
    PRINT 'Seeding new User Permission Management permissions...';
    
    DECLARE @Now DATETIME2 = GETUTCDATE();
    DECLARE @NextId INT = (SELECT ISNULL(MAX(Id), 0) + 1 FROM Permissions);
    
    -- Insert 4 new permissions
    INSERT INTO Permissions (Id, Name, Resource, [Action], Description, CreatedAt, UpdatedAt)
    VALUES 
        (@NextId, 'User.ReadPermissions', 'User', 'ReadPermissions', 'View user permissions', @Now, NULL),
        (@NextId + 1, 'User.GrantPermission', 'User', 'GrantPermission', 'Grant additional permissions to specific users', @Now, NULL),
        (@NextId + 2, 'User.DenyPermission', 'User', 'DenyPermission', 'Deny/revoke permissions from specific users', @Now, NULL),
        (@NextId + 3, 'User.RevokePermission', 'User', 'RevokePermission', 'Revoke user-specific permission overrides', @Now, NULL);
    
    PRINT 'Seeded 4 new permissions successfully.';
    
    -- Assign to Admin role automatically
    DECLARE @AdminRoleId INT = (SELECT Id FROM Roles WHERE Name = 'Admin');
    
    IF @AdminRoleId IS NOT NULL
    BEGIN
        INSERT INTO RolePermissions (RoleId, PermissionId, GrantedBy, GrantedAt)
        SELECT @AdminRoleId, Id, 'System', @Now
        FROM Permissions
        WHERE [Action] IN ('ReadPermissions', 'GrantPermission', 'DenyPermission', 'RevokePermission');
        
        PRINT 'Assigned new permissions to Admin role.';
    END
END
ELSE
BEGIN
    PRINT 'Permissions already exist. Skipping seed.';
END
GO

-- Verify
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

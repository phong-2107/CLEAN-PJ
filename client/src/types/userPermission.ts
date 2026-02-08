export interface UserPermissionDetail {
    permissionId: string;
    permissionName: string;
    permissionDescription?: string;
    resource: string;
    action: string;
    isGranted: boolean; // Computed final result (Role - Denied + Granted)
    source: 'Role' | 'Grant' | 'Deny';
    roleName?: string; // If source is Role
    reason?: string; // If source is Grant/Deny
    assignedAt?: string;
    assignedBy?: string;
}

export interface UserPermissionOverride {
    userId: number;
    permissionId: string;
    isGranted: boolean;
    reason: string;
    permissionName?: string; // For display convenience
}

export interface GrantPermissionRequest {
    permissionId: string;
    reason: string;
}

export interface DenyPermissionRequest {
    permissionId: string;
    reason: string;
}

export interface MissingPermissionItem {
    id: number;
    name: string;
    resource: string;
    action: string;
}

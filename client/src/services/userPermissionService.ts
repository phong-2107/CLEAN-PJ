import {
    UserPermissionDetail,
    UserPermissionOverride,
    GrantPermissionRequest,
    DenyPermissionRequest,
    MissingPermissionItem
} from '../types/userPermission';
import api from './api';

/**
 * Service for managing advanced user permissions (Hybrid RBAC + ABAC)
 */
const userPermissionService = {
    /**
     * Get list of permissions the user does NOT have (for Grant selection)
     */
    getMissingPermissions: async (userId: number | string): Promise<MissingPermissionItem[]> => {
        try {
            const response = await api.get<{ missingPermissions: MissingPermissionItem[] }>(`/users/${userId}/permissions/missing`);
            return response.data.missingPermissions;
        } catch (error) {
            console.error('Failed to fetch missing permissions', error);
            return [];
        }
    },

    /**
     * Get detailed permissions for a user including source (Role/Grant/Deny)
     */
    getUserPermissions: async (userId: number | string): Promise<UserPermissionDetail[]> => {
        try {
            const response = await api.get<{ permissions: any[] }>(`/users/${userId}/permissions/effective`);

            return response.data.permissions.map((p: any) => ({
                permissionId: p.id.toString(),
                permissionName: p.name,
                resource: p.resource,
                action: p.action,
                isGranted: true, // Effective permissions are always granted
                source: p.source === 'Role' ? 'Role' : 'Grant',
                roleName: p.source === 'Role' ? 'Assigned Roles' : undefined,
                assignedBy: 'System'
            }));
        } catch (error) {
            console.error('Failed to fetch user permissions', error);
            return [];
        }
    },

    /**
     * Get specific overrides for a user
     */
    getUserOverrides: async (userId: number | string): Promise<UserPermissionOverride[]> => {
        try {
            const response = await api.get<UserPermissionOverride[]>(`/users/${userId}/permissions/overrides`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user overrides', error);
            return [];
        }
    },

    /**
     * Grant a specific permission to a user (Override)
     */
    grantPermission: async (userId: number | string, data: GrantPermissionRequest): Promise<void> => {
        await api.post(`/users/${userId}/permissions/grant`, data);
    },

    /**
     * Deny a specific permission for a user (Override)
     */
    denyPermission: async (userId: number | string, data: DenyPermissionRequest): Promise<void> => {
        await api.post(`/users/${userId}/permissions/deny`, data);
    },

    /**
     * Revoke an override (Reset to Role default)
     */
    revokeOverride: async (userId: number | string, permissionId: string): Promise<void> => {
        await api.delete(`/users/${userId}/permissions/${permissionId}`);
    }
};

export default userPermissionService;

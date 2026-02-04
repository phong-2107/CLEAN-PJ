import api from './api';
import { Permission } from '../types/role';

// Re-export Permission type for backward compatibility
export type { Permission };

const permissionService = {
    getAll: async () => {
        const response = await api.get<Permission[]>('/permissions');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Permission>(`/permissions/${id}`);
        return response.data;
    },

    getByResource: async (resource: string) => {
        const response = await api.get<Permission[]>(`/permissions/resource/${resource}`);
        return response.data;
    }
};

export default permissionService;


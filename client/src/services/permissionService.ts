import api from './api';

export interface Permission {
    id: string;
    name: string;
    description?: string;
    group?: string;
}

const permissionService = {
    getAll: async () => {
        const response = await api.get<Permission[]>('/permissions');
        return response.data;
    },

    create: async (permission: Omit<Permission, 'id'>) => {
        const response = await api.post<Permission>('/permissions', permission);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/permissions/${id}`);
    }
};

export default permissionService;

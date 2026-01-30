import api from './api';

export interface Role {
    id: string;
    name: string;
    description?: string;
    claims?: string[]; // Assuming permissions are claims or similar
}

const roleService = {
    getAll: async () => {
        const response = await api.get<Role[]>('/roles');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Role>(`/roles/${id}`);
        return response.data;
    },

    create: async (role: Omit<Role, 'id'>) => {
        const response = await api.post<Role>('/roles', role);
        return response.data;
    },

    update: async (id: string, role: Partial<Role>) => {
        const response = await api.put<Role>(`/roles/${id}`, role);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/roles/${id}`);
    }
};

export default roleService;

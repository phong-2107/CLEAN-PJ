import api from './api';
import { Role, Permission, CreateRoleRequest, UpdateRoleRequest } from '../types/role';

// Re-export types for backward compatibility
export type { Role, Permission };

const roleService = {
    getAll: async () => {
        const response = await api.get<Role[]>('/roles');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Role>(`/roles/${id}`);
        return response.data;
    },

    create: async (role: CreateRoleRequest) => {
        const response = await api.post<Role>('/roles', role);
        return response.data;
    },

    update: async (id: string, role: UpdateRoleRequest) => {
        const response = await api.put<Role>(`/roles/${id}`, role);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/roles/${id}`);
    },

    assignPermission: async (roleId: string, permissionId: string) => {
        await api.post(`/roles/${roleId}/permissions/${permissionId}`);
    },

    removePermission: async (roleId: string, permissionId: string) => {
        await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
    }
};

export default roleService;


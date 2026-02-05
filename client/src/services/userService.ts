import api from './api';
import { UserDto, UserQueryParams, PagedUsers } from '../types/user';

/**
 * Service for interacting with the Users API
 */
const userService = {
    /**
     * Get all users
     */
    getAll: async (): Promise<UserDto[]> => {
        const response = await api.get<UserDto[]>('/users');
        return response.data;
    },

    /**
     * Get paginated users with optional filters
     */
    getPaged: async (params: UserQueryParams = {}): Promise<PagedUsers> => {
        const response = await api.get<PagedUsers>('/users/paged', { params });
        return response.data;
    },

    /**
     * Get user by ID
     */
    getById: async (id: number): Promise<UserDto> => {
        const response = await api.get<UserDto>(`/users/${id}`);
        return response.data;
    },

    /**
     * Get total user count (fetches minimal data for efficiency)
     */
    getCount: async (): Promise<number> => {
        const response = await api.get<PagedUsers>('/users/paged', {
            params: { pageNumber: 1, pageSize: 1 }
        });
        return response.data.totalCount;
    },

    /**
     * Create a new user
     */
    create: async (data: {
        username: string;
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        roleIds?: number[];
    }): Promise<UserDto> => {
        const response = await api.post<UserDto>('/users', data);
        return response.data;
    },

    /**
     * Update an existing user
     */
    update: async (id: number, data: {
        email: string;
        firstName?: string;
        lastName?: string;
    }): Promise<void> => {
        await api.put(`/users/${id}`, data);
    },

    /**
     * Delete a user
     */
    delete: async (id: number): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    /**
     * Assign role to user
     */
    assignRole: async (userId: number, roleId: number): Promise<void> => {
        await api.post(`/users/${userId}/roles/${roleId}`);
    },

    /**
     * Remove role from user
     */
    removeRole: async (userId: number, roleId: number): Promise<void> => {
        await api.delete(`/users/${userId}/roles/${roleId}`);
    }
};

export default userService;

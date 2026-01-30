import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';

// Transform API response into User object
const transformToUser = (response: AuthResponse): User => ({
    userId: response.userId,
    username: response.username,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    roles: response.roles || [],
    permissions: response.permissions || [], // Fallback to empty array if not provided
});

const authService = {
    login: async (data: LoginRequest) => {
        console.log('API URL:', '/auth/login');
        console.log('Payload:', data);
        const response = await api.post<AuthResponse>('/auth/login', data);
        console.log('Response:', response.data);

        // Transform and return user + token
        return {
            user: transformToUser(response.data),
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            tokenExpiresAt: response.data.tokenExpiresAt,
        };
    },

    register: async (data: RegisterRequest) => {
        const response = await api.post<AuthResponse>('/auth/register', data);

        // Transform and return user + token
        return {
            user: transformToUser(response.data),
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            tokenExpiresAt: response.data.tokenExpiresAt,
        };
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

export default authService;

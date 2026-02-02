export interface User {
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions?: string[]; // Optional - may not be returned by all endpoints
}

export interface AuthResponse {
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: string;
    roles: string[];
    permissions?: string[]; // Optional - may not be returned by all endpoints
}

export interface LoginRequest {
    usernameOrEmail: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
}

import { PagedResult } from './product';

/**
 * User DTO matching backend UserDto
 */
export interface UserDto {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isActive: boolean;
    emailConfirmed?: boolean;
    lastLoginAt?: string;
    createdAt?: string;
    roles: string[];
}

/**
 * Query parameters for user list
 */
export interface UserQueryParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
}

export type PagedUsers = PagedResult<UserDto>;

import api from './api';

/**
 * Category DTO matching backend CategoryDto
 */
export interface Category {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    parentCategoryId?: number;
    parentCategoryName?: string;
    createdAt: string;
    updatedAt?: string;
}

/**
 * Service for interacting with the Categories API
 */
const categoryService = {
    /**
     * Get all categories
     */
    getAll: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },

    /**
     * Get only active categories (for dropdowns)
     */
    getActive: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/categories/active');
        return response.data;
    },

    /**
     * Get category by ID
     */
    getById: async (id: number): Promise<Category> => {
        const response = await api.get<Category>(`/categories/${id}`);
        return response.data;
    }
};

export default categoryService;

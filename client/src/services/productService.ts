import api from './api';
import { Product, CreateProductRequest, UpdateProductRequest, PagedResult, ProductQueryParams } from '../types/product';

const productService = {
    getAll: async () => {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },

    getPaged: async (params: ProductQueryParams = {}) => {
        const response = await api.get<PagedResult<Product>>('/products/paged', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    create: async (data: CreateProductRequest) => {
        const response = await api.post<Product>('/products', data);
        return response.data;
    },

    update: async (id: string, data: UpdateProductRequest) => {
        const response = await api.put<Product>(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/products/${id}`);
    }
};

export default productService;


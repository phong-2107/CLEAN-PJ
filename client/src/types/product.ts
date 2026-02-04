export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category?: string;
    status?: 'in_stock' | 'low_stock' | 'out_of_stock';
    image?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductRequest {
    name: string;
    description: string;
    price: number;
    stock: number;
    category?: string;
}

export interface UpdateProductRequest extends CreateProductRequest {
    id: string;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface ProductQueryParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    category?: string;
}

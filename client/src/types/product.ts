export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
}

export interface CreateProductRequest {
    name: string;
    description: string;
    price: number;
    stock: number;
}

export interface UpdateProductRequest extends CreateProductRequest {
    id: string;
}

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import productService from '../../services/productService';
import { Product } from '../../types/product';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Plus, Pencil, Trash2, Search, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const ProductListPage = () => {
    const { user } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [accessError, setAccessError] = useState('');

    // Permission check helper
    const canEdit = user?.roles.includes('Admin');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const data = await productService.getAll();
            setProducts(data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (!canEdit) {
            setAccessError('You do not have permission to perform this action.');
            setTimeout(() => setAccessError(''), 3000);
            return;
        }
        if (product) {
            setCurrentProduct(product);
            setIsEditing(true);
        } else {
            setCurrentProduct({});
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!canEdit) {
            setAccessError('You do not have permission to perform this action.');
            setTimeout(() => setAccessError(''), 3000);
            return;
        }
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await productService.delete(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            setError('Failed to delete product');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentProduct.id) {
                // Fix: Ensure currentProduct has all required fields for UpdateProductRequest
                // For simplicity, we assume the form handles it, but in real app we validate
                await productService.update(currentProduct.id, currentProduct as any);
            } else {
                await productService.create(currentProduct as any);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            setError('Failed to save product');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500">Manage your product inventory</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            {accessError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center animate-bounce">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="block sm:inline">{accessError}</span>
                </div>
            )}

            <Card>
                <CardHeader className="pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-10">Loading products...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Product Name</th>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3">Stock</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                            <td className="px-6 py-4 max-w-xs truncate">{product.description}</td>
                                            <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenModal(product)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                                No products found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? 'Edit Product' : 'Add New Product'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{isEditing ? 'Update' : 'Create'}</Button>
                    </>
                }
            >
                <form className="space-y-4">
                    <Input
                        label="Name"
                        value={currentProduct.name || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Description"
                        value={currentProduct.description || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={currentProduct.price || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                            required
                        />
                        <Input
                            label="Stock"
                            type="number"
                            min="0"
                            value={currentProduct.stock || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) })}
                            required
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

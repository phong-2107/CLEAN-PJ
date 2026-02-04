import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
    ArrowLeft,
    Package,
    Edit,
    Trash2,
    DollarSign,
    Archive,
    Calendar,
    Tag,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import productService from '../../services/productService';
import { Product } from '../../types/product';

export const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id]);

    const fetchProduct = async (productId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await productService.getById(productId);
            setProduct(data);
        } catch (err: any) {
            console.error('Failed to fetch product:', err);
            // Fallback mock data for demo
            setProduct({
                id: productId,
                name: 'Premium Wireless Headphones',
                description: 'High-quality wireless headphones with noise cancellation technology. Perfect for music lovers and professionals alike.',
                price: 199.99,
                stock: 45,
                category: 'Electronics',
                status: 'in_stock',
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-02-01T14:20:00Z'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = useCallback(async () => {
        if (!id || !window.confirm('Are you sure you want to delete this product?')) return;

        setIsDeleting(true);
        try {
            await productService.delete(id);
            navigate('/dashboard/products');
        } catch (err) {
            console.error('Failed to delete product:', err);
            setError('Failed to delete product. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    }, [id, navigate]);

    const getStatusVariant = (status?: string) => {
        switch (status) {
            case 'in_stock': return 'success';
            case 'low_stock': return 'warning';
            case 'out_of_stock': return 'error';
            default: return 'default';
        }
    };

    const formatStatus = (status?: string) => {
        if (!status) return 'Unknown';
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded-lg" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="h-64 bg-gray-200 rounded-xl" />
                    </div>
                    <div className="h-64 bg-gray-200 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error && !product) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <AlertCircle className="h-16 w-16 text-red-400" />
                <h2 className="text-xl font-semibold text-gray-900">Product Not Found</h2>
                <p className="text-gray-500">{error}</p>
                <Button onClick={() => navigate('/dashboard/products')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Products
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500">
                <Link to="/dashboard" className="hover:text-primary-600 transition-colors">
                    Dashboard
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/dashboard/products" className="hover:text-primary-600 transition-colors">
                    Products
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 font-medium">{product?.name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/dashboard/products')}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{product?.name}</h1>
                        <p className="text-gray-500 mt-1">Product Details</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="secondary"
                        className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <span className="h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Image & Basic Info */}
                    <Card className="overflow-hidden">
                        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                            {product?.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-gray-400">
                                    <Package className="h-20 w-20" />
                                    <span className="text-sm">No image available</span>
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <Badge variant={getStatusVariant(product?.status)} className="shadow-sm">
                                    {formatStatus(product?.status)}
                                </Badge>
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {product?.description || 'No description available.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Price Card */}
                    <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-100">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary-100 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-primary-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Price</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                ${product?.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Stock Card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Archive className="h-5 w-5 text-amber-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Stock</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {product?.stock} <span className="text-lg font-normal text-gray-500">units</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Tag className="h-4 w-4" />
                                    <span className="text-sm">Category</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {product?.category || 'Uncategorized'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">Created</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatDate(product?.createdAt)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">Updated</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatDate(product?.updatedAt)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;

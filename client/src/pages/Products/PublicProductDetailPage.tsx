import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { Button } from '../../components/ui/Button';
import { Product } from '../../types/product';
import productService from '../../services/productService'; // Assuming this exists and works
import {
    ShoppingCart,
    Heart,
    Share2,
    Star,
    Truck,
    ShieldCheck,
    RefreshCw,
    Minus,
    Plus,
    Loader2,
    Package
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const PublicProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    // Mock data for demo if API fails or for additional fields not in DB yet
    const features = [
        'Premium quality materials',
        '1 year warranty included',
        'Free shipping on orders over $50',
        '30-day money-back guarantee'
    ];

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await productService.getById(id);
                setProduct(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch product:', err);
                // Fallback for demo
                setProduct({
                    id: id,
                    name: 'Premium Headphones',
                    description: 'Experience high-fidelity sound with these premium noise-cancelling headphones. Designed for comfort and long listening sessions.',
                    price: 299.99,
                    category: 'Electronics',
                    stock: 15,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                } as Product);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, Math.min(prev + delta, product?.stock || 1)));
    };

    const handleAddToCart = () => {
        console.log('Added to cart:', { product, quantity });
        // Implement Cart store logic here
    };

    if (loading) {
        return (
            <PublicLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                </div>
            </PublicLayout>
        );
    }

    if (error || !product) {
        return (
            <PublicLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <Package className="h-16 w-16 text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
                    <p className="text-gray-500 mt-2 mb-6">The product you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => navigate('/products')}>Browse Products</Button>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                                    <Package className="h-24 w-24" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                                    <Heart className="h-5 w-5 text-gray-400 hover:text-red-500" />
                                </button>
                            </div>
                        </div>
                        {/* Thumbnails (Mock) */}
                        <div className="grid grid-cols-4 gap-4">
                            {[0, 1, 2, 3].map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={cn(
                                        "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                        activeImage === idx ? "border-primary-600 ring-2 ring-primary-100" : "border-transparent hover:border-gray-200"
                                    )}
                                >
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-6">
                            <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                                {product.category || 'Uncategorized'}
                            </span>
                            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                                {product.name}
                            </h1>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">(128 reviews)</span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-4 mb-8">
                            <p className="text-4xl font-bold text-gray-900">
                                ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            {/* <p className="text-xl text-gray-400 line-through">$399.99</p> */}
                        </div>

                        <div className="prose prose-sm text-gray-600 mb-8">
                            <p>{product.description}</p>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-8">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="h-3 w-3 text-green-600" />
                                    </div>
                                    <span className="text-sm text-gray-600">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="space-y-4 border-t border-gray-100 pt-8">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="p-3 hover:bg-gray-50 text-gray-600 transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="p-3 hover:bg-gray-50 text-gray-600 transition-colors"
                                        disabled={quantity >= (product.stock || 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={handleAddToCart}
                                    className="flex-1 gap-2 bg-primary-600 hover:bg-primary-700"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    Add to Cart
                                </Button>
                                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 text-center">
                                {product.stock > 0 ? (
                                    <span className="text-green-600 font-medium">In Stock</span>
                                ) : (
                                    <span className="text-red-500 font-medium">Out of Stock</span>
                                )}
                                - Ships within 24 hours
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <Truck className="h-6 w-6 text-primary-600" />
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Free Shipping</p>
                                    <p className="text-xs text-gray-500">On orders over $50</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <RefreshCw className="h-6 w-6 text-primary-600" />
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Free Returns</p>
                                    <p className="text-xs text-gray-500">Within 30 days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

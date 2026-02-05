import React, { useState, useEffect, useCallback } from 'react';
import { Package, Eye, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import productService from '../../services/productService';
import { Product } from '../../types/product';
import { cn } from '../../utils/cn';

interface ProductOverviewProps {
    className?: string;
    limit?: number;
}

export const ProductOverview: React.FC<ProductOverviewProps> = ({
    className,
    limit = 5
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await productService.getPaged({ pageNumber: 1, pageSize: limit });
            setProducts(result.items);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const getStockStatus = (stock: number): { label: string; variant: 'success' | 'warning' | 'error' } => {
        if (stock > 20) return { label: 'In Stock', variant: 'success' };
        if (stock > 0) return { label: 'Low Stock', variant: 'warning' };
        return { label: 'Out of Stock', variant: 'error' };
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="h-6 w-16 bg-gray-100 rounded-full" />
                </div>
            ))}
        </div>
    );

    return (
        <Card className={cn('h-full', className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Product Overview</h3>
                            <p className="text-xs text-gray-500">Recent products in store</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchProducts}
                            disabled={isLoading}
                        >
                            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => window.location.href = '/dashboard/products'}
                        >
                            View All
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="text-center py-8">
                        <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">{error}</p>
                        <Button variant="ghost" size="sm" onClick={fetchProducts} className="mt-2">
                            Retry
                        </Button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-8">
                        <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No products found</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {products.map((product, index) => {
                            const stockStatus = getStockStatus(product.stock);

                            return (
                                <div
                                    key={product.id}
                                    className={cn(
                                        'flex items-center gap-3 p-3 rounded-lg',
                                        'hover:bg-gray-50 transition-all duration-150',
                                        'group cursor-pointer'
                                    )}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Product Image/Icon */}
                                    <div className={cn(
                                        'h-12 w-12 rounded-lg flex items-center justify-center',
                                        'bg-gradient-to-br from-gray-100 to-gray-200',
                                        'group-hover:from-primary-50 group-hover:to-primary-100',
                                        'transition-all duration-200'
                                    )}>
                                        <Package className="h-6 w-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                                            {product.name}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="font-semibold text-gray-900">
                                                ${product.price.toFixed(2)}
                                            </span>
                                            <span>•</span>
                                            <span>{product.stock} units</span>
                                        </div>
                                    </div>

                                    {/* Stock Status Badge */}
                                    <Badge variant={stockStatus.variant} className="text-xs">
                                        {stockStatus.label}
                                    </Badge>

                                    {/* Hover action */}
                                    <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProductOverview;

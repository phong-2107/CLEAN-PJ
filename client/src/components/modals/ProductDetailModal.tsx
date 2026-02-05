import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import {
    Package,
    DollarSign,
    Layers,
    Calendar,
    Tag
} from 'lucide-react';
import { Product } from '../../types/product';
import { cn } from '../../utils/cn';

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    isOpen,
    onClose,
    product
}) => {
    if (!product) return null;

    const formatDate = (date: string | undefined): string => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStockStatus = () => {
        if (product.stock === 0) return { label: 'Out of Stock', variant: 'error' as const };
        if (product.stock < 10) return { label: 'Low Stock', variant: 'warning' as const };
        return { label: 'In Stock', variant: 'success' as const };
    };

    const stockStatus = getStockStatus();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Product Details"
        >
            <div className="space-y-6">
                {/* Product Header */}
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-20 w-20 rounded-xl object-cover border-2 border-white shadow-md"
                        />
                    ) : (
                        <div className={cn(
                            'h-20 w-20 rounded-xl flex items-center justify-center',
                            'bg-gradient-to-br from-amber-100 to-orange-200 border-2 border-white shadow-md'
                        )}>
                            <Package className="h-10 w-10 text-amber-600" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium mb-2">
                            <DollarSign className="h-4 w-4" />
                            Price
                        </div>
                        <p className="text-2xl font-bold text-emerald-700">
                            ${product.price.toFixed(2)}
                        </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                        <div className="flex items-center gap-2 text-blue-600 text-xs font-medium mb-2">
                            <Layers className="h-4 w-4" />
                            Stock
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                            {product.stock}
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Tag className="h-4 w-4" />
                            <span className="text-sm">Product ID</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">#{product.id}</span>
                    </div>

                    {product.category && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Layers className="h-4 w-4" />
                                <span className="text-sm">Category</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{product.category}</span>
                        </div>
                    )}

                    {product.createdAt && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">Created</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{formatDate(product.createdAt)}</span>
                        </div>
                    )}
                </div>

                {/* Inventory Value */}
                <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-violet-600">Total Inventory Value</span>
                        <span className="text-xl font-bold text-violet-700">
                            ${(product.price * product.stock).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProductDetailModal;

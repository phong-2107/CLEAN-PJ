import React from 'react';
import { Product } from '../../types/product';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProductCardProps {
    product: Product;
    onViewDetails?: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
    className?: string;
}

// Generate a consistent color based on product name
const getProductColor = (name: string) => {
    const colors = [
        'from-blue-100 to-blue-200',
        'from-violet-100 to-violet-200',
        'from-emerald-100 to-emerald-200',
        'from-amber-100 to-amber-200',
        'from-rose-100 to-rose-200',
        'from-cyan-100 to-cyan-200',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onViewDetails,
    onAddToCart,
    className,
}) => {
    const isInStock = product.stock > 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;
    const bgColor = getProductColor(product.name);

    // Generate random rating for demo
    const rating = (3.5 + (product.name.length % 15) * 0.1).toFixed(1);

    return (
        <Card
            className={cn(
                "group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white",
                className
            )}
            onClick={() => onViewDetails?.(product)}
        >
            {/* Product Image */}
            <div className={cn(
                "relative aspect-[4/3] bg-gradient-to-br overflow-hidden",
                bgColor
            )}>
                {/* Product Initial as placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl font-bold text-white/30 select-none">
                        {product.name.charAt(0).toUpperCase()}
                    </span>
                </div>

                {/* Stock Badge */}
                {(!isInStock || isLowStock) && (
                    <div className="absolute top-3 left-3">
                        {!isInStock ? (
                            <Badge variant="error">Sold Out</Badge>
                        ) : isLowStock ? (
                            <Badge variant="warning">Low Stock</Badge>
                        ) : null}
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
                >
                    <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                </button>

                {/* Quick Actions */}
                <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails?.(product);
                        }}
                        className="flex-1 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        Quick View
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart?.(product);
                        }}
                        disabled={!isInStock}
                        className={cn(
                            "p-2 rounded-lg shadow-lg transition-colors",
                            isInStock
                                ? "bg-primary-600 hover:bg-primary-700 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Category Tag */}
                <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                    Product
                </span>

                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {product.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-3">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "h-3.5 w-3.5",
                                    i < Math.floor(Number(rating))
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-200 fill-gray-200"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-400 ml-1">{rating}</span>
                </div>

                {/* Price & Stock */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900">
                            ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        isInStock
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-red-700 bg-red-50"
                    )}>
                        {isInStock ? `${product.stock} left` : 'Sold out'}
                    </span>
                </div>
            </div>
        </Card>
    );
};

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, Filter, Edit, Trash2, Package, Eye, RefreshCw } from 'lucide-react';
import { AddProductModal } from '../../components/products/AddProductModal';
import { ProductDetailModal } from '../../components/modals';
import productService from '../../services/productService';
import { Product } from '../../types/product';

export const ProductsPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Detail modal state
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const pageSize = 10;

    useEffect(() => {
        fetchProducts();
    }, [currentPage]);

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await productService.getPaged({
                pageNumber: currentPage,
                pageSize
            });
            setProducts(result.items);
            setTotalPages(result.totalPages);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            // Fallback mock data for demo
            setProducts([
                { id: '1', name: 'Premium Wireless Headphones', category: 'Electronics', price: 199.99, stock: 45, status: 'in_stock', description: 'High quality audio' },
                { id: '2', name: 'Ergonomic Office Chair', category: 'Furniture', price: 249.50, stock: 12, status: 'low_stock', description: 'Comfortable seating' },
                { id: '3', name: 'Smart Fitness Watch', category: 'Wearables', price: 89.99, stock: 0, status: 'out_of_stock', description: 'Track your fitness' },
                { id: '4', name: 'Professional Camera Lens', category: 'Photography', price: 899.00, stock: 5, status: 'low_stock', description: 'Pro photography gear' },
                { id: '5', name: 'Minimalist Desk Lamp', category: 'Home Decor', price: 45.00, stock: 120, status: 'in_stock', description: 'Modern lighting' },
            ]);
            setTotalPages(3);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage]);

    const handleDelete = useCallback(async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await productService.delete(id);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    }, [fetchProducts]);

    const handleProductCreated = useCallback(() => {
        fetchProducts();
    }, [fetchProducts]);

    const getStatusVariant = (status?: Product['status']) => {
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

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle row click for detail modal
    const handleRowClick = (product: Product) => {
        setSelectedProduct(product);
        setIsDetailModalOpen(true);
    };

    const columns: Column<Product>[] = [
        {
            key: 'name',
            header: 'Product',
            render: (product) => (
                <div
                    className="flex items-center gap-4 cursor-pointer group"
                    onClick={() => navigate(`/dashboard/products/${product.id}`)}
                >
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200 group-hover:border-primary-300 transition-colors">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                        ) : (
                            <Package className="h-6 w-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category || 'Uncategorized'}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'price',
            header: 'Price',
            render: (product) => (
                <span className="text-gray-900 font-medium">
                    ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            key: 'stock',
            header: 'Stock',
            render: (product) => (
                <span className="text-gray-700">{product.stock} units</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (product) => (
                <Badge variant={getStatusVariant(product.status)}>
                    {formatStatus(product.status)}
                </Badge>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 mt-1">Manage your product catalog.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={fetchProducts}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        className="gap-2 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-0">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button variant="secondary" className="gap-2 flex-1 sm:flex-none">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={filteredProducts}
                        onRowClick={handleRowClick}
                        emptyMessage={isLoading ? "Loading products..." : "No products found"}
                        renderActions={(product) => (
                            <div className="flex justify-end gap-1">
                                <button
                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/dashboard/products/${product.id}`);
                                    }}
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(product.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="py-4 border-t border-gray-100">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProductCreated}
            />

            {/* Product Detail Modal */}
            <ProductDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
};


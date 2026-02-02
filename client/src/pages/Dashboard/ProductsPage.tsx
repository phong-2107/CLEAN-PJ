import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, Filter, Edit, Trash2, Package } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    image?: string;
}

const mockProducts: Product[] = [
    { id: '1', name: 'Premium Wireless Headphones', category: 'Electronics', price: 199.99, stock: 45, status: 'in_stock' },
    { id: '2', name: 'Ergonomic Office Chair', category: 'Furniture', price: 249.50, stock: 12, status: 'low_stock' },
    { id: '3', name: 'Smart Fitness Watch', category: 'Wearables', price: 89.99, stock: 0, status: 'out_of_stock' },
    { id: '4', name: 'Professional Camera Lens', category: 'Photography', price: 899.00, stock: 5, status: 'low_stock' },
    { id: '5', name: 'Minimalist Desk Lamp', category: 'Home Decor', price: 45.00, stock: 120, status: 'in_stock' },
];

export const ProductsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusVariant = (status: Product['status']) => {
        switch (status) {
            case 'in_stock': return 'success';
            case 'low_stock': return 'warning';
            case 'out_of_stock': return 'error';
            default: return 'default';
        }
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const columns: Column<Product>[] = [
        {
            key: 'name',
            header: 'Product',
            render: (product) => (
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                        ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
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
                <Button className="gap-2 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20">
                    <Plus className="h-4 w-4" />
                    Add Product
                </Button>
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
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-inter"
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
                        data={mockProducts}
                        renderActions={() => (
                            <div className="flex justify-end gap-2">
                                <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

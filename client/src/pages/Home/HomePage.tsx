import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { ProductCard } from '../../components/products/ProductCard';
import { Product } from '../../types/product';
import productService from '../../services/productService';
import { Button } from '../../components/ui/Button';
import {
    Search,
    Loader2,
    Package,
    Star,
    Truck,
    Headphones,
    Monitor,
    Shirt,
    Sofa,
    Car,
    Smartphone,
    Watch,
    Gift,
    ChevronRight,
    ArrowRight,
    Check
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Category data
const categories = [
    { id: 'electronics', name: 'Electronics', icon: Monitor, count: 245 },
    { id: 'fashion', name: 'Fashion', icon: Shirt, count: 189 },
    { id: 'home', name: 'Home & Living', icon: Sofa, count: 156 },
    { id: 'automotive', name: 'Automotive', icon: Car, count: 98 },
    { id: 'mobile', name: 'Mobile & Gadgets', icon: Smartphone, count: 312 },
    { id: 'accessories', name: 'Accessories', icon: Watch, count: 167 },
];

// Filter categories for sidebar
const filterCategories = [
    { id: 'all', name: 'All Categories', active: true },
    { id: 'home', name: 'Home' },
    { id: 'auto', name: 'Auto' },
    { id: 'featured', name: 'Featured Listings' },
    { id: 'cosmetics', name: 'Cosmetics' },
    { id: 'antiques', name: 'Antiques' },
    { id: 'gadget', name: 'Gadget' },
    { id: 'trending', name: 'Trending' },
];

export const HomePage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await productService.getAll();
                setProducts(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError('Unable to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleViewDetails = (product: Product) => {
        navigate(`/products/${product.id}`);
    };

    const handleAddToCart = (product: Product) => {
        console.log('Add to cart:', product);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-30">
                    <div className="absolute top-10 right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-40 w-48 h-48 bg-primary-100 rounded-full blur-2xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            Discover Amazing
                            <span className="block text-primary-600">Products Today</span>
                        </h1>
                        <p className="mt-6 text-lg text-gray-600">
                            Find the best deals on thousands of products. Shop with confidence and enjoy fast delivery.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto">
                            <div className="flex items-center bg-white rounded-full shadow-lg shadow-gray-200/50 border border-gray-100 p-2">
                                <div className="flex-1 flex items-center px-4">
                                    <Search className="h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search for products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 ml-3 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="rounded-full px-8 bg-primary-600 hover:bg-primary-700"
                                >
                                    Search
                                </Button>
                            </div>
                        </form>

                        {/* Popular searches */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
                            <span>Popular:</span>
                            {['Electronics', 'Fashion', 'Home Decor', 'Gadgets'].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => setSearchQuery(term)}
                                    className="px-3 py-1 bg-white border border-gray-200 rounded-full hover:border-primary-300 hover:text-primary-600 transition-colors"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse Categories</h2>
                        <p className="text-gray-500 mt-2">Explore our wide range of product categories</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => navigate(`/products?category=${category.id}`)}
                                    className="group flex flex-col items-center p-6 bg-gray-50 hover:bg-primary-50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50"
                                >
                                    <div className="h-14 w-14 rounded-xl bg-white group-hover:bg-primary-100 flex items-center justify-center shadow-sm transition-colors duration-300">
                                        <Icon className="h-7 w-7 text-gray-600 group-hover:text-primary-600 transition-colors" />
                                    </div>
                                    <h3 className="mt-4 font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                                        {category.name}
                                    </h3>
                                    <span className="text-sm text-gray-400 mt-1">{category.count} items</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className="lg:w-64 flex-shrink-0">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                                <nav className="space-y-1">
                                    {filterCategories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                                activeCategory === cat.id
                                                    ? "bg-primary-50 text-primary-700"
                                                    : "text-gray-600 hover:bg-gray-50"
                                            )}
                                        >
                                            {activeCategory === cat.id && (
                                                <Check className="h-4 w-4 text-primary-600" />
                                            )}
                                            {activeCategory !== cat.id && (
                                                <div className="w-4" />
                                            )}
                                            {cat.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Products Grid */}
                        <div className="flex-1">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Products</h2>
                                    <p className="text-gray-500 mt-1">Handpicked products just for you</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                        <option>Sort by: Default</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                        <option>Newest First</option>
                                    </select>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => navigate('/products')}
                                    >
                                        View All
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Products */}
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                                    <span className="ml-3 text-gray-500">Loading products...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">Unable to load products</h3>
                                    <p className="text-gray-500 mt-1">{error}</p>
                                    <Button
                                        variant="secondary"
                                        className="mt-4"
                                        onClick={() => window.location.reload()}
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No products available</h3>
                                    <p className="text-gray-500 mt-1">Check back later for new arrivals!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.slice(0, 9).map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onViewDetails={handleViewDetails}
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Load More */}
                            {products.length > 9 && (
                                <div className="text-center mt-10">
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="gap-2"
                                        onClick={() => navigate('/products')}
                                    >
                                        Load More Products
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges Section */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
                            { icon: Headphones, title: '24/7 Support', desc: 'Contact us anytime' },
                            { icon: Gift, title: 'Gift Cards', desc: 'Available for purchase' },
                            { icon: Star, title: 'Best Quality', desc: 'Guaranteed products' },
                        ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                                        <Icon className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-16 bg-gradient-to-r from-primary-600 to-violet-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Subscribe to Our Newsletter
                    </h2>
                    <p className="mt-3 text-primary-100 max-w-xl mx-auto">
                        Get the latest updates on new products and upcoming sales directly to your inbox.
                    </p>
                    <form className="mt-8 max-w-md mx-auto flex gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-5 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                        <Button className="bg-white text-primary-600 hover:bg-gray-100 px-6">
                            Subscribe
                        </Button>
                    </form>
                </div>
            </section>
        </PublicLayout>
    );
};

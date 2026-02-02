import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import {
    ShoppingBag,
    Menu,
    X,
    User,
    LogOut,
    LayoutDashboard,

    Heart,
    ShoppingCart,
    ChevronDown
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Categories', href: '/categories' },
    { label: 'Deals', href: '/deals' },
    { label: 'Contact', href: '/contact' },
];

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const userDropdownItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="h-4 w-4" />,
            onClick: () => navigate('/dashboard'),
        },
        {
            id: 'profile',
            label: 'My Profile',
            icon: <User className="h-4 w-4" />,
            onClick: () => navigate('/profile'),
        },
        {
            id: 'logout',
            label: 'Sign out',
            icon: <LogOut className="h-4 w-4" />,
            onClick: handleLogout,
            danger: true,
        },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <ShoppingBag className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">CLEAN-PJ</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                            isActive
                                                ? "text-primary-600 bg-primary-50"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            {/* Wishlist */}
                            <button className="hidden sm:flex p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                                <Heart className="h-5 w-5" />
                            </button>

                            {/* Cart */}
                            <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                                <ShoppingCart className="h-5 w-5" />
                                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                    0
                                </span>
                            </button>

                            {/* Divider */}
                            <div className="hidden sm:block w-px h-6 bg-gray-200 mx-2" />

                            {isAuthenticated ? (
                                <Dropdown
                                    trigger={
                                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                            <Avatar
                                                size="sm"
                                                fallback={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                                            />
                                            <span className="hidden md:block text-sm font-medium text-gray-700">
                                                {user?.firstName || user?.username || 'User'}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    }
                                    items={userDropdownItems}
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg ml-1"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div className="lg:hidden py-4 border-t border-gray-100 animate-fade-in">
                            <nav className="flex flex-col gap-1">
                                {navLinks.map((link) => {
                                    const isActive = location.pathname === link.href;
                                    return (
                                        <Link
                                            key={link.href}
                                            to={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                                isActive
                                                    ? "text-primary-600 bg-primary-50"
                                                    : "text-gray-600 hover:bg-gray-50"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                                {!isAuthenticated && (
                                    <>
                                        <hr className="my-2 border-gray-100" />
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="px-4 py-3 text-sm font-medium text-primary-600 hover:bg-gray-50 rounded-lg"
                                        >
                                            Sign in
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                        {/* Brand */}
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                    <ShoppingBag className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">CLEAN-PJ</span>
                            </div>
                            <p className="text-sm text-gray-400 max-w-sm">
                                Your one-stop destination for quality products. We deliver excellence with every purchase.
                            </p>
                            <div className="mt-6">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>

                        {/* Home Links */}
                        <div>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Home</h3>
                            <ul className="space-y-3">
                                <li><Link to="/" className="text-sm hover:text-white transition-colors">Home</Link></li>
                                <li><Link to="/products" className="text-sm hover:text-white transition-colors">Products</Link></li>
                                <li><Link to="/deals" className="text-sm hover:text-white transition-colors">Deals</Link></li>
                            </ul>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Categories</h3>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-sm hover:text-white transition-colors">Electronics</a></li>
                                <li><a href="#" className="text-sm hover:text-white transition-colors">Fashion</a></li>
                                <li><a href="#" className="text-sm hover:text-white transition-colors">Home & Living</a></li>
                            </ul>
                        </div>

                        {/* Login */}
                        <div>
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h3>
                            <ul className="space-y-3">
                                <li><Link to="/login" className="text-sm hover:text-white transition-colors">Sign in</Link></li>
                                <li><Link to="/register" className="text-sm hover:text-white transition-colors">Register</Link></li>
                                <li><Link to="/dashboard" className="text-sm hover:text-white transition-colors">Dashboard</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm">&copy; {new Date().getFullYear()} CLEAN-PJ. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-sm hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="text-sm hover:text-white transition-colors">Terms</a>
                            <a href="#" className="text-sm hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { SearchBar } from '../ui/SearchBar';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import {
    LayoutDashboard,
    Package,
    LogOut,
    Menu,
    X,
    ShoppingCart,
    Users,
    MessageSquare,
    Settings,
    Shield,
    HelpCircle,
    BarChart3,
    Puzzle,
    Receipt,
    Percent,
    Bell,
    RefreshCw,
    User as UserIcon,
    CreditCard
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItem {
    label: string;
    icon: React.ElementType;
    href: string;
    roles?: string[]; // RBAC: Roles required to see this item
}

interface NavSection {
    title?: string;
    items: NavItem[];
    roles?: string[]; // RBAC: Roles required to see this section
}

const navSections: NavSection[] = [
    {
        title: 'MAIN',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
            { label: 'Orders', icon: ShoppingCart, href: '/dashboard/orders' },
            { label: 'Customers', icon: Users, href: '/dashboard/customers' }, // Renaming to Customers for now, can be Users
            { label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
        ],
    },
    {
        title: 'MANAGEMENT',
        // roles: ['Admin', 'Manager'], // RBAC: Temporarily disabled for visibility
        items: [
            { label: 'Products', icon: Package, href: '/dashboard/products' },
            { label: 'Users', icon: UserIcon, href: '/dashboard/users' /*, roles: ['Admin'] */ }, // RBAC: Temporarily disabled
            { label: 'Roles', icon: Shield, href: '/dashboard/roles' },
            { label: 'Permissions', icon: CreditCard, href: '/dashboard/permissions' }, // Using CreditCard temporarily as key icon replacement
            { label: 'Integrations', icon: Puzzle, href: '/dashboard/integrations' },
            { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
            { label: 'Invoice', icon: Receipt, href: '/dashboard/invoice' },
            { label: 'Discount', icon: Percent, href: '/dashboard/discount' },
        ],
    },
    {
        title: 'SETTINGS',
        items: [
            { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
            { label: 'Security', icon: Shield, href: '/dashboard/security' },
            { label: 'Help', icon: HelpCircle, href: '/dashboard/help' },
        ],
    },
];

export const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const hasAccess = (requiredRoles?: string[]) => {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        if (!user?.roles) return false;
        return requiredRoles.some(role => user.roles.includes(role));
    };

    const userDropdownItems = [
        {
            id: 'profile',
            label: 'My Profile',
            icon: <UserIcon className="h-4 w-4" />,
            onClick: () => navigate('/dashboard/profile'),
        },
        {
            id: 'billing',
            label: 'Billing',
            icon: <CreditCard className="h-4 w-4" />,
            onClick: () => navigate('/dashboard/billing'),
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: <Settings className="h-4 w-4" />,
            onClick: () => navigate('/dashboard/settings'),
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
        <div className="min-h-screen bg-slate-50 flex font-inter">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
                    !isSidebarOpen && "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-20 flex items-center px-8 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">CLEAN-PJ</span>
                        </div>
                        <button
                            className="ml-auto lg:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                        {navSections.map((section, sectionIndex) => {
                            if (!hasAccess(section.roles)) return null;

                            const visibleItems = section.items.filter(item => hasAccess(item.roles));
                            if (visibleItems.length === 0) return null;

                            return (
                                <div key={sectionIndex} className={cn(sectionIndex > 0 && "mt-8")}>
                                    {section.title && (
                                        <h3 className="px-4 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            {section.title}
                                        </h3>
                                    )}
                                    <div className="space-y-1">
                                        {visibleItems.map((item) => {
                                            const Icon = item.icon;
                                            // Better active check:
                                            const isLinkActive = item.href === '/dashboard'
                                                ? location.pathname === '/dashboard'
                                                : location.pathname.startsWith(item.href);

                                            return (
                                                <Link
                                                    key={item.href}
                                                    to={item.href}
                                                    className={cn(
                                                        "group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                                        isLinkActive
                                                            ? "bg-primary-50 text-primary-700 shadow-sm"
                                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon
                                                            className={cn(
                                                                "h-5 w-5 transition-colors duration-200",
                                                                isLinkActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                                                            )}
                                                        />
                                                        {item.label}
                                                    </div>
                                                    {isLinkActive && (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </nav>

                    {/* User Profile Footer */}
                    <div className="p-4 border-t border-gray-50">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <Avatar size="sm" fallback={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'U'} className="bg-white border border-gray-200" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                            </div>
                            <Settings className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => navigate('/dashboard/settings')} />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-4 lg:px-8 sticky top-0 z-30 justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Search Bar */}
                        <SearchBar
                            className="hidden md:block w-96 transform transition-all duration-300 focus-within:w-[28rem] focus-within:ring-2 focus-within:ring-primary-100"
                            placeholder="Search anything... (⌘K)"
                        />
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 border-r border-gray-100 pr-4 mr-2">
                            <button className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200">
                                <RefreshCw className="h-5 w-5" />
                            </button>
                            <button className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 relative group">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* User Dropdown */}
                        <Dropdown
                            trigger={
                                <button className="flex items-center gap-2 group">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:ring-primary-200 transition-all">
                                        {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                    </div>
                                </button>
                            }
                            items={userDropdownItems}
                        />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <div className="max-w-7xl mx-auto animate-fade-in-up">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

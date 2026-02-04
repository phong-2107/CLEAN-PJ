import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/Pagination';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import {
    Package,
    Users,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Filter,
    Search,
    Download,
    Plus,
    MoreVertical
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Mock data for the table
interface Product {
    id: string;
    name: string;
    email: string;
    location: string;
    orders: number;
    spent: number;
    avatar?: string;
}

const mockProducts: Product[] = [
    { id: '1', name: 'Ramisa Sanjana', email: 'ramisa@gmail.com', location: '14 Clifton Down Road, UK', orders: 7, spent: 3331.00 },
    { id: '2', name: 'Mohua Amin', email: 'mohua@gmail.com', location: '405 Kings Road, Chelsea, London', orders: 44, spent: 74331.00 },
    { id: '3', name: 'Estiaq Noor', email: 'estiaqnoor@gmail.com', location: '176 Finchley Road, London', orders: 4, spent: 2331.00 },
    { id: '4', name: 'Reaz Nahid', email: 'reaz@hotmail.com', location: '12 South Bridge, Edinburgh, UK', orders: 27, spent: 44131.89 },
    { id: '5', name: 'Rabbi Amin', email: 'amin@yourmail.com', location: '176 Finchley Road, London', orders: 16, spent: 7331.00 },
    { id: '6', name: 'Sakib Al Baky', email: 'sakib@yahoo.com', location: '405 Kings Road, Chelsea, London', orders: 47, spent: 8231.00 },
    { id: '7', name: 'Maria Nur', email: 'maria@gmail.com', location: '80 High Street, Winchester', orders: 12, spent: 9631.00 },
    { id: '8', name: 'Ahmed Baky', email: 'maria@gmail.com', location: '80 High Street, Winchester', orders: 12, spent: 9631.00 },
];

const tabs = [
    { id: 'all', label: 'All Customers' },
    { id: 'new', label: 'New Customers' },
    { id: 'europe', label: 'From Europe' },
    { id: 'asia', label: 'Asia' },
    { id: 'others', label: 'Others' },
];

interface StatCardProps {
    title: string;
    value: string;
    change: number;
    trend: 'up' | 'down';
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon, iconColor, iconBg }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <div className="flex items-center gap-1 mt-2">
                        {trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={cn(
                            "text-sm font-medium",
                            trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                        )}>
                            {change}%
                        </span>
                        <span className="text-sm text-gray-400">from last month</span>
                    </div>
                </div>
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", iconBg)}>
                    <Icon className={cn("h-6 w-6", iconColor)} />
                </div>
            </div>
        </CardContent>
    </Card>
);

export const DashboardPage = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(3);
    const [searchQuery, setSearchQuery] = useState('');

    const columns: Column<Product>[] = [
        {
            key: 'name',
            header: 'Customer',
            render: (item) => (
                <div className="flex items-center gap-3">
                    <Avatar size="sm" fallback={item.name} />
                    <span className="font-medium text-gray-900">{item.name}</span>
                </div>
            ),
        },
        {
            key: 'email',
            header: 'Email',
            render: (item) => (
                <span className="text-gray-500">{item.email}</span>
            ),
        },
        {
            key: 'location',
            header: 'Location',
            render: (item) => (
                <span className="text-gray-500">{item.location}</span>
            ),
        },
        {
            key: 'orders',
            header: 'Orders',
            render: (item) => (
                <span className="text-gray-900">{item.orders}</span>
            ),
        },
        {
            key: 'spent',
            header: 'Spent',
            render: (item) => (
                <span className="font-medium text-gray-900">
                    ${item.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.firstName || 'User'} 👋
                </h1>
                <p className="text-gray-500">
                    Here's what's happening with your store today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value="$45,231.89"
                    change={20.1}
                    trend="up"
                    icon={DollarSign}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                />
                <StatCard
                    title="Total Orders"
                    value="2,350"
                    change={15.5}
                    trend="up"
                    icon={ShoppingCart}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50"
                />
                <StatCard
                    title="Active Customers"
                    value="1,234"
                    change={3.2}
                    trend="up"
                    icon={Users}
                    iconColor="text-violet-600"
                    iconBg="bg-violet-50"
                />
                <StatCard
                    title="Total Products"
                    value="128"
                    change={-2.4}
                    trend="down"
                    icon={Package}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-50"
                />
            </div>

            {/* Customers Table */}
            <Card>
                <CardHeader className="pb-0 space-y-4">
                    {/* Tabs and Actions Row */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <Tabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onChange={setActiveTab}
                            className="border-b-0"
                        />
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            <Button size="sm" className="gap-2 bg-primary-600 hover:bg-primary-700">
                                <Plus className="h-4 w-4" />
                                Add Customers
                            </Button>
                        </div>
                    </div>

                    {/* Search and Filter Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pb-4">
                        <Button variant="secondary" size="sm" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18" />
                                </svg>
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={mockProducts}
                        renderActions={() => (
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        )}
                    />

                    {/* Pagination */}
                    <div className="py-4 border-t border-gray-100">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={24}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import {
    Package,
    Users,
    Activity,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Import dashboard components
import { QuickAddProduct } from '../../components/dashboard/QuickAddProduct';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { TrafficOverview } from '../../components/dashboard/TrafficOverview';
import { ProductOverview } from '../../components/dashboard/ProductOverview';

// Import services
import dashboardService from '../../services/dashboardService';
import { DashboardStats } from '../../types/dashboard';

// Stat Card Component
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    change,
    trend = 'neutral',
    icon: Icon,
    iconColor,
    iconBg,
    isLoading = false
}) => (
    <Card className={cn(
        'group relative overflow-hidden',
        'hover:shadow-lg hover:shadow-gray-200/50',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-0.5'
    )}>
        {/* Gradient overlay on hover */}
        <div className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-100',
            'bg-gradient-to-br from-white via-transparent to-gray-50/50',
            'transition-opacity duration-300'
        )} />

        <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{title}</p>

                    {isLoading ? (
                        <div className="space-y-2">
                            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                        </div>
                    ) : (
                        <>
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">
                                {typeof value === 'number' ? value.toLocaleString() : value}
                            </p>

                            {change !== undefined && (
                                <div className="flex items-center gap-1.5">
                                    {trend === 'up' ? (
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    ) : trend === 'down' ? (
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                    ) : null}
                                    <span className={cn(
                                        "text-sm font-medium",
                                        trend === 'up' ? 'text-emerald-600' :
                                            trend === 'down' ? 'text-red-600' :
                                                'text-gray-500'
                                    )}>
                                        {change > 0 ? '+' : ''}{change}%
                                    </span>
                                    <span className="text-sm text-gray-400">vs last month</span>
                                </div>
                            )}

                            {subtitle && !change && (
                                <p className="text-sm text-gray-500">{subtitle}</p>
                            )}
                        </>
                    )}
                </div>

                <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center",
                    "shadow-sm transition-all duration-300",
                    "group-hover:scale-110 group-hover:shadow-md",
                    iconBg
                )}>
                    <Icon className={cn("h-7 w-7", iconColor)} />
                </div>
            </div>
        </CardContent>
    </Card>
);

export const DashboardPage = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch dashboard stats
    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await dashboardService.getStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
            setError('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats, refreshKey]);

    // Handle product added - refresh stats
    const handleProductAdded = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    // Handle refresh all
    const handleRefreshAll = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    // Greeting based on time of day
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    return (
        <div className="space-y-8 pb-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {greeting}, {user?.firstName || 'User'}
                        </h1>
                        <Sparkles className="h-6 w-6 text-amber-400" />
                    </div>
                    <p className="text-gray-500">
                        Here's what's happening with your store today.
                    </p>
                </div>

                <Button
                    variant="secondary"
                    onClick={handleRefreshAll}
                    disabled={isLoading}
                    className="gap-2 self-start lg:self-auto"
                >
                    <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                    Refresh Dashboard
                </Button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="ghost" size="sm" onClick={fetchStats}>
                        Retry
                    </Button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Products"
                    value={stats?.totalProducts ?? 0}
                    subtitle="Products in catalog"
                    icon={Package}
                    iconColor="text-amber-600"
                    iconBg="bg-gradient-to-br from-amber-50 to-orange-100"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers ?? 0}
                    subtitle="Registered users"
                    icon={Users}
                    iconColor="text-violet-600"
                    iconBg="bg-gradient-to-br from-violet-50 to-purple-100"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Recent Activity"
                    value={stats?.recentActivityCount ?? 0}
                    subtitle="Audit log entries"
                    icon={Activity}
                    iconColor="text-blue-600"
                    iconBg="bg-gradient-to-br from-blue-50 to-cyan-100"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Products Added"
                    value={stats?.recentProductsCount ?? 0}
                    subtitle="All time"
                    icon={TrendingUp}
                    iconColor="text-emerald-600"
                    iconBg="bg-gradient-to-br from-emerald-50 to-green-100"
                    isLoading={isLoading}
                />
            </div>

            {/* Quick Add Product */}
            <QuickAddProduct onProductAdded={handleProductAdded} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <ActivityFeed
                        key={`activity-${refreshKey}`}
                        limit={8}
                        autoRefresh={true}
                        refreshInterval={60000}
                    />
                </div>

                {/* Traffic Overview - Takes 1 column */}
                <div>
                    <TrafficOverview key={`traffic-${refreshKey}`} />
                </div>
            </div>

            {/* Product Overview Section */}
            <ProductOverview key={`products-${refreshKey}`} limit={5} />
        </div>
    );
};

export default DashboardPage;

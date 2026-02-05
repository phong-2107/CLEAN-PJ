import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Activity,
    Plus,
    Pencil,
    Trash2,
    Clock,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import auditLogService from '../../services/auditLogService';
import { AuditLog } from '../../types/auditLog';
import { cn } from '../../utils/cn';

interface ActivityFeedProps {
    limit?: number;
    className?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

// Helper to get relative time
const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

// Get icon and color based on action type
const getActionConfig = (action: string) => {
    switch (action.toLowerCase()) {
        case 'create':
            return {
                icon: Plus,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                label: 'Created'
            };
        case 'update':
            return {
                icon: Pencil,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                label: 'Updated'
            };
        case 'delete':
            return {
                icon: Trash2,
                color: 'text-red-600',
                bg: 'bg-red-50',
                label: 'Deleted'
            };
        default:
            return {
                icon: Activity,
                color: 'text-gray-600',
                bg: 'bg-gray-50',
                label: action
            };
    }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
    limit = 10,
    className,
    autoRefresh = false,
    refreshInterval = 30000
}) => {
    const [activities, setActivities] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchActivities = useCallback(async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const data = await auditLogService.getRecent(limit);
            setActivities(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch activities:', err);
            setError('Failed to load activities');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    // Auto refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchActivities(true);
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchActivities]);

    const handleRefresh = useCallback(() => {
        fetchActivities(true);
    }, [fetchActivities]);

    // Loading skeleton
    const LoadingSkeleton = useMemo(() => (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    ), []);

    return (
        <Card className={cn('h-full', className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            <p className="text-xs text-gray-500">System changes and updates</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="gap-1.5"
                    >
                        <RefreshCw className={cn(
                            'h-4 w-4',
                            isRefreshing && 'animate-spin'
                        )} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {isLoading ? (
                    LoadingSkeleton
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle className="h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500">{error}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchActivities()}
                            className="mt-2"
                        >
                            Try Again
                        </Button>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Activity className="h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500">No recent activity</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {activities.map((activity, index) => {
                            const config = getActionConfig(activity.action);
                            const Icon = config.icon;

                            return (
                                <div
                                    key={activity.id}
                                    className={cn(
                                        'flex items-start gap-3 p-3 rounded-lg',
                                        'hover:bg-gray-50 transition-colors duration-150',
                                        'group cursor-default'
                                    )}
                                    style={{
                                        animationDelay: `${index * 50}ms`
                                    }}
                                >
                                    <Avatar
                                        size="sm"
                                        fallback={activity.userName || 'U'}
                                        className="mt-0.5"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-gray-900 text-sm">
                                                {activity.userName || 'System'}
                                            </span>
                                            <Badge
                                                variant="default"
                                                className={cn(
                                                    'text-xs px-2 py-0.5',
                                                    config.bg,
                                                    config.color
                                                )}
                                            >
                                                <Icon className="h-3 w-3 mr-1" />
                                                {config.label}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-gray-600 mt-0.5">
                                            {activity.entityName}
                                            <span className="text-gray-400"> #{activity.entityId}</span>
                                        </p>

                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            {getRelativeTime(activity.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ActivityFeed;

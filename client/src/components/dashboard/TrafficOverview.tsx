import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart3, TrendingUp, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import dashboardService from '../../services/dashboardService';
import { ActivitySummary } from '../../types/dashboard';
import { cn } from '../../utils/cn';

interface TrafficOverviewProps {
    className?: string;
}

interface BarProps {
    label: string;
    value: number;
    maxValue: number;
    color: string;
    icon: React.ElementType;
}

const Bar: React.FC<BarProps> = ({ label, value, maxValue, color, icon: Icon }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', color)} />
                    <span className="text-gray-600">{label}</span>
                </div>
                <span className="font-semibold text-gray-900">{value}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-700 ease-out',
                        color.replace('text-', 'bg-')
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export const TrafficOverview: React.FC<TrafficOverviewProps> = ({ className }) => {
    const [summary, setSummary] = useState<ActivitySummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await dashboardService.getActivitySummary(100);
            setSummary(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch activity summary:', err);
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const maxValue = useMemo(() => {
        if (!summary) return 0;
        return Math.max(summary.creates, summary.updates, summary.deletes, 1);
    }, [summary]);

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                    <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                        <div className="h-4 bg-gray-200 rounded w-8" />
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full" />
                </div>
            ))}
        </div>
    );

    return (
        <Card className={cn('h-full', className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Activity Overview</h3>
                            <p className="text-xs text-gray-500">Last 100 actions</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchSummary}
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500">{error}</p>
                        <Button variant="ghost" size="sm" onClick={fetchSummary} className="mt-2">
                            Retry
                        </Button>
                    </div>
                ) : summary ? (
                    <div className="space-y-5">
                        <Bar
                            label="Creates"
                            value={summary.creates}
                            maxValue={maxValue}
                            color="text-emerald-500"
                            icon={Plus}
                        />
                        <Bar
                            label="Updates"
                            value={summary.updates}
                            maxValue={maxValue}
                            color="text-blue-500"
                            icon={Pencil}
                        />
                        <Bar
                            label="Deletes"
                            value={summary.deletes}
                            maxValue={maxValue}
                            color="text-red-500"
                            icon={Trash2}
                        />

                        {/* Total indicator */}
                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">Total Actions</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">
                                    {summary.total}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
};

export default TrafficOverview;

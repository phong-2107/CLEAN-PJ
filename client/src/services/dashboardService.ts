import productService from './productService';
import userService from './userService';
import auditLogService from './auditLogService';
import { DashboardStats, DashboardData, ActivitySummary } from '../types/dashboard';
import { AuditLog } from '../types/auditLog';

/**
 * Aggregated service for dashboard data
 * Combines data from multiple APIs for the dashboard view
 */
const dashboardService = {
    /**
     * Get all dashboard statistics in a single call
     * Uses Promise.all for parallel fetching
     */
    getStats: async (): Promise<DashboardStats> => {
        const [productsResult, usersResult, activityResult] = await Promise.all([
            productService.getPaged({ pageNumber: 1, pageSize: 1 }),
            userService.getPaged({ pageNumber: 1, pageSize: 1 }),
            auditLogService.getPaged({ pageNumber: 1, pageSize: 1 })
        ]);

        return {
            totalProducts: productsResult.totalCount,
            totalUsers: usersResult.totalCount,
            recentProductsCount: productsResult.totalCount,
            recentActivityCount: activityResult.totalCount
        };
    },

    /**
     * Get complete dashboard data including recent items
     */
    getDashboardData: async (): Promise<DashboardData> => {
        const [stats, recentActivity, productsResult] = await Promise.all([
            dashboardService.getStats(),
            auditLogService.getRecent(10),
            productService.getPaged({ pageNumber: 1, pageSize: 5 })
        ]);

        return {
            stats,
            recentActivity,
            recentProducts: productsResult.items
        };
    },

    /**
     * Get activity summary by action type
     */
    getActivitySummary: async (limit: number = 100): Promise<ActivitySummary> => {
        const logs = await auditLogService.getPaged({ pageNumber: 1, pageSize: limit });

        const summary: ActivitySummary = {
            creates: 0,
            updates: 0,
            deletes: 0,
            total: logs.items.length
        };

        logs.items.forEach((log: AuditLog) => {
            switch (log.action.toLowerCase()) {
                case 'create':
                    summary.creates++;
                    break;
                case 'update':
                    summary.updates++;
                    break;
                case 'delete':
                    summary.deletes++;
                    break;
            }
        });

        return summary;
    }
};

export default dashboardService;

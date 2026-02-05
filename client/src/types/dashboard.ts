import { AuditLog } from './auditLog';
import { Product } from './product';

/**
 * Dashboard statistics aggregated from various APIs
 */
export interface DashboardStats {
    totalProducts: number;
    totalUsers: number;
    recentProductsCount: number;
    recentActivityCount: number;
}

/**
 * Complete dashboard data structure
 */
export interface DashboardData {
    stats: DashboardStats;
    recentActivity: AuditLog[];
    recentProducts: Product[];
}

/**
 * Activity summary by action type
 */
export interface ActivitySummary {
    creates: number;
    updates: number;
    deletes: number;
    total: number;
}

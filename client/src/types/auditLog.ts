import { PagedResult } from './product';

/**
 * Represents an audit log entry from the backend
 */
export interface AuditLog {
    id: number;
    userId: string;
    userName?: string;
    action: 'Create' | 'Update' | 'Delete' | string;
    entityName: string;
    entityId: string;
    oldValues?: string;
    newValues?: string;
    affectedColumns?: string;
    timestamp: string;
    ipAddress?: string;
}

/**
 * Filter parameters for audit log queries
 */
export interface AuditLogFilter {
    pageNumber?: number;
    pageSize?: number;
    entityName?: string;
    userId?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
}

export type PagedAuditLogs = PagedResult<AuditLog>;

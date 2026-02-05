import api from './api';
import { AuditLog, AuditLogFilter, PagedAuditLogs } from '../types/auditLog';

/**
 * Service for interacting with the Audit Log API
 */
const auditLogService = {
    /**
     * Get paginated audit logs with optional filters
     */
    getPaged: async (filter: AuditLogFilter = {}): Promise<PagedAuditLogs> => {
        const response = await api.get<PagedAuditLogs>('/auditlogs', { params: filter });
        return response.data;
    },

    /**
     * Get audit logs for a specific entity
     */
    getByEntity: async (entityName: string, entityId: string): Promise<AuditLog[]> => {
        const response = await api.get<AuditLog[]>(`/auditlogs/entity/${entityName}/${entityId}`);
        return response.data;
    },

    /**
     * Get audit logs by user ID
     */
    getByUser: async (userId: string, take: number = 50): Promise<AuditLog[]> => {
        const response = await api.get<AuditLog[]>(`/auditlogs/user/${userId}`, {
            params: { take }
        });
        return response.data;
    },

    /**
     * Get recent activity (helper for dashboard)
     */
    getRecent: async (limit: number = 10): Promise<AuditLog[]> => {
        const response = await api.get<PagedAuditLogs>('/auditlogs', {
            params: { pageNumber: 1, pageSize: limit }
        });
        return response.data.items;
    }
};

export default auditLogService;

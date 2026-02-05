import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
    Search,
    Filter,
    RefreshCw,
    Loader2,
    AlertCircle,
    FileText,
    User,
    Calendar,
    Activity,
    Eye
} from 'lucide-react';
import { cn } from '../../utils/cn';
import auditLogService from '../../services/auditLogService';
import { AuditLog } from '../../types/auditLog';
import { AuditLogDetailModal } from '../../components/modals';

export const AuditLogsPage = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    // Modal state
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Fetch audit logs
    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await auditLogService.getPaged({
                pageNumber: currentPage,
                pageSize: pageSize
            });
            setLogs(data.items);
            setTotalCount(data.totalCount);
        } catch (err: any) {
            console.error('Failed to fetch audit logs:', err);
            setError('Failed to load audit logs. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Handle row click
    const handleRowClick = (log: AuditLog) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    // Format date
    const formatDate = (date: string): string => {
        const d = new Date(date);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get action badge color
    const getActionVariant = (action: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
        const lower = action.toLowerCase();
        if (lower.includes('create') || lower.includes('add')) return 'success';
        if (lower.includes('update') || lower.includes('edit')) return 'warning';
        if (lower.includes('delete') || lower.includes('remove')) return 'error';
        if (lower.includes('login') || lower.includes('view')) return 'info';
        return 'default';
    };

    // Filter logs
    const filteredLogs = logs.filter(log =>
        log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userId?.toString().includes(searchQuery)
    );

    const columns: Column<AuditLog>[] = [
        {
            key: 'timestamp',
            header: 'Time',
            render: (log) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(log.timestamp)}</span>
                </div>
            ),
        },
        {
            key: 'action',
            header: 'Action',
            render: (log) => (
                <Badge variant={getActionVariant(log.action)}>
                    {log.action}
                </Badge>
            ),
        },
        {
            key: 'entityName',
            header: 'Entity',
            render: (log) => (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-800">{log.entityName}</span>
                    {log.entityId && (
                        <span className="text-xs text-gray-400">#{log.entityId}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'userId',
            header: 'User',
            render: (log) => (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                        User #{log.userId}
                    </span>
                </div>
            ),
        },
        {
            key: 'view',
            header: '',
            width: '60px',
            render: () => (
                <div className="flex items-center justify-center">
                    <Eye className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="h-6 w-6 text-primary-600" />
                        Audit Logs
                    </h1>
                    <p className="text-gray-500 mt-1">View system activity and changes. Click a row to see details.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={fetchLogs}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                        Refresh
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                    <Button variant="ghost" size="sm" onClick={fetchLogs} className="ml-auto">
                        Retry
                    </Button>
                </div>
            )}

            <Card>
                <CardHeader className="pb-0">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by action, entity..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Badge variant="info" className="px-3 py-1">
                                {totalCount} total entries
                            </Badge>
                            <Button variant="secondary" className="gap-2 flex-1 sm:flex-none">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                            <span className="ml-3 text-gray-500">Loading audit logs...</span>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-16">
                            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No audit logs found</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredLogs}
                            onRowClick={handleRowClick}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalCount > pageSize && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                        Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                    </span>
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Detail Modal */}
            <AuditLogDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
};

export default AuditLogsPage;

import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import {
    Calendar,
    User,
    FileText,
    Activity,
    Clock,
    ArrowRight
} from 'lucide-react';
import { AuditLog } from '../../types/auditLog';
import { cn } from '../../utils/cn';

interface AuditLogDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: AuditLog | null;
}

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
    isOpen,
    onClose,
    log
}) => {
    if (!log) return null;

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionVariant = (action: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
        const lower = action.toLowerCase();
        if (lower.includes('create') || lower.includes('add')) return 'success';
        if (lower.includes('update') || lower.includes('edit')) return 'warning';
        if (lower.includes('delete') || lower.includes('remove')) return 'error';
        if (lower.includes('login') || lower.includes('view')) return 'info';
        return 'default';
    };

    const parseJson = (value: string | undefined): object | null => {
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    };

    const oldValues = parseJson(log.oldValues);
    const newValues = parseJson(log.newValues);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Audit Log Details"
            size="lg"
        >
            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'h-12 w-12 rounded-xl flex items-center justify-center',
                            'bg-gradient-to-br from-primary-100 to-primary-200'
                        )}>
                            <Activity className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <Badge variant={getActionVariant(log.action)} className="mb-1">
                                {log.action}
                            </Badge>
                            <p className="text-sm text-gray-500">Log ID: #{log.id}</p>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <FileText className="h-3.5 w-3.5" />
                            Entity
                        </div>
                        <p className="font-medium text-gray-900">{log.entityName}</p>
                        {log.entityId && (
                            <p className="text-xs text-gray-500">ID: {log.entityId}</p>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <User className="h-3.5 w-3.5" />
                            User
                        </div>
                        <p className="font-medium text-gray-900">User #{log.userId}</p>
                    </div>

                    <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Timestamp
                        </div>
                        <p className="font-medium text-gray-900">{formatDate(log.timestamp)}</p>
                    </div>
                </div>

                {/* Changes Section */}
                {(oldValues || newValues) && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Changes
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Old Values */}
                            {oldValues && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                    <p className="text-xs font-semibold text-red-600 mb-2">Before</p>
                                    <pre className="text-xs text-red-800 overflow-auto max-h-64 whitespace-pre-wrap font-mono">
                                        {JSON.stringify(oldValues, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* New Values */}
                            {newValues && (
                                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                                    <p className="text-xs font-semibold text-green-600 mb-2">After</p>
                                    <pre className="text-xs text-green-800 overflow-auto max-h-64 whitespace-pre-wrap font-mono">
                                        {JSON.stringify(newValues, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Arrow indicator for changes */}
                        {oldValues && newValues && (
                            <div className="flex items-center justify-center">
                                <ArrowRight className="h-5 w-5 text-gray-400" />
                            </div>
                        )}
                    </div>
                )}

                {/* Raw Values if not JSON */}
                {!oldValues && !newValues && (log.oldValues || log.newValues) && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">Raw Data</h4>
                        {log.oldValues && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Old Values</p>
                                <p className="text-sm text-gray-700 break-all">{log.oldValues}</p>
                            </div>
                        )}
                        {log.newValues && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">New Values</p>
                                <p className="text-sm text-gray-700 break-all">{log.newValues}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AuditLogDetailModal;

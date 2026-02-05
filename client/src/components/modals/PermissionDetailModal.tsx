import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import {
    Key,
    Shield,
    FileText
} from 'lucide-react';
import { Permission } from '../../types/role';
import { cn } from '../../utils/cn';

interface PermissionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    permission: Permission | null;
}

export const PermissionDetailModal: React.FC<PermissionDetailModalProps> = ({
    isOpen,
    onClose,
    permission
}) => {
    if (!permission) return null;

    const getActionColor = (action: string | undefined) => {
        if (!action) return 'bg-gray-100 text-gray-600';
        const lower = action.toLowerCase();
        if (lower.includes('create') || lower.includes('add')) return 'bg-emerald-100 text-emerald-700';
        if (lower.includes('read') || lower.includes('view')) return 'bg-blue-100 text-blue-700';
        if (lower.includes('update') || lower.includes('edit')) return 'bg-amber-100 text-amber-700';
        if (lower.includes('delete') || lower.includes('remove')) return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Permission Details"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className={cn(
                        'h-14 w-14 rounded-xl flex items-center justify-center',
                        'bg-gradient-to-br from-blue-100 to-indigo-200 shadow-md'
                    )}>
                        <Key className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{permission.name}</h3>
                        <p className="text-sm text-gray-500">ID: #{permission.id}</p>
                    </div>
                </div>

                {/* Permission String */}
                {permission.name && (
                    <div className="p-4 bg-gray-900 rounded-xl">
                        <p className="text-xs text-gray-400 mb-2">Permission String</p>
                        <code className="text-sm font-mono text-emerald-400">
                            {permission.name}
                        </code>
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {permission.resource && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                                <Shield className="h-4 w-4" />
                                Resource
                            </div>
                            <p className="font-semibold text-gray-900">{permission.resource}</p>
                        </div>
                    )}

                    {permission.action && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                                <FileText className="h-4 w-4" />
                                Action
                            </div>
                            <span className={cn(
                                'inline-flex px-3 py-1 rounded-lg text-sm font-medium',
                                getActionColor(permission.action)
                            )}>
                                {permission.action}
                            </span>
                        </div>
                    )}
                </div>

                {/* Description */}
                {permission.description && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-2">Description</p>
                        <p className="text-sm text-gray-700">{permission.description}</p>
                    </div>
                )}

                {/* Group */}
                {permission.group && (
                    <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg border border-violet-100">
                        <span className="text-sm text-violet-600">Group</span>
                        <Badge variant="info">{permission.group}</Badge>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PermissionDetailModal;

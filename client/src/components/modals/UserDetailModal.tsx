import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import {
    Mail,
    Calendar,
    Shield,
    Activity,
    Plus,
    Eye
} from 'lucide-react';
import { UserDto } from '../../types/user';

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserDto;
    onViewPermissions: () => void;
    onAddPermission: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
    isOpen,
    onClose,
    user,
    onViewPermissions,
    onAddPermission
}) => {
    const formatDate = (date?: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    };

    const formatDateTime = (date?: string) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleString();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="User Details"
            size="md"
        >
            <div className="space-y-6">
                {/* Header Profile Section */}
                <div className="flex flex-col items-center justify-center pb-6 border-b border-gray-100">
                    <Avatar
                        fallback={user.fullName || user.username}
                        size="lg"
                        className="h-24 w-24 text-2xl mb-4 shadow-lg"
                    />
                    <h2 className="text-xl font-bold text-gray-900">{user.fullName || user.username}</h2>
                    <div className="text-sm text-gray-500 mb-2">@{user.username}</div>
                    <Badge variant={user.isActive ? 'success' : 'default'} className="px-3 py-1 text-sm bg-white border shadow-sm">
                        {user.isActive ? 'Active Account' : 'Inactive Account'}
                    </Badge>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <Mail className="h-3 w-3" /> Email
                        </div>
                        <div className="text-sm font-medium text-gray-900 break-all">{user.email}</div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <Shield className="h-3 w-3" /> Roles
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role, idx) => (
                                    <Badge key={idx} variant="info" className="text-xs">
                                        {role}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-gray-400">No roles assigned</span>
                            )}
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <Calendar className="h-3 w-3" /> Joined
                        </div>
                        <div className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <Activity className="h-3 w-3" /> Last Active
                        </div>
                        <div className="text-sm font-medium text-gray-900">{formatDateTime(user.lastLoginAt)}</div>
                    </div>
                </div>

                {/* Permissions Actions */}
                <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary-600" />
                        Permissions & Access
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                            variant="secondary"
                            className="w-full justify-center h-12"
                            onClick={onViewPermissions}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View Permissions
                        </Button>
                        <Button
                            className="w-full justify-center h-12 bg-gray-900 text-white hover:bg-gray-800"
                            onClick={onAddPermission}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Permission
                        </Button>
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-3">
                        Manage granular permissions and overrides for this user.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

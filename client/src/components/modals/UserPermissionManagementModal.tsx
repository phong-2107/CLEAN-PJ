import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
    ShieldCheck,
    ShieldAlert,
    Check,
    Ban,
    Trash2,
    Plus,
    Loader2,
    Users,
    Info
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { UserPermissionDetail, GrantPermissionRequest, DenyPermissionRequest } from '../../types/userPermission';
import { Permission } from '../../types/role';
import userPermissionService from '../../services/userPermissionService';
import permissionService from '../../services/permissionService';

interface UserPermissionManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number | string;
    userName: string;
    initialTab?: Tab;
}

type Tab = 'effective' | 'grant' | 'deny';

export const UserPermissionManagementModal: React.FC<UserPermissionManagementModalProps> = ({
    isOpen,
    onClose,
    userId,
    userName,
    initialTab = 'effective'
}) => {
    const [permissions, setPermissions] = useState<UserPermissionDetail[]>([]);
    const [allSystemPermissions, setAllSystemPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);

    // Update active tab when modal opens or initialTab changes
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    // Form state
    const [selectedPermissionId, setSelectedPermissionId] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (isOpen && userId) {
            fetchData();
        }
    }, [isOpen, userId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [userPerms, systemPerms] = await Promise.all([
                userPermissionService.getUserPermissions(userId),
                permissionService.getAll()
            ]);
            setPermissions(userPerms);
            setAllSystemPermissions(systemPerms);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevoke = async (permissionId: string) => {
        if (!window.confirm('Are you sure you want to revoke this override? The permission will revert to the Role setting.')) {
            return;
        }

        try {
            await userPermissionService.revokeOverride(userId, permissionId);
            // Refresh
            fetchData();
        } catch (error) {
            console.error('Failed to revoke override:', error);
        }
    };

    const handleGrant = async () => {
        if (!selectedPermissionId || !reason) return;

        setIsSaving(true);
        try {
            const request: GrantPermissionRequest = {
                permissionId: selectedPermissionId,
                reason
            };
            await userPermissionService.grantPermission(userId, request);
            resetForm();
            setActiveTab('effective');
            fetchData();
        } catch (error) {
            console.error('Failed to grant permission:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeny = async () => {
        if (!selectedPermissionId || !reason) return;

        setIsSaving(true);
        try {
            const request: DenyPermissionRequest = {
                permissionId: selectedPermissionId,
                reason
            };
            await userPermissionService.denyPermission(userId, request);
            resetForm();
            setActiveTab('effective');
            fetchData();
        } catch (error) {
            console.error('Failed to deny permission:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setSelectedPermissionId('');
        setReason('');
    };

    // Filter permissions that available to be granted/denied (not already overridden)
    const availablePermissions = allSystemPermissions.filter(p => !permissions.some(up => up.permissionId === p.id && up.source !== 'Role'));

    // State for missing permissions (fetched from API)
    const [missingPermissions, setMissingPermissions] = useState<import('../../types/userPermission').MissingPermissionItem[]>([]);

    useEffect(() => {
        if (activeTab === 'grant' && userId) {
            fetchMissingPermissions();
        }
    }, [activeTab, userId]);

    const fetchMissingPermissions = async () => {
        try {
            const missing = await userPermissionService.getMissingPermissions(userId);
            setMissingPermissions(missing);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Manage Permissions for ${userName}`}
            size="xl"
        >
            <div className="space-y-6">

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'effective' ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                        onClick={() => setActiveTab('effective')}
                    >
                        Effective Permissions
                    </button>
                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1",
                            activeTab === 'grant' ? "border-green-500 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                        onClick={() => setActiveTab('grant')}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Grant Override
                    </button>
                    <button
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1",
                            activeTab === 'deny' ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                        onClick={() => setActiveTab('deny')}
                    >
                        <ShieldAlert className="h-4 w-4" />
                        Deny Override
                    </button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                    </div>
                ) : (
                    <>
                        {/* Effective Permissions Tab */}
                        {activeTab === 'effective' && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p>Shows the final calculated permissions based on Role, Grants, and Denials. <strong>DENY</strong> overrides <strong>GRANT</strong>, which overrides <strong>ROLE</strong>.</p>
                                </div>

                                {permissions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No permissions found for this user.
                                    </div>
                                ) : (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {permissions.map((perm) => (
                                                    <tr key={perm.permissionId} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{perm.permissionName}</div>
                                                            <div className="text-sm text-gray-500">{perm.resource} • {perm.action}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {perm.source === 'Role' && (
                                                                <Badge variant="default" className="gap-1">
                                                                    <Users className="h-3 w-3" /> Role: {perm.roleName}
                                                                </Badge>
                                                            )}
                                                            {perm.source === 'Grant' && (
                                                                <Badge variant="success" className="gap-1">
                                                                    <ShieldCheck className="h-3 w-3" /> Granted
                                                                </Badge>
                                                            )}
                                                            {perm.source === 'Deny' && (
                                                                <Badge variant="error" className="gap-1">
                                                                    <ShieldAlert className="h-3 w-3" /> Denied
                                                                </Badge>
                                                            )}
                                                            {perm.reason && (
                                                                <div className="text-xs text-gray-500 mt-1 italic">"{perm.reason}"</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {perm.isGranted ? (
                                                                <span className="flex items-center text-green-600 text-sm font-medium">
                                                                    <Check className="h-4 w-4 mr-1" /> Allowed
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center text-red-600 text-sm font-medium">
                                                                    <Ban className="h-4 w-4 mr-1" /> Denied
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            {perm.source !== 'Role' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-gray-400 hover:text-red-600"
                                                                    onClick={() => handleRevoke(perm.permissionId)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Grant Tab */}
                        {activeTab === 'grant' && (
                            <div className="space-y-4 max-w-lg mx-auto py-4">
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center text-center">
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                        <ShieldCheck className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-green-900">Grant Additional Permission</h3>
                                    <p className="text-sm text-green-700 mt-1">This will override any Role setting. Use this for temporary access or special exceptions.</p>
                                </div>

                                <div className="space-y-4 mt-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Permission</label>
                                        <select
                                            className="w-full h-10 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            value={selectedPermissionId}
                                            onChange={(e) => setSelectedPermissionId(e.target.value)}
                                        >
                                            <option value="">Select a permission...</option>
                                            {missingPermissions.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.resource} - {p.action})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Required)</label>
                                        <textarea
                                            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            rows={2}
                                            placeholder="e.g. Temporary coverage for John..."
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                            disabled={!selectedPermissionId || !reason || isSaving}
                                            onClick={handleGrant}
                                        >
                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                            Grant Permission
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Deny Tab */}
                        {activeTab === 'deny' && (
                            <div className="space-y-4 max-w-lg mx-auto py-4">
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col items-center text-center">
                                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                                        <ShieldAlert className="h-6 w-6 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-red-900">Explicitly Deny Permission</h3>
                                    <p className="text-sm text-red-700 mt-1">This strictly forbids this action, even if the User has a Role that allows it. High priority.</p>
                                </div>

                                <div className="space-y-4 mt-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Permission to Deny</label>
                                        <select
                                            className="w-full h-10 rounded-lg border border-gray-300 px-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            value={selectedPermissionId}
                                            onChange={(e) => setSelectedPermissionId(e.target.value)}
                                        >
                                            <option value="">Select a permission...</option>
                                            {availablePermissions.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.description})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Required)</label>
                                        <textarea
                                            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            rows={2}
                                            placeholder="e.g. Policy violation, security restriction..."
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button
                                            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                                            disabled={!selectedPermissionId || !reason || isSaving}
                                            onClick={handleDeny}
                                        >
                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
                                            Deny Permission
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};

export default UserPermissionManagementModal;

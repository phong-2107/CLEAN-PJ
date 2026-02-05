import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
    Shield,
    Loader2,
    AlertCircle,
    Check,
    Key
} from 'lucide-react';
import { cn } from '../../utils/cn';
import permissionService from '../../services/permissionService';
import { Permission } from '../../types/role';

interface RoleFormData {
    name: string;
    description: string;
    permissionIds: number[];
}

interface RoleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RoleFormData) => Promise<void>;
    initialData?: Partial<RoleFormData> & { id?: string; isSystemRole?: boolean };
    mode: 'create' | 'edit';
}

const initialFormData: RoleFormData = {
    name: '',
    description: '',
    permissionIds: []
};

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode
}) => {
    const [formData, setFormData] = useState<RoleFormData>(initialFormData);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch permissions on mount
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const data = await permissionService.getAll();
                setPermissions(data);
            } catch (err) {
                console.error('Failed to fetch permissions:', err);
            } finally {
                setIsLoadingPermissions(false);
            }
        };
        if (isOpen) {
            fetchPermissions();
        }
    }, [isOpen]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                permissionIds: initialData.permissionIds || []
            });
        } else if (isOpen && !initialData) {
            setFormData(initialFormData);
        }
        setError(null);
        setErrors({});
    }, [isOpen, initialData]);

    const handleInputChange = useCallback((field: keyof RoleFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    }, []);

    const togglePermission = useCallback((permissionId: number) => {
        setFormData(prev => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(permissionId)
                ? prev.permissionIds.filter(id => id !== permissionId)
                : [...prev.permissionIds, permissionId]
        }));
    }, []);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Role name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save role');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Group permissions by resource
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const resource = perm.resource || 'Other';
        if (!acc[resource]) acc[resource] = [];
        acc[resource].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    const isSystemRole = initialData?.isSystemRole;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Create New Role' : 'Edit Role'}
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isSystemRole}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                {mode === 'create' ? 'Create Role' : 'Save Changes'}
                            </>
                        )}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {isSystemRole && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-700">
                        <Shield className="h-4 w-4" />
                        System roles cannot be modified
                    </div>
                )}

                {/* Role Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Role Name *
                    </label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange('name')}
                            disabled={isSystemRole}
                            className={cn(
                                'w-full pl-10 pr-4 py-2.5 rounded-xl border',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                'transition-all',
                                errors.name ? 'border-red-300' : 'border-gray-200',
                                isSystemRole && 'bg-gray-50 cursor-not-allowed'
                            )}
                            placeholder="Enter role name"
                        />
                    </div>
                    {errors.name && (
                        <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={handleInputChange('description')}
                        disabled={isSystemRole}
                        rows={2}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-xl border border-gray-200',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                            'transition-all resize-none',
                            isSystemRole && 'bg-gray-50 cursor-not-allowed'
                        )}
                        placeholder="Enter role description"
                    />
                </div>

                {/* Permission Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Key className="inline h-4 w-4 mr-1" />
                        Assign Permissions
                    </label>
                    {isLoadingPermissions ? (
                        <div className="flex items-center gap-2 py-4 text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading permissions...
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {Object.entries(groupedPermissions).map(([resource, perms]) => (
                                <div key={resource}>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                        {resource}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {perms.map(perm => (
                                            <button
                                                key={perm.id}
                                                type="button"
                                                onClick={() => togglePermission(Number(perm.id))}
                                                disabled={isSystemRole}
                                                className={cn(
                                                    'px-2.5 py-1 rounded-lg border text-xs font-medium transition-all',
                                                    formData.permissionIds.includes(Number(perm.id))
                                                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100',
                                                    isSystemRole && 'opacity-50 cursor-not-allowed'
                                                )}
                                            >
                                                {perm.action || perm.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default RoleFormModal;

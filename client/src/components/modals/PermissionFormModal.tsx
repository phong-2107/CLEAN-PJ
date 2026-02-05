import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
    Key,
    Shield,
    FileText,
    Loader2,
    AlertCircle,
    Check
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface PermissionFormData {
    name: string;
    description: string;
    resource: string;
    action: string;
}

interface PermissionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PermissionFormData) => Promise<void>;
    initialData?: Partial<PermissionFormData> & { id?: string };
    mode: 'create' | 'edit';
}

const initialFormData: PermissionFormData = {
    name: '',
    description: '',
    resource: '',
    action: ''
};

// Common resource options
const resourceOptions = [
    'Users',
    'Roles',
    'Permissions',
    'Products',
    'Categories',
    'Orders',
    'AuditLogs',
    'Settings'
];

// Common action options
const actionOptions = [
    'View',
    'Create',
    'Update',
    'Delete',
    'Manage',
    'Export',
    'Import'
];

export const PermissionFormModal: React.FC<PermissionFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode
}) => {
    const [formData, setFormData] = useState<PermissionFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                resource: initialData.resource || '',
                action: initialData.action || ''
            });
        } else if (isOpen && !initialData) {
            setFormData(initialFormData);
        }
        setError(null);
        setErrors({});
    }, [isOpen, initialData]);

    // Auto-generate permission name from resource and action
    useEffect(() => {
        if (formData.resource && formData.action) {
            const generatedName = `${formData.resource.toLowerCase()}.${formData.action.toLowerCase()}`;
            setFormData(prev => ({ ...prev, name: generatedName }));
        }
    }, [formData.resource, formData.action]);

    const handleInputChange = useCallback((field: keyof PermissionFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    }, []);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.resource.trim()) newErrors.resource = 'Resource is required';
        if (!formData.action.trim()) newErrors.action = 'Action is required';
        if (!formData.name.trim()) newErrors.name = 'Permission name is required';

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
            setError(err.response?.data?.message || 'Failed to save permission');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Create New Permission' : 'Edit Permission'}
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                {mode === 'create' ? 'Create Permission' : 'Save Changes'}
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

                {/* Resource & Action Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <Shield className="inline h-4 w-4 mr-1" />
                            Resource *
                        </label>
                        <select
                            value={formData.resource}
                            onChange={handleInputChange('resource')}
                            className={cn(
                                'w-full px-4 py-2.5 rounded-xl border',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                'transition-all bg-white',
                                errors.resource ? 'border-red-300' : 'border-gray-200'
                            )}
                        >
                            <option value="">Select resource...</option>
                            {resourceOptions.map(resource => (
                                <option key={resource} value={resource}>{resource}</option>
                            ))}
                        </select>
                        {errors.resource && (
                            <p className="mt-1 text-xs text-red-500">{errors.resource}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <FileText className="inline h-4 w-4 mr-1" />
                            Action *
                        </label>
                        <select
                            value={formData.action}
                            onChange={handleInputChange('action')}
                            className={cn(
                                'w-full px-4 py-2.5 rounded-xl border',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                'transition-all bg-white',
                                errors.action ? 'border-red-300' : 'border-gray-200'
                            )}
                        >
                            <option value="">Select action...</option>
                            {actionOptions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                        {errors.action && (
                            <p className="mt-1 text-xs text-red-500">{errors.action}</p>
                        )}
                    </div>
                </div>

                {/* Generated Permission Name Preview */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Key className="inline h-4 w-4 mr-1" />
                        Permission Name *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange('name')}
                            className={cn(
                                'w-full px-4 py-2.5 rounded-xl border font-mono text-sm',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                'transition-all bg-gray-50',
                                errors.name ? 'border-red-300' : 'border-gray-200'
                            )}
                            placeholder="e.g., users.view"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Auto-generated from resource and action. You can edit manually.
                    </p>
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
                        rows={3}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-xl border',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                            'transition-all resize-none',
                            'border-gray-200'
                        )}
                        placeholder="Describe what this permission allows..."
                    />
                </div>

                {/* Preview Card */}
                {formData.name && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-600 font-medium mb-2">Permission Preview</p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Key className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <code className="text-sm font-mono font-bold text-blue-800">{formData.name}</code>
                                {formData.description && (
                                    <p className="text-xs text-blue-600 mt-0.5">{formData.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default PermissionFormModal;

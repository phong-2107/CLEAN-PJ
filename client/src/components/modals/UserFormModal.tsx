import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
    User,
    Mail,
    Lock,
    Shield,
    Loader2,
    AlertCircle,
    Check
} from 'lucide-react';
import { cn } from '../../utils/cn';
import roleService from '../../services/roleService';
import { Role } from '../../types/role';

interface UserFormData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleIds: number[];
}

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => Promise<void>;
    initialData?: Partial<UserFormData> & { id?: number };
    mode: 'create' | 'edit';
}

const initialFormData: UserFormData = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleIds: []
};

export const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode
}) => {
    const [formData, setFormData] = useState<UserFormData>(initialFormData);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch roles on mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await roleService.getAll();
                setRoles(data);
            } catch (err) {
                console.error('Failed to fetch roles:', err);
            } finally {
                setIsLoadingRoles(false);
            }
        };
        if (isOpen) {
            fetchRoles();
        }
    }, [isOpen]);

    // Reset form when modal opens/closes or initialData changes
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                username: initialData.username || '',
                email: initialData.email || '',
                password: '',
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                roleIds: initialData.roleIds || []
            });
        } else if (isOpen && !initialData) {
            setFormData(initialFormData);
        }
        setError(null);
        setErrors({});
    }, [isOpen, initialData]);

    const handleInputChange = useCallback((field: keyof UserFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    }, []);

    const toggleRole = useCallback((roleId: number) => {
        setFormData(prev => ({
            ...prev,
            roleIds: prev.roleIds.includes(roleId)
                ? prev.roleIds.filter(id => id !== roleId)
                : [...prev.roleIds, roleId]
        }));
    }, []);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (mode === 'create' && !formData.password) newErrors.password = 'Password is required';
        if (mode === 'create' && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

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
            setError(err.response?.data?.message || 'Failed to save user');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Create New User' : 'Edit User'}
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
                                {mode === 'create' ? 'Create User' : 'Save Changes'}
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

                {/* Username & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Username *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={handleInputChange('username')}
                                disabled={mode === 'edit'}
                                className={cn(
                                    'w-full pl-10 pr-4 py-2.5 rounded-xl border',
                                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                    'transition-all',
                                    errors.username ? 'border-red-300' : 'border-gray-200',
                                    mode === 'edit' && 'bg-gray-50 cursor-not-allowed'
                                )}
                                placeholder="Enter username"
                            />
                        </div>
                        {errors.username && (
                            <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                className={cn(
                                    'w-full pl-10 pr-4 py-2.5 rounded-xl border',
                                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                    'transition-all',
                                    errors.email ? 'border-red-300' : 'border-gray-200'
                                )}
                                placeholder="Enter email"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                        )}
                    </div>
                </div>

                {/* Password (only for create) */}
                {mode === 'create' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                className={cn(
                                    'w-full pl-10 pr-4 py-2.5 rounded-xl border',
                                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                    'transition-all',
                                    errors.password ? 'border-red-300' : 'border-gray-200'
                                )}
                                placeholder="Enter password"
                            />
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                        )}
                    </div>
                )}

                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            First Name
                        </label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={handleInputChange('firstName')}
                            className={cn(
                                'w-full px-4 py-2.5 rounded-xl border border-gray-200',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                'transition-all'
                            )}
                            placeholder="Enter first name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Last Name
                        </label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={handleInputChange('lastName')}
                            className={cn(
                                'w-full px-4 py-2.5 rounded-xl border border-gray-200',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                'transition-all'
                            )}
                            placeholder="Enter last name"
                        />
                    </div>
                </div>

                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Shield className="inline h-4 w-4 mr-1" />
                        Assign Roles
                    </label>
                    {isLoadingRoles ? (
                        <div className="flex items-center gap-2 py-4 text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading roles...
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {roles.map(role => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => toggleRole(Number(role.id))}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                                        formData.roleIds.includes(Number(role.id))
                                            ? 'bg-primary-50 border-primary-300 text-primary-700'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                    )}
                                >
                                    {role.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default UserFormModal;

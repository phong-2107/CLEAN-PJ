import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
    Layers,
    Loader2,
    AlertCircle,
    Check
} from 'lucide-react';
import { cn } from '../../utils/cn';
import categoryService, { Category } from '../../services/categoryService';

interface CategoryFormData {
    name: string;
    description: string;
    parentCategoryId: number | null;
    isActive: boolean;
}

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => Promise<void>;
    initialData?: Partial<CategoryFormData> & { id?: number };
    mode: 'create' | 'edit';
}

const initialFormData: CategoryFormData = {
    name: '',
    description: '',
    parentCategoryId: null,
    isActive: true
};

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode
}) => {
    const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch categories for parent selection
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAll();
                // Filter out current category if editing
                const filtered = initialData?.id
                    ? data.filter(c => c.id !== initialData.id)
                    : data;
                setCategories(filtered);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen, initialData?.id]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                parentCategoryId: initialData.parentCategoryId ?? null,
                isActive: initialData.isActive ?? true
            });
        } else if (isOpen && !initialData) {
            setFormData(initialFormData);
        }
        setError(null);
        setErrors({});
    }, [isOpen, initialData]);

    const handleInputChange = useCallback((field: keyof CategoryFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const value = field === 'parentCategoryId'
            ? (e.target.value ? Number(e.target.value) : null)
            : e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    }, []);

    const handleActiveToggle = useCallback(() => {
        setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
    }, []);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Category name is required';
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
            setError(err.response?.data?.message || 'Failed to save category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Create Category' : 'Edit Category'}
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
                                {mode === 'create' ? 'Create Category' : 'Save Changes'}
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

                {/* Category Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Category Name *
                    </label>
                    <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange('name')}
                            className={cn(
                                'w-full pl-10 pr-4 py-2.5 rounded-xl border',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                'transition-all',
                                errors.name ? 'border-red-300' : 'border-gray-200'
                            )}
                            placeholder="Enter category name"
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
                        rows={3}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-xl border border-gray-200',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                            'transition-all resize-none'
                        )}
                        placeholder="Enter category description"
                    />
                </div>

                {/* Parent Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Parent Category
                    </label>
                    {isLoadingCategories ? (
                        <div className="flex items-center gap-2 py-2 text-gray-500 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading categories...
                        </div>
                    ) : (
                        <select
                            value={formData.parentCategoryId ?? ''}
                            onChange={handleInputChange('parentCategoryId')}
                            className={cn(
                                'w-full px-4 py-2.5 rounded-xl border border-gray-200',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                'transition-all bg-white'
                            )}
                        >
                            <option value="">No parent (root category)</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Active Status</p>
                        <p className="text-xs text-gray-500">Category will be visible when active</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleActiveToggle}
                        className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            formData.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                        )}
                    >
                        <span className={cn(
                            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm',
                            formData.isActive ? 'left-7' : 'left-1'
                        )} />
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CategoryFormModal;

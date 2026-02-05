import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
    Package,
    DollarSign,
    Loader2,
    AlertCircle,
    Check
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    stock: string;
}

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string; price: number; stock: number }) => Promise<void>;
    initialData?: Partial<ProductFormData> & { id?: string };
    mode: 'create' | 'edit';
}

const initialFormData: ProductFormData = {
    name: '',
    description: '',
    price: '',
    stock: ''
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode
}) => {
    const [formData, setFormData] = useState<ProductFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                price: initialData.price || '',
                stock: initialData.stock || ''
            });
        } else if (isOpen && !initialData) {
            setFormData(initialFormData);
        }
        setError(null);
        setErrors({});
    }, [isOpen, initialData]);

    const handleInputChange = useCallback((field: keyof ProductFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    }, []);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }
        if (!formData.stock || parseInt(formData.stock) < 0) {
            newErrors.stock = 'Stock cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit({
                name: formData.name.trim(),
                description: formData.description.trim() || 'No description',
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10)
            });
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save product');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Create Product' : 'Edit Product'}
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
                                {mode === 'create' ? 'Create Product' : 'Save Changes'}
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

                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Product Name *
                    </label>
                    <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                            placeholder="Enter product name"
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
                        placeholder="Enter product description"
                    />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Price ($) *
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleInputChange('price')}
                                className={cn(
                                    'w-full pl-10 pr-4 py-2.5 rounded-xl border',
                                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                    'transition-all',
                                    errors.price ? 'border-red-300' : 'border-gray-200'
                                )}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.price && (
                            <p className="mt-1 text-xs text-red-500">{errors.price}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Stock *
                        </label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={handleInputChange('stock')}
                                className={cn(
                                    'w-full pl-10 pr-4 py-2.5 rounded-xl border',
                                    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                                    'transition-all',
                                    errors.stock ? 'border-red-300' : 'border-gray-200'
                                )}
                                placeholder="0"
                            />
                        </div>
                        {errors.stock && (
                            <p className="mt-1 text-xs text-red-500">{errors.stock}</p>
                        )}
                    </div>
                </div>

                {/* Price Preview */}
                {formData.price && parseFloat(formData.price) > 0 && (
                    <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Value</span>
                            <span className="text-lg font-bold text-emerald-600">
                                ${(parseFloat(formData.price) * (parseInt(formData.stock) || 0)).toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default ProductFormModal;

import React, { useState, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Package, DollarSign, Layers, FileText, Archive } from 'lucide-react';
import productService from '../../services/productService';
import { CreateProductRequest } from '../../types/product';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface FormErrors {
    name?: string;
    price?: string;
    stock?: string;
    description?: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<CreateProductRequest>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Product name must be at least 3 characters';
        }

        if (formData.price <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        if (formData.stock < 0) {
            newErrors.stock = 'Stock cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleInputChange = useCallback((field: keyof CreateProductRequest, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
        setSubmitError(null);
    }, [errors]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await productService.create(formData);
            // Reset form
            setFormData({ name: '', description: '', price: 0, stock: 0, category: '' });
            setErrors({});
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Failed to create product:', error);
            setSubmitError(error.response?.data?.message || 'Failed to create product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm, onSuccess, onClose]);

    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            setFormData({ name: '', description: '', price: 0, stock: 0, category: '' });
            setErrors({});
            setSubmitError(null);
            onClose();
        }
    }, [isSubmitting, onClose]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add New Product"
            footer={
                <>
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="gap-2 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Package className="h-4 w-4" />
                                Create Product
                            </>
                        )}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                        {submitError}
                    </div>
                )}

                {/* Product Name */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        Product Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter product name"
                        className={`h-11 w-full rounded-xl border bg-gray-50 px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${errors.name
                            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                            : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'
                            }`}
                    />
                    {errors.name && (
                        <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-gray-400" />
                        Category
                    </label>
                    <input
                        type="text"
                        value={formData.category || ''}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        placeholder="e.g., Electronics, Clothing"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
                    />
                </div>

                {/* Price and Stock - Side by side */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            Price *
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price || ''}
                                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className={`h-11 w-full rounded-xl border bg-gray-50 pl-8 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${errors.price
                                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                    : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'
                                    }`}
                            />
                        </div>
                        {errors.price && (
                            <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Archive className="h-4 w-4 text-gray-400" />
                            Stock *
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.stock || ''}
                            onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className={`h-11 w-full rounded-xl border bg-gray-50 px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${errors.stock
                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'
                                }`}
                        />
                        {errors.stock && (
                            <p className="text-xs text-red-500 mt-1">{errors.stock}</p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter product description..."
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all resize-none"
                    />
                </div>
            </form>
        </Modal>
    );
};

export default AddProductModal;

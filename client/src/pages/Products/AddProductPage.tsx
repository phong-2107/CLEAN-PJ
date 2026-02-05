import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
    Package,
    Image as ImageIcon,
    FileText,
    DollarSign,
    Layers,
    Check,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
    AlertCircle,
    Upload,
    Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';
import productService from '../../services/productService';
import categoryService, { Category } from '../../services/categoryService';

// Step definitions
const steps = [
    { id: 1, name: 'Basic Info', icon: FileText, description: 'Product name and description' },
    { id: 2, name: 'Pricing', icon: DollarSign, description: 'Set price and stock' },
    { id: 3, name: 'Category', icon: Layers, description: 'Select category' },
    { id: 4, name: 'Media', icon: ImageIcon, description: 'Add product image' },
];

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    stock: string;
    categoryId: string;
    imageUrl: string;
}

const initialFormData: ProductFormData = {
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
};

// Validation functions
const validateStep = (step: number, data: ProductFormData): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (step) {
        case 1:
            if (!data.name.trim()) errors.push('Product name is required');
            if (data.name.length < 3) errors.push('Product name must be at least 3 characters');
            break;
        case 2:
            if (!data.price || parseFloat(data.price) <= 0) errors.push('Price must be greater than 0');
            if (!data.stock || parseInt(data.stock) < 0) errors.push('Stock cannot be negative');
            break;
        case 3:
            // Category is optional
            break;
        case 4:
            // Image is optional
            break;
    }

    return { valid: errors.length === 0, errors };
};

export const AddProductPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<ProductFormData>(initialFormData);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getActive();
                setCategories(data);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const handleInputChange = useCallback((field: keyof ProductFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setErrors([]);
    }, []);

    const handleNextStep = useCallback(() => {
        const validation = validateStep(currentStep, formData);
        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }
        setErrors([]);
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }, [currentStep, formData]);

    const handlePrevStep = useCallback(() => {
        setErrors([]);
        setCurrentStep(prev => Math.max(prev - 1, 1));
    }, []);

    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await productService.create({
                name: formData.name.trim(),
                description: formData.description.trim() || 'No description',
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10)
            });

            setSubmitSuccess(true);

            // Redirect after success
            setTimeout(() => {
                navigate('/dashboard/products');
            }, 2000);
        } catch (err: any) {
            console.error('Failed to create product:', err);
            setSubmitError(err.response?.data?.message || 'Failed to create product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, navigate]);

    const handleClose = useCallback(() => {
        navigate('/dashboard/products');
    }, [navigate]);

    // Step indicator component
    const StepIndicator: React.FC<{ step: typeof steps[0]; index: number }> = ({ step, index }) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const Icon = step.icon;

        return (
            <div
                className={cn(
                    'flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer',
                    isCompleted && 'bg-emerald-50',
                    isCurrent && 'bg-primary-50 ring-2 ring-primary-200',
                    !isCompleted && !isCurrent && 'opacity-50'
                )}
                onClick={() => stepNum < currentStep && setCurrentStep(stepNum)}
            >
                <div className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center transition-all',
                    isCompleted && 'bg-emerald-500 text-white',
                    isCurrent && 'bg-primary-500 text-white',
                    !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500'
                )}>
                    {isCompleted ? (
                        <Check className="h-5 w-5" />
                    ) : (
                        <Icon className="h-5 w-5" />
                    )}
                </div>
                <div className="hidden sm:block">
                    <p className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-primary-700' : 'text-gray-700'
                    )}>
                        Step {stepNum}
                    </p>
                    <p className="text-xs text-gray-500">{step.name}</p>
                </div>
            </div>
        );
    };

    // Render form content based on current step
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Basic Information</h3>
                            <p className="text-sm text-gray-500">Enter the product name and description</p>
                        </div>

                        <Input
                            label="Product Name *"
                            placeholder="Enter product name"
                            value={formData.name}
                            onChange={handleInputChange('name')}
                            className="text-lg"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                placeholder="Enter product description (optional)"
                                value={formData.description}
                                onChange={handleInputChange('description')}
                                rows={4}
                                className={cn(
                                    'w-full px-4 py-3 rounded-xl border border-gray-200',
                                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                                    'placeholder:text-gray-400 resize-none transition-all'
                                )}
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Pricing & Inventory</h3>
                            <p className="text-sm text-gray-500">Set the price and stock quantity</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price ($) *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={handleInputChange('price')}
                                        className={cn(
                                            'w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200',
                                            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                                            'placeholder:text-gray-400 text-lg font-medium'
                                        )}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stock Quantity *
                                </label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={formData.stock}
                                        onChange={handleInputChange('stock')}
                                        className={cn(
                                            'w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200',
                                            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                                            'placeholder:text-gray-400 text-lg font-medium'
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Price preview */}
                        {formData.price && parseFloat(formData.price) > 0 && (
                            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Product Price</span>
                                    <span className="text-2xl font-bold text-emerald-600">
                                        ${parseFloat(formData.price).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Category</h3>
                            <p className="text-sm text-gray-500">Select a category for your product (optional)</p>
                        </div>

                        {isLoadingCategories ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                                <span className="ml-2 text-gray-500">Loading categories...</span>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-8">
                                <Layers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No categories available</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* No category option */}
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, categoryId: '' }))}
                                    className={cn(
                                        'p-4 rounded-xl border-2 text-left transition-all duration-200',
                                        'hover:shadow-md',
                                        formData.categoryId === ''
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'h-10 w-10 rounded-lg flex items-center justify-center',
                                            formData.categoryId === '' ? 'bg-primary-100' : 'bg-gray-100'
                                        )}>
                                            <Package className={cn(
                                                'h-5 w-5',
                                                formData.categoryId === '' ? 'text-primary-600' : 'text-gray-500'
                                            )} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">No Category</p>
                                            <p className="text-xs text-gray-500">General product</p>
                                        </div>
                                    </div>
                                </button>

                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, categoryId: String(category.id) }))}
                                        className={cn(
                                            'p-4 rounded-xl border-2 text-left transition-all duration-200',
                                            'hover:shadow-md',
                                            formData.categoryId === String(category.id)
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                'h-10 w-10 rounded-lg flex items-center justify-center',
                                                formData.categoryId === String(category.id) ? 'bg-primary-100' : 'bg-gray-100'
                                            )}>
                                                <Layers className={cn(
                                                    'h-5 w-5',
                                                    formData.categoryId === String(category.id) ? 'text-primary-600' : 'text-gray-500'
                                                )} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{category.name}</p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {category.description || 'No description'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Product Image</h3>
                            <p className="text-sm text-gray-500">Add an image URL for your product (optional)</p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Image URL"
                                placeholder="https://example.com/image.jpg"
                                value={formData.imageUrl}
                                onChange={handleInputChange('imageUrl')}
                            />

                            {/* Image preview or upload placeholder */}
                            <div className={cn(
                                'relative h-48 rounded-xl border-2 border-dashed',
                                'flex flex-col items-center justify-center',
                                formData.imageUrl ? 'border-primary-200 bg-primary-50/50' : 'border-gray-200 bg-gray-50',
                                'transition-all duration-200'
                            )}>
                                {formData.imageUrl ? (
                                    <img
                                        src={formData.imageUrl}
                                        alt="Product preview"
                                        className="h-full w-full object-contain rounded-lg"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <>
                                        <Upload className="h-10 w-10 text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-500">Paste an image URL above</p>
                                        <p className="text-xs text-gray-400 mt-1">or leave empty for default</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Summary before submit */}
                        <div className="mt-8 p-4 bg-gray-50 rounded-xl space-y-3">
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                Product Summary
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Name:</span>
                                    <p className="font-medium text-gray-900">{formData.name || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Price:</span>
                                    <p className="font-medium text-emerald-600">
                                        ${formData.price ? parseFloat(formData.price).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Stock:</span>
                                    <p className="font-medium text-gray-900">{formData.stock || '0'} units</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Category:</span>
                                    <p className="font-medium text-gray-900">
                                        {categories.find(c => String(c.id) === formData.categoryId)?.name || 'None'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Success state
    if (submitSuccess) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center animate-in zoom-in-50 duration-300">
                    <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                        <Check className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Created!</h2>
                    <p className="text-gray-500 mb-6">Your product has been added successfully</p>
                    <Button onClick={() => navigate('/dashboard/products')}>
                        Go to Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-gray-500">Fill in the details to create a new product</p>
                </div>
                <button
                    onClick={handleClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Step Indicators (Sidebar) */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader className="pb-3">
                        <h3 className="font-semibold text-gray-900">Progress</h3>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {steps.map((step, index) => (
                            <StepIndicator key={step.id} step={step} index={index} />
                        ))}
                    </CardContent>
                </Card>

                {/* Form Content */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                        {/* Error display */}
                        {errors.length > 0 && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-800">Please fix the following:</p>
                                        <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                                            {errors.map((error, i) => (
                                                <li key={i}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {submitError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    <p className="text-sm text-red-600">{submitError}</p>
                                </div>
                            </div>
                        )}

                        {/* Step content */}
                        {renderStepContent()}

                        {/* Navigation buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                            <Button
                                variant="secondary"
                                onClick={handlePrevStep}
                                disabled={currentStep === 1}
                                className="gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </Button>

                            {currentStep < steps.length ? (
                                <Button onClick={handleNextStep} className="gap-2">
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Create Product
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddProductPage;

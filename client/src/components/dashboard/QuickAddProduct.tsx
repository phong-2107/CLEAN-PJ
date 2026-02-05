import React, { useState, useCallback } from 'react';
import { Plus, X, Loader2, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import productService from '../../services/productService';
import { cn } from '../../utils/cn';

interface QuickAddProductProps {
    onProductAdded?: () => void;
    className?: string;
}

export const QuickAddProduct: React.FC<QuickAddProductProps> = ({
    onProductAdded,
    className
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: ''
    });

    const handleInputChange = useCallback((field: string) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setError(null);
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.stock) {
            setError('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await productService.create({
                name: formData.name,
                description: formData.description || 'No description',
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10)
            });

            setSuccess(true);
            setFormData({ name: '', description: '', price: '', stock: '' });

            // Reset success state after animation
            setTimeout(() => {
                setSuccess(false);
                setIsExpanded(false);
                onProductAdded?.();
            }, 1500);
        } catch (err) {
            console.error('Failed to create product:', err);
            setError('Failed to create product. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [formData, onProductAdded]);

    const handleClose = useCallback(() => {
        setIsExpanded(false);
        setFormData({ name: '', description: '', price: '', stock: '' });
        setError(null);
    }, []);

    return (
        <Card className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            isExpanded ? 'ring-2 ring-primary-500/20' : '',
            className
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Add Product</h3>
                    {isExpanded && (
                        <button
                            onClick={handleClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {!isExpanded ? (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className={cn(
                            'w-full flex items-center justify-center gap-2 py-8 px-4',
                            'border-2 border-dashed border-gray-200 rounded-xl',
                            'text-gray-500 hover:text-primary-600 hover:border-primary-300',
                            'hover:bg-primary-50/50 transition-all duration-200',
                            'group cursor-pointer'
                        )}
                    >
                        <div className={cn(
                            'h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center',
                            'group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-200'
                        )}>
                            <Plus className="h-5 w-5 group-hover:text-primary-600" />
                        </div>
                        <span className="font-medium">Add New Product</span>
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <Input
                                    label="Product Name *"
                                    placeholder="Enter product name"
                                    value={formData.name}
                                    onChange={handleInputChange('name')}
                                    disabled={isLoading}
                                />
                            </div>
                            <Input
                                label="Price *"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={handleInputChange('price')}
                                disabled={isLoading}
                            />
                            <Input
                                label="Stock *"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={formData.stock}
                                onChange={handleInputChange('stock')}
                                disabled={isLoading}
                            />
                            <div className="sm:col-span-2">
                                <Input
                                    label="Description"
                                    placeholder="Optional description"
                                    value={formData.description}
                                    onChange={handleInputChange('description')}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                type="submit"
                                disabled={isLoading || success}
                                className={cn(
                                    'flex-1 gap-2 transition-all duration-200',
                                    success ? 'bg-emerald-500 hover:bg-emerald-500' : ''
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : success ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Product Created!
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Create Product
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};

export default QuickAddProduct;

import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import {
    Layers,
    Tag,
    Calendar,
    CheckCircle,
    XCircle,
    FolderTree
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface Category {
    id: number;
    name: string;
    description?: string;
    parentId?: number | null;
    parentCategoryName?: string;
    isActive: boolean;
    createdAt?: string;
}

interface CategoryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
    isOpen,
    onClose,
    category
}) => {
    if (!category) return null;

    const formatDate = (date: string | undefined): string => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Category Details"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl">
                    <div className={cn(
                        'h-14 w-14 rounded-xl flex items-center justify-center',
                        'bg-gradient-to-br from-violet-100 to-purple-200 shadow-md'
                    )}>
                        <Layers className="h-7 w-7 text-violet-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={category.isActive ? 'success' : 'error'}>
                                {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                            <Tag className="h-4 w-4" />
                            Category ID
                        </div>
                        <p className="font-semibold text-gray-900">#{category.id}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                            {category.isActive ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            Status
                        </div>
                        <p className={cn(
                            "font-semibold",
                            category.isActive ? "text-green-600" : "text-red-600"
                        )}>
                            {category.isActive ? 'Active' : 'Inactive'}
                        </p>
                    </div>
                </div>

                {/* Parent Category */}
                {(category.parentId || category.parentCategoryName) && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-600 text-xs mb-2">
                            <FolderTree className="h-4 w-4" />
                            Parent Category
                        </div>
                        <p className="font-semibold text-amber-700">
                            {category.parentCategoryName || `Category #${category.parentId}`}
                        </p>
                    </div>
                )}

                {/* Description */}
                {category.description && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-2">Description</p>
                        <p className="text-sm text-gray-700">{category.description}</p>
                    </div>
                )}

                {/* Created Date */}
                {category.createdAt && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">Created</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                            {formatDate(category.createdAt)}
                        </span>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CategoryDetailModal;

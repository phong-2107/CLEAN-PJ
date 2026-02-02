import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchBarProps {
    className?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    showShortcut?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    className,
    placeholder = 'Search...',
    value,
    onChange,
    showShortcut = true,
}) => {
    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-16 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            {showShortcut && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    <kbd className="px-1.5 py-0.5 text-xs font-medium text-gray-400 bg-white border border-gray-200 rounded shadow-sm">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 text-xs font-medium text-gray-400 bg-white border border-gray-200 rounded shadow-sm">K</kbd>
                </div>
            )}
        </div>
    );
};

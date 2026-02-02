import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DropdownItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
}

interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    align?: 'left' | 'right';
    className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    items,
    align = 'right',
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={cn("relative", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1"
            >
                {trigger}
                <ChevronDown className={cn(
                    "h-4 w-4 text-gray-400 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {isOpen && (
                <div
                    className={cn(
                        "absolute top-full mt-2 min-w-[180px] py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in",
                        align === 'right' ? 'right-0' : 'left-0'
                    )}
                >
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                item.onClick?.();
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full px-4 py-2 text-sm text-left flex items-center gap-2 hover:bg-gray-50 transition-colors",
                                item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

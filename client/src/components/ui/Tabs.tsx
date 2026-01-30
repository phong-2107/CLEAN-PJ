import React from 'react';
import { cn } from '../../utils/cn';

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onChange,
    className,
}) => {
    return (
        <div className={cn("flex items-center gap-1 border-b border-gray-200", className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        "px-4 py-2.5 text-sm font-medium transition-colors relative",
                        activeTab === tab.id
                            ? "text-primary-600"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    <span className="flex items-center gap-2">
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={cn(
                                "px-2 py-0.5 text-xs rounded-full",
                                activeTab === tab.id
                                    ? "bg-primary-100 text-primary-700"
                                    : "bg-gray-100 text-gray-600"
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </span>
                    {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                    )}
                </button>
            ))}
        </div>
    );
};

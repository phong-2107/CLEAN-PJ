import React from 'react';
import { cn } from '../../utils/cn';

export interface Column<T> {
    key: string;
    header: string;
    width?: string;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string | number }> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
    renderActions?: (item: T) => React.ReactNode;
    emptyMessage?: string;
    className?: string;
}

export function DataTable<T extends { id: string | number }>({
    columns,
    data,
    onRowClick,
    renderActions,
    emptyMessage = 'No data available',
    className,
}: DataTableProps<T>) {
    return (
        <div className={cn("overflow-x-auto", className)}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 w-10">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                        </th>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: column.width }}
                            >
                                {column.header}
                            </th>
                        ))}
                        {renderActions && (
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                Action
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length + (renderActions ? 2 : 1)}
                                className="px-6 py-12 text-center text-gray-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => onRowClick?.(item)}
                                className={cn(
                                    "hover:bg-gray-50 transition-colors",
                                    onRowClick && "cursor-pointer"
                                )}
                            >
                                <td className="px-4 py-4">
                                    <input
                                        type="checkbox"
                                        onClick={(e) => e.stopPropagation()}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </td>
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-4 py-4 text-sm text-gray-900"
                                    >
                                        {column.render
                                            ? column.render(item)
                                            : (item as any)[column.key]}
                                    </td>
                                ))}
                                {renderActions && (
                                    <td className="px-4 py-4 text-right">
                                        {renderActions(item)}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

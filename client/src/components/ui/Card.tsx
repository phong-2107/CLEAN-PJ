import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
    return (
        <div className={cn("rounded-xl border bg-white shadow-sm text-gray-950", className)} {...props} />
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => {
    return <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
    return <div className={cn("p-6 pt-0", className)} {...props} />;
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
    return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
};

import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
};

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = '',
    fallback,
    size = 'md',
    className,
}) => {
    const [imageError, setImageError] = React.useState(false);

    const initials = fallback
        ? fallback.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    if (src && !imageError) {
        return (
            <img
                src={src}
                alt={alt}
                onError={() => setImageError(true)}
                className={cn(
                    "rounded-full object-cover ring-2 ring-white",
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                "rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-medium text-white ring-2 ring-white",
                sizeClasses[size],
                className
            )}
        >
            {initials}
        </div>
    );
};

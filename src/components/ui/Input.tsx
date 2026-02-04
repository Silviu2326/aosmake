import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-white/10 bg-surfaceHighlight px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    error && "border-red-500/50 focus:ring-red-500/50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

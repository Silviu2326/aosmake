import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'link';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {

        // Base styles
        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50";

        // Variants
        const variants = {
            primary: "bg-accent text-white hover:bg-accent-hover shadow-glow shadow-accent/20",
            secondary: "bg-surfaceHighlight text-white hover:bg-white/10 border border-white/5",
            ghost: "text-gray-300 hover:text-white hover:bg-white/5",
            outline: "border border-white/20 bg-transparent hover:bg-white/5 text-gray-200",
            destructive: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
            link: "text-accent underline-offset-4 hover:underline",
        };

        // Sizes
        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2 text-sm",
            lg: "h-12 px-8 text-base",
            icon: "h-10 w-10",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

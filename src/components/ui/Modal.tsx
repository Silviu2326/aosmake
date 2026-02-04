import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, footer, className }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content */}
            <div className={cn(
                "relative z-50 w-full max-w-lg rounded-xl border border-white/10 bg-surface shadow-2xl p-6 sm:p-6 animate-in fade-in zoom-in-95 duration-200",
                className
            )}>
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                    {title && (
                        <h2 className="text-lg font-semibold leading-none tracking-tight text-white">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="text-sm text-gray-400">
                            {description}
                        </p>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-gray-400 hover:text-white"
                >
                    <X size={18} />
                    <span className="sr-only">Close</span>
                </button>

                <div className="mt-4">
                    {children}
                </div>

                {footer && (
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

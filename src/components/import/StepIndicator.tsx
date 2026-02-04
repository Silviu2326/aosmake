import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
    steps: string[];
    currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="w-full flex items-center justify-between px-4 sm:px-12 relative mb-8">
            {/* Connector Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full px-12 z-0">
                <div className="h-0.5 w-full bg-white/10" />
            </div>

            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
                            isCompleted ? "bg-accent border-accent text-white" :
                                isCurrent ? "bg-background border-accent text-accent shadow-glow" :
                                    "bg-surface border-white/10 text-gray-500"
                        )}>
                            {isCompleted ? <Check size={14} /> : index + 1}
                        </div>
                        <span className={clsx(
                            "text-xs font-medium bg-background/80 px-2 py-0.5 rounded",
                            isCurrent ? "text-white" : "text-gray-500"
                        )}>
                            {step}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

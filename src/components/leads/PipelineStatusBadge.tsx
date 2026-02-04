import React from 'react';
import { LeadStepStatus } from '../../stores/useAppStore';

interface PipelineStatusBadgeProps {
    stepStatus?: LeadStepStatus;
}

const statusColors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    sent: 'bg-blue-500/20 text-blue-400',
    verified: 'bg-green-500/20 text-green-400',
    scraped: 'bg-blue-500/20 text-blue-400',
    hit: 'bg-green-500/20 text-green-400',
    fit: 'bg-purple-500/20 text-purple-400',
    drop: 'bg-red-500/20 text-red-400',
    replied: 'bg-blue-500/20 text-blue-400',
    positive_reply: 'bg-green-500/20 text-green-400',
    converted: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-red-500/20 text-red-400',
    no_fit: 'bg-orange-500/20 text-orange-400',
    bounced: 'bg-red-500/20 text-red-400'
};

const statusLabels: Record<string, string> = {
    verified: 'Verificado',
    pending: 'Pendiente',
    sent: 'Enviado',
    scraped: 'Scraped',
    hit: 'HIT',
    fit: 'FIT',
    drop: 'DROP',
    replied: 'Replied',
    positive_reply: '+ Reply',
    converted: 'Convertido',
    failed: 'Fallido',
    no_fit: 'NO FIT',
    bounced: 'Bounced'
};

export function PipelineStatusBadge({ stepStatus }: PipelineStatusBadgeProps) {
    if (!stepStatus) {
        return (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                Sin estado
            </span>
        );
    }

    // Find the current step that is pending (not completed)
    const steps = ['verification', 'compScrap', 'box1', 'instantly'] as const;
    
    const stepLabels: Record<string, string> = {
        verification: 'Verificación',
        compScrap: 'Comp. Scrap',
        box1: 'Box 1',
        instantly: 'Instantly'
    };

    for (const step of steps) {
        const status = stepStatus[step];
        if (status === 'pending') {
            return (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    {stepLabels[step] || step}
                </span>
            );
        }
        if (status === 'sent') {
            return (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                    Enviado
                </span>
            );
        }
    }

    // If all completed, show the last completed step
    if (stepStatus.instantly === 'converted') {
        return (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                Convertido
            </span>
        );
    }

    if (stepStatus.instantly === 'positive_reply') {
        return (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                + Reply
            </span>
        );
    }

    if (stepStatus.box1 === 'hit') {
        return (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                HIT
            </span>
        );
    }

    if (stepStatus.box1 === 'fit') {
        return (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                FIT
            </span>
        );
    }

    if (stepStatus.box1 === 'drop') {
        return (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                DROP
            </span>
        );
    }

    if (stepStatus.verification === 'verified') {
        return (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                Verificado
            </span>
        );
    }

    // Default fallback
    return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            {statusLabels[stepStatus.verification || ''] || 'Procesando'}
        </span>
    );
}

export default PipelineStatusBadge;

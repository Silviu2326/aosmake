import React from 'react';
import { Badge } from '../ui/Badge';
import { CheckCircle, AlertCircle, Loader2, Clock, XCircle } from 'lucide-react';

export type RunStatus = 'success' | 'failed' | 'running' | 'queued' | 'cancelled';

interface RunStatusBadgeProps {
    status: RunStatus;
}

export function RunStatusBadge({ status }: RunStatusBadgeProps) {
    const config: Record<RunStatus, { variant: 'success' | 'error' | 'info' | 'default' | 'warning', icon: React.ElementType, label: string, className?: string }> = {
        success: { variant: 'success', icon: CheckCircle, label: 'Success' },
        failed: { variant: 'error', icon: AlertCircle, label: 'Failed' },
        running: { variant: 'info', icon: Loader2, label: 'Running', className: "animate-spin" },
        queued: { variant: 'default', icon: Clock, label: 'Queued' },
        cancelled: { variant: 'warning', icon: XCircle, label: 'Cancelled' },
    };

    const { variant, icon: Icon, label, className } = config[status] || config.queued;

    return (
        <Badge variant={variant} className="gap-1.5">
            <Icon size={12} className={className} />
            {label}
        </Badge>
    );
}

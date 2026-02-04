import React from 'react';
import { Badge } from '../ui/Badge';
import { CheckCircle, AlertTriangle, XCircle, Clock, HelpCircle } from 'lucide-react';
import { EmailStatus } from '../../stores/useAppStore';

interface EmailStatusBadgeProps {
    status: EmailStatus;
}

export function EmailStatusBadge({ status }: EmailStatusBadgeProps) {
    const config = {
        valid: { variant: 'success' as const, icon: CheckCircle, label: 'Valid' },
        invalid: { variant: 'error' as const, icon: XCircle, label: 'Invalid' },
        risky: { variant: 'warning' as const, icon: AlertTriangle, label: 'Risky' },
        pending: { variant: 'info' as const, icon: Clock, label: 'Pending' },
        unknown: { variant: 'default' as const, icon: HelpCircle, label: 'Unknown' },
    };

    const { variant, icon: Icon, label } = config[status] || config.unknown;

    return (
        <Badge variant={variant} className="gap-1.5">
            <Icon size={12} />
            {label}
        </Badge>
    );
}

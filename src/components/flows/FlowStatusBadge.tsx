import React from 'react';
import { Badge } from '../ui/Badge';
import { Circle, Archive, PauseCircle, FileEdit } from 'lucide-react';

export type FlowStatus = 'active' | 'draft' | 'paused' | 'archived';

interface FlowStatusBadgeProps {
    status: FlowStatus;
}

export function FlowStatusBadge({ status }: FlowStatusBadgeProps) {
    const config = {
        active: { variant: 'success' as const, icon: Circle, label: 'Active', className: "fill-current" },
        draft: { variant: 'default' as const, icon: FileEdit, label: 'Draft', className: "" },
        paused: { variant: 'warning' as const, icon: PauseCircle, label: 'Paused', className: "" },
        archived: { variant: 'error' as const, icon: Archive, label: 'Archived', className: "" },
    };

    const { variant, icon: Icon, label, className } = config[status] || config.draft;

    return (
        <Badge variant={variant} className="gap-1.5">
            <Icon size={10} className={className} />
            {label}
        </Badge>
    );
}

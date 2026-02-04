import React from 'react';
import { Lead } from '../../stores/useAppStore';
import { Button } from '../ui/Button';
import { EmailStatusBadge } from './EmailStatusBadge';
import { Mail, Play, Edit, Trash2 } from 'lucide-react';

interface LeadHeaderProps {
    lead: Lead;
    onVerifyEmail: () => void;
    onRunFlow: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function LeadHeader({ lead, onVerifyEmail, onRunFlow, onEdit, onDelete }: LeadHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-surface border-b border-white/5">
            <div className="flex items-center gap-4">
                {/* Avatar Placeholder */}
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-accent to-blue-600 flex items-center justify-center text-xl font-bold text-white ring-4 ring-surface">
                    {lead.firstName[0]}{lead.lastName[0]}
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        {lead.firstName} {lead.lastName}
                        <EmailStatusBadge status={lead.emailStatus} />
                    </h1>
                    <div className="flex items-center gap-2 text-gray-400">
                        <span className="font-medium text-gray-300">VP of Engineering</span>
                        <span>@</span>
                        <span>{lead.company}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="secondary" onClick={onVerifyEmail}>
                    <Mail size={16} className="mr-2" /> Verify Email
                </Button>
                <Button variant="primary" onClick={onRunFlow}>
                    <Play size={16} className="mr-2" /> Run Flow
                </Button>
                <Button variant="ghost" size="icon" onClick={onEdit}>
                    <Edit size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={onDelete}>
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
}

import React from 'react';
import { Button } from '../ui/Button';
import { Mail, Play, Trash2, Download } from 'lucide-react';

interface BulkActionBarProps {
    selectedCount: number;
    onVerifyEmail: () => void;
    onRunFlow: () => void;
    onDelete: () => void;
    onExport: () => void;
}

export function BulkActionBar({ selectedCount, onVerifyEmail, onRunFlow, onDelete, onExport }: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-surface border border-white/10 shadow-2xl rounded-lg p-2 flex items-center gap-4 animate-in slide-in-from-bottom-4">
            <div className="px-4 border-r border-white/10 font-medium text-white">
                {selectedCount} selected
            </div>

            <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={onVerifyEmail}>
                    <Mail size={14} className="mr-2" />
                    Verify Email
                </Button>
                <Button size="sm" variant="secondary" onClick={onRunFlow}>
                    <Play size={14} className="mr-2" />
                    Run Flow
                </Button>
                <Button size="sm" variant="secondary" onClick={onExport}>
                    <Download size={14} className="mr-2" />
                    Export
                </Button>
                <div className="w-px h-8 bg-white/10 mx-1" />
                <Button size="sm" variant="destructive" onClick={onDelete}>
                    <Trash2 size={14} className="mr-2" />
                    Delete
                </Button>
            </div>
        </div>
    );
}

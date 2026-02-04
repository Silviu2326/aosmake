import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { RunStatusBadge, RunStatus } from './RunStatusBadge';
import { ChevronRight } from 'lucide-react';

export interface Run {
    id: string;
    workflowId: string;
    workflowVersion: string;
    status: RunStatus;
    startTime: Date;
    duration: number; // ms
    type: 'precrafter' | 'crafter';
    // Additional mock data
    trigger?: string;
}

interface RunsTableProps {
    runs: Run[];
    onRunClick: (run: Run) => void;
}

export function RunsTable({ runs, onRunClick }: RunsTableProps) {
    if (runs.length === 0) {
        return (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-xl text-gray-500">
                No runs found for this filter.
            </div>
        );
    }

    return (
        <div className="border border-white/10 rounded-xl bg-surface overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Workflow Version</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {runs.map((run) => (
                        <TableRow
                            key={run.id}
                            className="cursor-pointer group hover:bg-white/5"
                            onClick={() => onRunClick(run)}
                        >
                            <TableCell>
                                <RunStatusBadge status={run.status} />
                            </TableCell>
                            <TableCell className="font-medium text-gray-200">
                                v{run.workflowVersion}
                            </TableCell>
                            <TableCell className="text-gray-400">
                                {formatDuration(run.duration)}
                            </TableCell>
                            <TableCell className="text-gray-400">
                                {formatTimeAgo(run.startTime)}
                            </TableCell>
                            <TableCell className="text-right">
                                <button className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                                    <ChevronRight size={18} />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// Helpers
function formatDuration(ms: number) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

function formatTimeAgo(date: Date) {
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
}

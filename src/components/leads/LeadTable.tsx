import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../ui/Table';
import { PipelineStatusBadge } from './PipelineStatusBadge';
import { Lead } from '../../stores/useAppStore';
import { useNavigate } from 'react-router-dom';

interface LeadTableProps {
    leads: Lead[];
    selectedIds: string[];
    onSelect: (id: string) => void;
    onSelectAll: (checked: boolean) => void;
}

export function LeadTable({ leads, selectedIds, onSelect, onSelectAll }: LeadTableProps) {
    const navigate = useNavigate();
    const allSelected = leads.length > 0 && selectedIds.length === leads.length;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">
                        <input
                            type="checkbox"
                            className="rounded border-gray-600 bg-surfaceHighlight text-accent focus:ring-accent"
                            checked={allSelected}
                            onChange={(e) => onSelectAll(e.target.checked)}
                        />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Pipeline</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Created</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {leads.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                            No leads found. Add or import leads to get started.
                        </TableCell>
                    </TableRow>
                ) : (
                    leads.map((lead) => (
                        <TableRow
                            key={lead.id}
                            className="cursor-pointer group"
                            onClick={() => navigate(`/leads/${lead.id}`)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-600 bg-surfaceHighlight text-accent focus:ring-accent"
                                    checked={selectedIds.includes(lead.id)}
                                    onChange={() => onSelect(lead.id)}
                                />
                            </TableCell>
                            <TableCell className="font-medium text-white group-hover:text-accent transition-colors">
                                {lead.firstName} {lead.lastName}
                            </TableCell>
                            <TableCell>{lead.company}</TableCell>
                            <TableCell className="text-gray-400">{lead.email}</TableCell>
                            <TableCell>
                                <PipelineStatusBadge stepStatus={lead.stepStatus} />
                            </TableCell>
                            <TableCell className="capitalize text-gray-400">{lead.source.replace('_', ' ')}</TableCell>
                            <TableCell className="text-gray-500 text-xs">
                                {new Date(lead.createdAt).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}

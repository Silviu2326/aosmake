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
import { FieldConfig } from '../../stores/useAppStore';
import { useNavigate } from 'react-router-dom';

interface LeadTableProps {
    leads: Lead[];
    selectedIds: string[];
    onSelect: (id: string) => void;
    onSelectAll: (checked: boolean) => void;
    visibleFields?: FieldConfig[];
}

export function LeadTable({ leads, selectedIds, onSelect, onSelectAll, visibleFields }: LeadTableProps) {
    const navigate = useNavigate();
    const allSelected = leads.length > 0 && selectedIds.length === leads.length;

    // Determine which fields are visible
    const isFieldVisible = (fieldId: string) => {
        if (!visibleFields) return true;
        const field = visibleFields.find(f => f.id === fieldId);
        return field?.visible ?? true;
    };

    const visibleColumns = [
        { id: 'name', label: 'Name' },
        { id: 'company', label: 'Company' },
        { id: 'email', label: 'Email' },
        { id: 'pipeline', label: 'Pipeline' },
        { id: 'source', label: 'Source' },
        { id: 'created', label: 'Created' },
    ].filter(col => isFieldVisible(col.id));

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
                    {visibleColumns.map(col => (
                        <TableHead key={col.id}>{col.label}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {leads.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={visibleColumns.length + 1} className="text-center py-12 text-gray-500">
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
                            {isFieldVisible('name') && (
                                <TableCell className="font-medium text-white group-hover:text-accent transition-colors">
                                    {lead.firstName} {lead.lastName}
                                </TableCell>
                            )}
                            {isFieldVisible('company') && (
                                <TableCell>{lead.company}</TableCell>
                            )}
                            {isFieldVisible('email') && (
                                <TableCell className="text-gray-400">{lead.email}</TableCell>
                            )}
                            {isFieldVisible('pipeline') && (
                                <TableCell>
                                    <PipelineStatusBadge stepStatus={lead.stepStatus} />
                                </TableCell>
                            )}
                            {isFieldVisible('source') && (
                                <TableCell className="capitalize text-gray-400">{lead.source.replace('_', ' ')}</TableCell>
                            )}
                            {isFieldVisible('created') && (
                                <TableCell className="text-gray-500 text-xs">
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                </TableCell>
                            )}
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}

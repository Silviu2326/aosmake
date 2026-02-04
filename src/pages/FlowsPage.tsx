import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { FlowGrid } from '../components/flows/FlowGrid';
import { FlowFilters } from '../components/flows/FlowFilters';
import { UIFlow } from '../components/flows/FlowCard';
import { FlowStatus } from '../components/flows/FlowStatusBadge';

// Mock Data
const MOCK_FLOWS: UIFlow[] = [
    { id: '1', name: 'Lead Scoring', status: 'active', version: '2.3', lastRun: new Date(), successRate: 98 },
    { id: '2', name: 'Email Enricher', status: 'draft', version: '1.0', lastRun: undefined, successRate: undefined },
    { id: '3', name: 'Content Generator', status: 'paused', version: '1.2', lastRun: new Date(Date.now() - 86400000), successRate: 85 },
    { id: '4', name: 'Outreach Sequence', status: 'active', version: '3.0', lastRun: new Date(), successRate: 92 },
    { id: '5', name: 'Legacy Flow 2024', status: 'archived', version: '1.0', lastRun: new Date(Date.now() - 86400000 * 30), successRate: 60 },
];

export function FlowsPage() {
    const [filter, setFilter] = useState<'all' | FlowStatus>('all');
    const [search, setSearch] = useState('');

    const filteredFlows = MOCK_FLOWS.filter(flow => {
        const matchesFilter = filter === 'all' || flow.status === filter;
        const matchesSearch = flow.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleEdit = (id: string) => console.log('Edit', id);
    const handleTest = (id: string) => console.log('Test', id);
    const handleDuplicate = (id: string) => console.log('Duplicate', id);
    const handleArchive = (id: string) => console.log('Archive', id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Flow Library</h1>
                    <p className="text-gray-400 mt-1">Design and manage your automation workflows</p>
                </div>
                <Button className="gap-2">
                    <Plus size={16} /> Create Flow
                </Button>
            </div>

            <div className="space-y-4">
                <FlowFilters
                    activeFilter={filter}
                    onFilterChange={setFilter}
                    onSearch={setSearch}
                />

                <FlowGrid
                    flows={filteredFlows}
                    onEdit={handleEdit}
                    onTest={handleTest}
                    onDuplicate={handleDuplicate}
                    onArchive={handleArchive}
                />
            </div>
        </div>
    );
}

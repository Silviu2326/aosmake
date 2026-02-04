import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadFilters } from '../components/leads/LeadFilters';
import { BulkActionBar } from '../components/leads/BulkActionBar';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LeadsPage() {
    const { leads, fetchLeads, isLoading, error } = useAppStore();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? leads.map(l => l.id) : []);
    };

    // Loading state
    if (isLoading && leads.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando leads...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && leads.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button onClick={() => fetchLeads()}>Reintentar</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h1 className="text-2xl font-bold text-white">Leads</h1>
                    <p className="text-gray-400 mt-1">Manage and track your outreach targets</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/import')}>
                        Import CSV
                    </Button>
                    <Button className="gap-2">
                        <Plus size={16} /> Add Lead
                    </Button>
                </div>
            </div>

            <div className="border border-white/10 rounded-xl bg-surface overflow-hidden">
                <LeadFilters
                    onSearch={(q) => console.log('Search', q)}
                    onFilterChange={(k, v) => console.log('Filter', k, v)}
                    onClear={() => console.log('Clear')}
                />
                <LeadTable
                    leads={leads}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onSelectAll={handleSelectAll}
                />
            </div>

            <BulkActionBar
                selectedCount={selectedIds.length}
                onVerifyEmail={() => console.log('Verify', selectedIds)}
                onRunFlow={() => console.log('Run Flow', selectedIds)}
                onDelete={() => console.log('Delete', selectedIds)}
                onExport={() => console.log('Export', selectedIds)}
            />
        </div>
    );
}

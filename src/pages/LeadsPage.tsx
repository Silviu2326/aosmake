import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadFilters } from '../components/leads/LeadFilters';
import { BulkActionBar } from '../components/leads/BulkActionBar';
import { Button } from '../components/ui/Button';
import { Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomizeFieldsModal } from '../components/leads/CustomizeFieldsModal';

export function LeadsPage() {
    const { leads, fetchLeads, isLoading, error, tableFields, pageFields, setTableFields, setPageFields, loadFieldSettings } = useAppStore();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const navigate = useNavigate();

    // Format helper
    const formatNumber = (value: number) => value.toLocaleString('es-ES');

    // Calcular métricas simples
    const totalLeads = leads.length;
    const verifiedLeads = leads.filter(l => l.stepStatus?.verification === 'verified').length;
    const convertedLeads = leads.filter(l => l.stepStatus?.instantly === 'converted').length;

    useEffect(() => {
        fetchLeads();
        loadFieldSettings();
    }, [fetchLeads, loadFieldSettings]);

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
            {/* Header Mejorado */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-gradient-to-r from-surface via-surface to-surface/80 border border-border/50 rounded-2xl">
                {/* Izquierda: Icono + Título + Stats */}
                <div className="flex items-start gap-4">
                    {/* Icono Grande con fondo */}
                    <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-green-500/20 border border-accent/20">
                        <svg 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            className="w-7 h-7 text-accent"
                            stroke="currentColor" 
                            strokeWidth="1.5"
                        >
                            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    {/* Título y subtítulo */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                                Leads
                            </h1>
                            {/* Badge de estado */}
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Activo
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                            Gestiona y da seguimiento a tus contactos potenciales
                        </p>
                        
                        {/* Stats rápidas */}
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg font-semibold text-white">{formatNumber(totalLeads)}</span>
                                <span className="text-xs text-gray-500">Total</span>
                            </div>
                            <div className="w-px h-4 bg-border/50" />
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg font-semibold text-green-400">{formatNumber(verifiedLeads)}</span>
                                <span className="text-xs text-gray-500">Verificados</span>
                            </div>
                            <div className="w-px h-4 bg-border/50 hidden sm:block" />
                            <div className="hidden sm:flex items-center gap-1.5">
                                <span className="text-lg font-semibold text-accent">{formatNumber(convertedLeads)}</span>
                                <span className="text-xs text-gray-500">Convertidos</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Derecha: Acciones */}
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsCustomizeModalOpen(true)} className="gap-2">
                        <Settings size={16} /> 
                        <span className="hidden sm:inline">Personalizar</span>
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/import')}>
                        Importar CSV
                    </Button>
                    <Button className="gap-2">
                        <Plus size={16} /> 
                        <span className="hidden sm:inline">Añadir Lead</span>
                        <span className="sm:hidden">Añadir</span>
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
                    visibleFields={tableFields}
                />
            </div>

            <BulkActionBar
                selectedCount={selectedIds.length}
                onVerifyEmail={() => console.log('Verify', selectedIds)}
                onRunFlow={() => console.log('Run Flow', selectedIds)}
                onDelete={() => console.log('Delete', selectedIds)}
                onExport={() => console.log('Export', selectedIds)}
            />

            <CustomizeFieldsModal
                isOpen={isCustomizeModalOpen}
                onClose={() => setIsCustomizeModalOpen(false)}
                onSaveTableFields={setTableFields}
                onSavePageFields={setPageFields}
            />
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { StepIndicator } from './StepIndicator';
import { FileUploader } from './FileUploader';
import { ColumnMapper, AVAILABLE_FIELDS } from './ColumnMapper';
import { NormalizationOptions } from './NormalizationOptions';
import { DuplicateResolver } from './DuplicateResolver';
import { ImportSummary } from './ImportSummary';
import { Button } from '../ui/Button';
import { ArrowLeft, ArrowRight, Upload, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Campaign', 'Upload', 'Map', 'Format', 'Duplicates', 'Review'];

const API_URL = 'https://backendaos-production.up.railway.app/api';

interface Campaign {
  id: string;
  name: string;
  leadCount: number;
}

interface ImportWizardProps {
  onComplete?: () => void;
}

// Simple CSV parser for headers
async function parseCSVHeaders(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length > 0) {
                // Parse header line (handle quoted values)
                const headerLine = lines[0];
                const headers: string[] = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < headerLine.length; i++) {
                    const char = headerLine[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        headers.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                headers.push(current.trim());
                resolve(headers);
            } else {
                resolve([]);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file.slice(0, 1024 * 1024));
    });
}

// Generate auto-mappings from headers
function generateAutoMappings(headers: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};
    
    headers.forEach(header => {
        const normalizedHeader = header.toLowerCase().trim().replace(/\s+/g, '');
        
        // Check against all available fields
        for (const field of AVAILABLE_FIELDS) {
            const normalizedField = field.label.toLowerCase().replace(/\s+/g, '');
            
            // Direct match
            if (normalizedHeader === normalizedField || 
                normalizedHeader === field.value.toLowerCase() ||
                normalizedHeader === field.value.toLowerCase().replace(/([A-Z])/g, '$1').toLowerCase()) {
                mappings[header] = field.value;
                break;
            }
        }
    });
    
    return mappings;
}

export function ImportWizard({ onComplete }: ImportWizardProps) {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [fileHeaders, setFileHeaders] = useState<string[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

    // Import Configuration Options
    const [leadIdStrategy, setLeadIdStrategy] = useState<'auto' | 'csv' | 'fixed' | 'pattern'>('auto');
    const [leadIdPrefix, setLeadIdPrefix] = useState('LEAD-');
    const [leadIdStartNumber, setLeadIdStartNumber] = useState(1);
    const [fixedLeadId, setFixedLeadId] = useState('');
    const [leadIdPattern, setLeadIdPattern] = useState('{prefix}{date}-{number}');

    const [campaignIdStrategy, setCampaignIdStrategy] = useState<'single' | 'csv' | 'none'>('single');
    const [csvCampaignColumn, setCsvCampaignColumn] = useState('');

    // State
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [normOptions, setNormOptions] = useState({ trimWhitespace: true, capitalizeNames: true, lowercaseEmails: true, removeDuplicatesFile: true });
    const [dupStrategy, setDupStrategy] = useState<'skip' | 'update' | 'append'>('skip');
    const [isImporting, setIsImporting] = useState(false);
    const [totalRows, setTotalRows] = useState(0);

    // Fetch campaigns
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await fetch(`${API_URL}/campaigns`);
                if (response.ok) {
                    const data = await response.json();
                    setCampaigns(data.campaigns || []);
                }
            } catch (error) {
                console.error('Error fetching campaigns:', error);
            } finally {
                setIsLoadingCampaigns(false);
            }
        };
        fetchCampaigns();
    }, []);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            handleImport();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(c => c - 1);
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        
        try {
            const formData = new FormData();
            if (file) formData.append('file', file);

            // Campaign configuration
            if (selectedCampaign && campaignIdStrategy === 'single') {
                formData.append('campaignId', selectedCampaign.id);
            }
            formData.append('campaignIdStrategy', campaignIdStrategy);
            if (csvCampaignColumn) formData.append('csvCampaignColumn', csvCampaignColumn);

            // Lead ID configuration
            formData.append('leadIdStrategy', leadIdStrategy);
            formData.append('leadIdPrefix', leadIdPrefix);
            formData.append('leadIdStartNumber', String(leadIdStartNumber));
            formData.append('fixedLeadId', fixedLeadId);
            formData.append('leadIdPattern', leadIdPattern);

            formData.append('mappings', JSON.stringify(mappings));
            formData.append('normOptions', JSON.stringify(normOptions));
            formData.append('dupStrategy', dupStrategy);

            const response = await fetch(`${API_URL}/leads/import`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Import failed');
            }

            const result = await response.json();
            console.log('Import result:', result);
            
            onComplete?.();
            navigate('/leads');
        } catch (error) {
            console.error('Import error:', error);
        } finally {
            setIsImporting(false);
        }
    };

    const canProceed = () => {
        if (currentStep === 0) {
            // Validate Lead ID configuration
            if (leadIdStrategy === 'fixed' && !fixedLeadId.trim()) return false;
            if (leadIdStrategy === 'pattern' && !leadIdPattern.trim()) return false;

            // Validate Campaign ID configuration
            if (campaignIdStrategy === 'single' && !selectedCampaign) return false;
            if (campaignIdStrategy === 'csv' && !csvCampaignColumn.trim()) return false;

            return true;
        }
        if (currentStep === 1) return file !== null;
        return true;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <StepIndicator steps={STEPS} currentStep={currentStep} />

            <div className="min-h-[400px] mt-8 bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl">
                {/* Step 0: Configuration */}
                {currentStep === 0 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="p-4 bg-accent/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                <Briefcase size={40} className="text-accent" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Configuración de Importación</h2>
                            <p className="text-gray-400 mt-2">Configura cómo se generarán los IDs y se asignarán las campañas</p>
                        </div>

                        {/* Lead ID Configuration */}
                        <div className="bg-background border border-white/10 rounded-xl p-6">
                            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                <Upload size={18} className="text-cyan-400" />
                                Configuración de Lead ID
                            </h3>

                            <div className="space-y-4">
                                {/* Strategy Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Estrategia de generación:</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setLeadIdStrategy('auto')}
                                            className={`p-3 rounded-lg border text-left transition-all ${
                                                leadIdStrategy === 'auto'
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                                    : 'bg-gray-900 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            <div className="font-medium text-sm">Auto-incrementar</div>
                                            <div className="text-xs mt-1 opacity-70">LEAD-001, LEAD-002...</div>
                                        </button>

                                        <button
                                            onClick={() => setLeadIdStrategy('csv')}
                                            className={`p-3 rounded-lg border text-left transition-all ${
                                                leadIdStrategy === 'csv'
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                                    : 'bg-gray-900 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            <div className="font-medium text-sm">Desde CSV</div>
                                            <div className="text-xs mt-1 opacity-70">Usar columna del archivo</div>
                                        </button>

                                        <button
                                            onClick={() => setLeadIdStrategy('fixed')}
                                            className={`p-3 rounded-lg border text-left transition-all ${
                                                leadIdStrategy === 'fixed'
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                                    : 'bg-gray-900 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            <div className="font-medium text-sm">ID Fijo</div>
                                            <div className="text-xs mt-1 opacity-70">Mismo para todos</div>
                                        </button>

                                        <button
                                            onClick={() => setLeadIdStrategy('pattern')}
                                            className={`p-3 rounded-lg border text-left transition-all ${
                                                leadIdStrategy === 'pattern'
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                                    : 'bg-gray-900 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            <div className="font-medium text-sm">Patrón personalizado</div>
                                            <div className="text-xs mt-1 opacity-70">Define tu formato</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Auto-increment Configuration */}
                                {leadIdStrategy === 'auto' && (
                                    <div className="space-y-3 p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-2">Prefijo:</label>
                                            <input
                                                type="text"
                                                value={leadIdPrefix}
                                                onChange={(e) => setLeadIdPrefix(e.target.value)}
                                                placeholder="LEAD-"
                                                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-2">Número inicial:</label>
                                            <input
                                                type="number"
                                                value={leadIdStartNumber}
                                                onChange={(e) => setLeadIdStartNumber(Number(e.target.value))}
                                                min="1"
                                                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                        <div className="text-xs text-cyan-400 font-mono mt-2">
                                            Ejemplo: {leadIdPrefix}{String(leadIdStartNumber).padStart(3, '0')}
                                        </div>
                                    </div>
                                )}

                                {/* CSV Configuration */}
                                {leadIdStrategy === 'csv' && (
                                    <div className="p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                                        <p className="text-sm text-gray-400 mb-2">
                                            Se utilizará la columna "LeadNumber" del archivo CSV
                                        </p>
                                        <div className="text-xs text-cyan-400">
                                            ✓ Los IDs deben ser únicos en el archivo
                                        </div>
                                    </div>
                                )}

                                {/* Fixed ID Configuration */}
                                {leadIdStrategy === 'fixed' && (
                                    <div className="space-y-3 p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-2">Lead ID fijo:</label>
                                            <input
                                                type="text"
                                                value={fixedLeadId}
                                                onChange={(e) => setFixedLeadId(e.target.value)}
                                                placeholder="BULK-IMPORT-2024"
                                                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                        <div className="text-xs text-yellow-400">
                                            ⚠️ Todos los leads tendrán el mismo ID
                                        </div>
                                    </div>
                                )}

                                {/* Pattern Configuration */}
                                {leadIdStrategy === 'pattern' && (
                                    <div className="space-y-3 p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-2">Patrón (usa variables):</label>
                                            <input
                                                type="text"
                                                value={leadIdPattern}
                                                onChange={(e) => setLeadIdPattern(e.target.value)}
                                                placeholder="{prefix}{date}-{number}"
                                                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Variables disponibles: <span className="text-cyan-400">{'{prefix}'}</span>, <span className="text-cyan-400">{'{date}'}</span>, <span className="text-cyan-400">{'{number}'}</span>, <span className="text-cyan-400">{'{campaign}'}</span>
                                        </div>
                                        <div className="text-xs text-cyan-400 font-mono">
                                            Ejemplo: LEAD-20240205-001
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Campaign ID Configuration */}
                        <div className="bg-background border border-white/10 rounded-xl p-6">
                            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                <Briefcase size={18} className="text-purple-400" />
                                Configuración de Campaign ID
                            </h3>

                            <div className="space-y-4">
                                {/* Strategy Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Estrategia de asignación:</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setCampaignIdStrategy('single')}
                                            className={`p-3 rounded-lg border text-left transition-all ${
                                                campaignIdStrategy === 'single'
                                                    ? 'bg-purple-500/20 border-purple-500 text-white'
                                                    : 'bg-gray-900 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            <div className="font-medium text-sm">Campaña única</div>
                                            <div className="text-xs mt-1 opacity-70">Todos a una campaña</div>
                                        </button>

                                        <button
                                            onClick={() => setCampaignIdStrategy('csv')}
                                            className={`p-3 rounded-lg border text-left transition-all ${
                                                campaignIdStrategy === 'csv'
                                                    ? 'bg-purple-500/20 border-purple-500 text-white'
                                                    : 'bg-gray-900 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            <div className="font-medium text-sm">Desde CSV</div>
                                            <div className="text-xs mt-1 opacity-70">Por columna</div>
                                        </button>

                                        <button
                                            onClick={() => setCampaignIdStrategy('none')}
                                            className={`p-3 rounded-lg border text-left transition-all ${
                                                campaignIdStrategy === 'none'
                                                    ? 'bg-purple-500/20 border-purple-500 text-white'
                                                    : 'bg-gray-900 border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            <div className="font-medium text-sm">Sin asignar</div>
                                            <div className="text-xs mt-1 opacity-70">Manual después</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Single Campaign Selection */}
                                {campaignIdStrategy === 'single' && (
                                    <div className="space-y-3">
                                        {isLoadingCampaigns ? (
                                            <div className="text-center py-4 text-gray-400 text-sm">
                                                Cargando campañas...
                                            </div>
                                        ) : campaigns.length === 0 ? (
                                            <div className="text-center py-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                                                <p className="text-gray-400 text-sm mb-3">No hay campañas disponibles</p>
                                                <Button onClick={() => navigate('/dashboard')}>
                                                    Crear campaña
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="grid gap-2 max-h-60 overflow-y-auto">
                                                {campaigns.map(campaign => (
                                                    <button
                                                        key={campaign.id}
                                                        onClick={() => setSelectedCampaign(campaign)}
                                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                                            selectedCampaign?.id === campaign.id
                                                                ? 'bg-purple-500/20 border-purple-500'
                                                                : 'bg-gray-900 border-white/10 hover:border-white/30'
                                                        }`}
                                                    >
                                                        <div className="text-left">
                                                            <p className="font-medium text-white text-sm">{campaign.name}</p>
                                                            <p className="text-xs text-gray-400">
                                                                {campaign.leadCount} leads
                                                            </p>
                                                        </div>
                                                        {selectedCampaign?.id === campaign.id && (
                                                            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* CSV Column Configuration */}
                                {campaignIdStrategy === 'csv' && (
                                    <div className="space-y-3 p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-2">Nombre de la columna en el CSV:</label>
                                            <input
                                                type="text"
                                                value={csvCampaignColumn}
                                                onChange={(e) => setCsvCampaignColumn(e.target.value)}
                                                placeholder="campaign_id"
                                                className="w-full px-3 py-2 bg-background border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                                            />
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            El CSV debe contener una columna con los IDs de campaña para cada lead
                                        </div>
                                    </div>
                                )}

                                {/* No Campaign Warning */}
                                {campaignIdStrategy === 'none' && (
                                    <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                                        <p className="text-yellow-400 text-sm">
                                            <strong>⚠️ Nota:</strong> Los leads se importarán sin asignar a ninguna campaña. Podrás asignarlos manualmente más tarde desde el dashboard.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1: Upload */}
                {currentStep === 1 && (
                    <FileUploader onFileSelect={async (f, rows, headers) => {
                        setFile(f);
                        setTotalRows(rows);
                        
                        // Parse headers and generate auto-mappings
                        setFileHeaders(headers);
                        const autoMappings = generateAutoMappings(headers);
                        setMappings(autoMappings);
                        
                        handleNext();
                    }} />
                )}

                {/* Step 2: Map */}
                {currentStep === 2 && (
                    <ColumnMapper
                        headers={fileHeaders.length > 0 ? fileHeaders : ['First Name', 'Last Name', 'Email', 'Company', 'Phone']}
                        mappings={mappings}
                        onMappingChange={(header, field) => setMappings(prev => ({ ...prev, [header]: field }))}
                    />
                )}

                {/* Step 3: Format */}
                {currentStep === 3 && (
                    <NormalizationOptions options={normOptions} onChange={(k, v) => setNormOptions(p => ({ ...p, [k]: v }))} />
                )}

                {/* Step 4: Duplicates */}
                {currentStep === 4 && (
                    <DuplicateResolver strategy={dupStrategy} onChange={setDupStrategy} />
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                    <div className="space-y-6">
                        <ImportSummary
                            stats={{
                                totalRows,
                                mappedFields: Object.keys(mappings).length,
                                estimatedTime: `${Math.ceil(totalRows / 100)}s`,
                                campaign: campaignIdStrategy === 'single' ? selectedCampaign?.name :
                                         campaignIdStrategy === 'csv' ? 'Desde CSV' : 'Sin asignar'
                            }}
                            isLoading={isImporting}
                        />

                        {/* Configuration Summary */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Lead ID Configuration Summary */}
                            <div className="bg-background border border-white/10 rounded-xl p-6">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <Upload size={16} className="text-cyan-400" />
                                    Lead ID
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-gray-400">Estrategia:</span>
                                        <span className="font-medium text-cyan-400 text-right">
                                            {leadIdStrategy === 'auto' ? 'Auto-incrementar' :
                                             leadIdStrategy === 'csv' ? 'Desde CSV' :
                                             leadIdStrategy === 'fixed' ? 'ID Fijo' :
                                             'Patrón personalizado'}
                                        </span>
                                    </div>

                                    {leadIdStrategy === 'auto' && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Prefijo:</span>
                                                <span className="font-mono text-white">{leadIdPrefix}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Inicia en:</span>
                                                <span className="font-mono text-white">{leadIdStartNumber}</span>
                                            </div>
                                            <div className="pt-2 border-t border-white/10">
                                                <span className="text-xs text-gray-500">Ejemplo:</span>
                                                <span className="font-mono text-cyan-400 text-xs ml-2">
                                                    {leadIdPrefix}{String(leadIdStartNumber).padStart(3, '0')}
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {leadIdStrategy === 'fixed' && (
                                        <div className="pt-2 border-t border-white/10">
                                            <span className="text-xs text-gray-500">ID Fijo:</span>
                                            <div className="font-mono text-cyan-400 text-sm mt-1">
                                                {fixedLeadId}
                                            </div>
                                        </div>
                                    )}

                                    {leadIdStrategy === 'pattern' && (
                                        <div className="pt-2 border-t border-white/10">
                                            <span className="text-xs text-gray-500">Patrón:</span>
                                            <div className="font-mono text-cyan-400 text-sm mt-1">
                                                {leadIdPattern}
                                            </div>
                                        </div>
                                    )}

                                    {leadIdStrategy === 'csv' && (
                                        <div className="pt-2 border-t border-white/10 text-xs text-gray-400">
                                            Se usará la columna "LeadNumber" del CSV
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Campaign ID Configuration Summary */}
                            <div className="bg-background border border-white/10 rounded-xl p-6">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <Briefcase size={16} className="text-purple-400" />
                                    Campaign ID
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-gray-400">Estrategia:</span>
                                        <span className="font-medium text-purple-400 text-right">
                                            {campaignIdStrategy === 'single' ? 'Campaña única' :
                                             campaignIdStrategy === 'csv' ? 'Desde CSV' :
                                             'Sin asignar'}
                                        </span>
                                    </div>

                                    {campaignIdStrategy === 'single' && selectedCampaign && (
                                        <div className="pt-2 border-t border-white/10">
                                            <span className="text-xs text-gray-500">Campaña:</span>
                                            <div className="text-purple-400 font-medium mt-1">
                                                {selectedCampaign.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {selectedCampaign.leadCount} leads actuales
                                            </div>
                                        </div>
                                    )}

                                    {campaignIdStrategy === 'csv' && (
                                        <div className="pt-2 border-t border-white/10">
                                            <span className="text-xs text-gray-500">Columna CSV:</span>
                                            <div className="font-mono text-purple-400 text-sm mt-1">
                                                {csvCampaignColumn}
                                            </div>
                                        </div>
                                    )}

                                    {campaignIdStrategy === 'none' && (
                                        <div className="pt-2 border-t border-white/10 text-xs text-yellow-400">
                                            ⚠️ Leads sin asignar a campaña
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Import Details */}
                        <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 rounded-xl p-6">
                            <h3 className="text-white font-medium mb-3">Resumen de Importación</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-400 text-xs">Total Filas</div>
                                    <div className="text-white font-bold text-lg mt-1">{totalRows}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Campos Mapeados</div>
                                    <div className="text-white font-bold text-lg mt-1">{Object.keys(mappings).length}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Duplicados</div>
                                    <div className="text-white font-bold text-lg mt-1 capitalize">{dupStrategy}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">Tiempo Est.</div>
                                    <div className="text-white font-bold text-lg mt-1">{Math.ceil(totalRows / 100)}s</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Footer */}
                {currentStep >= 0 && !isImporting && (
                    <div className="flex justify-between mt-12 pt-6 border-t border-white/10">
                        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
                            <ArrowLeft size={16} className="mr-2" /> Back
                        </Button>
                        <Button onClick={handleNext} disabled={!canProceed()}>
                            {currentStep === STEPS.length - 1 ? (
                                <>Start Import <Upload size={16} className="ml-2" /></>
                            ) : (
                                <>Next Step <ArrowRight size={16} className="ml-2" /></>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

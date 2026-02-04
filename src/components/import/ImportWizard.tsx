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
            if (selectedCampaign) formData.append('campaignId', selectedCampaign.id);
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
        if (currentStep === 0) return selectedCampaign !== null;
        if (currentStep === 1) return file !== null;
        return true;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <StepIndicator steps={STEPS} currentStep={currentStep} />

            <div className="min-h-[400px] mt-8 bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl">
                {/* Step 0: Select Campaign */}
                {currentStep === 0 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="p-4 bg-accent/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                <Briefcase size={40} className="text-accent" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Select Campaign</h2>
                            <p className="text-gray-400 mt-2">Choose which campaign to import leads into</p>
                        </div>

                        {isLoadingCampaigns ? (
                            <div className="text-center py-8 text-gray-400">
                                Loading campaigns...
                            </div>
                        ) : campaigns.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400 mb-4">No campaigns yet</p>
                                <Button onClick={() => navigate('/dashboard')}>
                                    Go to Dashboard to create a campaign
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-3 max-h-80 overflow-y-auto">
                                {campaigns.map(campaign => (
                                    <button
                                        key={campaign.id}
                                        onClick={() => setSelectedCampaign(campaign)}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                            selectedCampaign?.id === campaign.id
                                                ? 'bg-accent/20 border-accent'
                                                : 'bg-background border-white/10 hover:border-white/30'
                                        }`}
                                    >
                                        <div className="text-left">
                                            <p className="font-medium text-white">{campaign.name}</p>
                                            <p className="text-sm text-gray-400">
                                                {campaign.leadCount} leads currently
                                            </p>
                                        </div>
                                        {selectedCampaign?.id === campaign.id && (
                                            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
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
                    <ImportSummary 
                        stats={{ 
                            totalRows, 
                            mappedFields: Object.keys(mappings).length, 
                            estimatedTime: `${Math.ceil(totalRows / 100)}s`,
                            campaign: selectedCampaign?.name
                        }} 
                        isLoading={isImporting} 
                    />
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

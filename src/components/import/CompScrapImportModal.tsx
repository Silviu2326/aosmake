import React, { useState, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

// CompScrap fields - includes all fields from Box1 flow
export const COMPSCRAP_FIELDS = [
    // Required for matching
    { value: 'leadNumber', label: 'Lead Number', required: true, category: 'Matching' },
    { value: 'targetId', label: 'Target ID', required: false, category: 'Matching' },
    { value: 'lead_number', label: 'Lead Number (alt)', required: false, category: 'Matching' },
    
    // Person info
    { value: 'firstName', label: 'First Name', required: false, category: 'Person' },
    { value: 'lastName', label: 'Last Name', required: false, category: 'Person' },
    { value: 'personTitle', label: 'Person Title', required: false, category: 'Person' },
    { value: 'personTitleDescription', label: 'Person Title Description', required: false, category: 'Person' },
    { value: 'personSummary', label: 'Person Summary', required: false, category: 'Person' },
    { value: 'personLocation', label: 'Person Location', required: false, category: 'Person' },
    { value: 'durationInRole', label: 'Duration In Role', required: false, category: 'Person' },
    { value: 'durationInCompany', label: 'Duration In Company', required: false, category: 'Person' },
    { value: 'personTimestamp', label: 'Person Timestamp', required: false, category: 'Person' },
    { value: 'personLinkedinUrl', label: 'Person LinkedIn URL', required: false, category: 'Person' },
    { value: 'personSalesUrl', label: 'Person Sales URL', required: false, category: 'Person' },
    
    // Email info
    { value: 'email', label: 'Email', required: false, category: 'Email' },
    { value: 'email_validation', label: 'Email Validation', required: false, category: 'Email' },
    
    // Company identification
    { value: 'companyId', label: 'Company ID', required: false, category: 'Company Info' },
    { value: 'companyName', label: 'Company Name', required: false, category: 'Company Info' },
    { value: 'companyDescription', label: 'Company Description', required: false, category: 'Company Info' },
    { value: 'companyTagLine', label: 'Company Tag Line', required: false, category: 'Company Info' },
    { value: 'industry', label: 'Industry', required: false, category: 'Company Info' },
    { value: 'employeeCount', label: 'Employee Count', required: false, category: 'Company Info' },
    { value: 'companyLocation', label: 'Company Location', required: false, category: 'Company Info' },
    { value: 'website', label: 'Website', required: false, category: 'Company Info' },
    { value: 'domain', label: 'Domain', required: false, category: 'Company Info' },
    { value: 'yearFounded', label: 'Year Founded', required: false, category: 'Company Info' },
    { value: 'specialties', label: 'Specialties', required: false, category: 'Company Info' },
    { value: 'phone', label: 'Phone', required: false, category: 'Company Info' },
    
    // Financial data
    { value: 'currency', label: 'Currency', required: false, category: 'Financial' },
    { value: 'minRevenue', label: 'Min Revenue', required: false, category: 'Financial' },
    { value: 'maxRevenue', label: 'Max Revenue', required: false, category: 'Financial' },
    { value: 'growth6Mth', label: 'Growth 6 Month', required: false, category: 'Financial' },
    { value: 'growth1Yr', label: 'Growth 1 Year', required: false, category: 'Financial' },
    { value: 'growth2Yr', label: 'Growth 2 Year', required: false, category: 'Financial' },
    { value: 'companyTimestamp', label: 'Company Timestamp', required: false, category: 'Financial' },
    
    // URLs and links
    { value: 'linkedInCompanyUrl', label: 'LinkedIn Company URL', required: false, category: 'URLs' },
    { value: 'salesNavigatorCompanyUrl', label: 'Sales Navigator URL', required: false, category: 'URLs' },
    
    // Counts
    { value: 'decisionMakersCount', label: 'Decision Makers Count', required: false, category: 'Counts' },
    { value: 'noteCount', label: 'Note Count', required: false, category: 'Counts' },
    
    // Headcount by department (all variations)
    { value: 'headcountBusinessDevelopment', label: 'Headcount Business Development', required: false, category: 'Headcount' },
    { value: 'headcountBusinessDevelopmentGrowth1Yr', label: 'Headcount BD Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountOperations', label: 'Headcount Operations', required: false, category: 'Headcount' },
    { value: 'headcountOperationsGrowth1Yr', label: 'Headcount Operations Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountAdministrative', label: 'Headcount Administrative', required: false, category: 'Headcount' },
    { value: 'headcountAdministrativeGrowth1Yr', label: 'Headcount Administrative Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountResearch', label: 'Headcount Research', required: false, category: 'Headcount' },
    { value: 'headcountResearchGrowth1Yr', label: 'Headcount Research Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountHealthcareServices', label: 'Headcount Healthcare Services', required: false, category: 'Headcount' },
    { value: 'headcountHealthcareServicesGrowth1Yr', label: 'Headcount Healthcare Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountHumanResources', label: 'Headcount Human Resources', required: false, category: 'Headcount' },
    { value: 'headcountHumanResourcesGrowth1Yr', label: 'Headcount HR Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountConsulting', label: 'Headcount Consulting', required: false, category: 'Headcount' },
    { value: 'headcountConsultingGrowth1Yr', label: 'Headcount Consulting Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountSales', label: 'Headcount Sales', required: false, category: 'Headcount' },
    { value: 'headcountSalesGrowth1Yr', label: 'Headcount Sales Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountMarketing', label: 'Headcount Marketing', required: false, category: 'Headcount' },
    { value: 'headcountMarketingGrowth1Yr', label: 'Headcount Marketing Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountMediaAndCommunication', label: 'Headcount Media & Communication', required: false, category: 'Headcount' },
    { value: 'headcountMediaAndCommunicationGrowth1Yr', label: 'Headcount Media Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountInformationTechnology', label: 'Headcount IT', required: false, category: 'Headcount' },
    { value: 'headcountInformationTechnologyGrowth1Yr', label: 'Headcount IT Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountFinance', label: 'Headcount Finance', required: false, category: 'Headcount' },
    { value: 'headcountFinanceGrowth1Yr', label: 'Headcount Finance Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountProgramAndProjectManagement', label: 'Headcount Program & Project Mgmt', required: false, category: 'Headcount' },
    { value: 'headcountProgramAndProjectManagementGrowth1Yr', label: 'Headcount ProgMgmt Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountEducation', label: 'Headcount Education', required: false, category: 'Headcount' },
    { value: 'headcountEducationGrowth1Yr', label: 'Headcount Education Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountEngineering', label: 'Headcount Engineering', required: false, category: 'Headcount' },
    { value: 'headcountEngineeringGrowth1Yr', label: 'Headcount Engineering Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountAccounting', label: 'Headcount Accounting', required: false, category: 'Headcount' },
    { value: 'headcountAccountingGrowth1Yr', label: 'Headcount Accounting Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountCustomerSuccessAndSupport', label: 'Headcount Customer Success', required: false, category: 'Headcount' },
    { value: 'headcountCustomerSuccessAndSupportGrowth1Yr', label: 'Headcount CS Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountCommunityAndSocialServices', label: 'Headcount Community & Social', required: false, category: 'Headcount' },
    { value: 'headcountCommunityAndSocialServicesGrowth1Yr', label: 'Headcount Community Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountLegal', label: 'Headcount Legal', required: false, category: 'Headcount' },
    { value: 'headcountLegalGrowth1Yr', label: 'Headcount Legal Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountRealEstate', label: 'Headcount Real Estate', required: false, category: 'Headcount' },
    { value: 'headcountRealEstateGrowth1Yr', label: 'Headcount Real Estate Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountEntrepreneurship', label: 'Headcount Entrepreneurship', required: false, category: 'Headcount' },
    { value: 'headcountEntrepreneurshipGrowth1Yr', label: 'Headcount Entrepreneurship Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountArtsAndDesign', label: 'Headcount Arts & Design', required: false, category: 'Headcount' },
    { value: 'headcountArtsAndDesignGrowth1Yr', label: 'Headcount Arts Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountMilitaryAndProtectiveServices', label: 'Headcount Military & Protective', required: false, category: 'Headcount' },
    { value: 'headcountMilitaryAndProtectiveServicesGrowth1Yr', label: 'Headcount Military Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountQualityAssurance', label: 'Headcount Quality Assurance', required: false, category: 'Headcount' },
    { value: 'headcountQualityAssuranceGrowth1Yr', label: 'Headcount QA Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountPurchasing', label: 'Headcount Purchasing', required: false, category: 'Headcount' },
    { value: 'headcountPurchasingGrowth1Yr', label: 'Headcount Purchasing Growth 1Yr', required: false, category: 'Headcount' },
    { value: 'headcountProductManagement', label: 'Headcount Product Management', required: false, category: 'Headcount' },
    { value: 'headcountProductManagementGrowth1Yr', label: 'Headcount PM Growth 1Yr', required: false, category: 'Headcount' },
];

interface CompScrapImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete?: () => void;
}

export function CompScrapImportModal({ isOpen, onClose, onImportComplete }: CompScrapImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [isDragOver, setIsDragOver] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setHeaders([]);
            setMappings({});
        }
    }, [isOpen]);

    // Parse CSV headers
    async function parseCSVHeaders(file: File): Promise<string[]> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const lines = text.split('\n').filter(line => line.trim());
                if (lines.length > 0) {
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
            reader.readAsText(file.slice(0, 1024 * 1024));
        });
    }

    // Auto-generate mappings based on header names
    function autoGenerateMappings(headers: string[]): Record<string, string> {
        const newMappings: Record<string, string> = {};
        
        headers.forEach(header => {
            const normalizedHeader = header.toLowerCase().trim().replace(/\s+/g, '');
            
            // Check for exact or close matches
            for (const field of COMPSCRAP_FIELDS) {
                const normalizedField = field.label.toLowerCase().replace(/\s+/g, '');
                const fieldValue = field.value.toLowerCase().replace(/([A-Z])/g, '$1').replace(/([A-Z])/g, ' $1').toLowerCase();
                
                if (normalizedHeader === normalizedField || 
                    normalizedHeader === field.value.toLowerCase() ||
                    normalizedHeader === fieldValue.replace(/\s+/g, '') ||
                    normalizedHeader.includes(field.value.toLowerCase()) ||
                    field.value.toLowerCase().includes(normalizedHeader)) {
                    newMappings[header] = field.value;
                    break;
                }
            }
        });
        
        return newMappings;
    }

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        const headerList = await parseCSVHeaders(selectedFile);
        setHeaders(headerList);
        setMappings(autoGenerateMappings(headerList));
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
            handleFileSelect(droppedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleMappingChange = (header: string, field: string) => {
        setMappings(prev => ({ ...prev, [header]: field }));
    };

    const handleImport = async () => {
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mappings', JSON.stringify(mappings));
        
        try {
            const response = await fetch('https://backendaos-production.up.railway.app/api/leads/import-compscrape-mapped', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                onImportComplete?.();
                onClose();
            } else {
                console.error('Import failed');
            }
        } catch (error) {
            console.error('Error importing:', error);
        }
    };

    // Group fields by category
    const fieldsByCategory = COMPSCRAP_FIELDS.reduce((acc, field) => {
        if (!acc[field.category]) acc[field.category] = [];
        acc[field.category].push(field);
        return acc;
    }, {} as Record<string, typeof COMPSCRAP_FIELDS>);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Import CompScrap Output</h2>
                        <p className="text-sm text-gray-400 mt-1">Map CSV columns to lead fields</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {!file ? (
                        // File upload area
                        <div
                            className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                                isDragOver 
                                    ? 'border-accent bg-accent/10' 
                                    : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => document.getElementById('compscrap-file-input')?.click()}
                        >
                            <div className="w-16 h-16 rounded-full bg-surfaceHighlight flex items-center justify-center mb-6 text-accent">
                                <FileSpreadsheet size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Upload CompScrap CSV</h3>
                            <p className="text-gray-400 text-sm mb-6 max-w-sm">
                                Drag and drop your file here, or click to browse
                            </p>
                            <input
                                type="file"
                                id="compscrap-file-input"
                                className="hidden"
                                accept=".csv"
                                onChange={handleChange}
                            />
                            <Button variant="secondary">Browse Files</Button>
                        </div>
                    ) : (
                        // Mapping interface
                        <div className="space-y-6">
                            {/* File info */}
                            <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                                <FileSpreadsheet className="text-accent" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-white">{file.name}</p>
                                    <p className="text-xs text-gray-400">{headers.length} columns detected</p>
                                </div>
                                <button 
                                    onClick={() => { setFile(null); setHeaders([]); setMappings({}); }}
                                    className="ml-auto text-xs text-gray-400 hover:text-white underline"
                                >
                                    Change file
                                </button>
                            </div>

                            {/* Mapping table */}
                            <div className="border border-white/10 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-3 bg-surfaceHighlight p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    <div>CSV Header</div>
                                    <div className="pl-4">Map to Field</div>
                                    <div className="text-center">Status</div>
                                </div>

                                <div className="bg-surface divide-y divide-white/5 max-h-96 overflow-y-auto">
                                    {headers.map(header => {
                                        const mappedField = mappings[header];
                                        const isMapped = !!mappedField;
                                        const mappedFieldInfo = COMPSCRAP_FIELDS.find(f => f.value === mappedField);

                                        return (
                                            <div key={header} className="grid grid-cols-3 p-4 items-center">
                                                <div className="text-sm font-medium text-white truncate pr-2" title={header}>
                                                    {header}
                                                </div>

                                                <div className="px-4">
                                                    <select
                                                        className="w-full bg-background border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
                                                        value={mappedField || ''}
                                                        onChange={(e) => handleMappingChange(header, e.target.value)}
                                                    >
                                                        <option value="">-- Skip --</option>
                                                        {Object.entries(fieldsByCategory).map(([category, fields]) => (
                                                            <React.Fragment key={category}>
                                                                <option disabled className="bg-surfaceHighlight text-gray-400 font-semibold text-xs">
                                                                    — {category} —
                                                                </option>
                                                                {fields.map(field => (
                                                                    <option key={field.value} value={field.value} className="pl-4 text-xs">
                                                                        {field.label}
                                                                    </option>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="flex justify-center">
                                                    {isMapped ? (
                                                        <span className="text-green-400 text-xs flex items-center gap-1">
                                                            ✓ {mappedFieldInfo?.category}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-600 text-xs">Skipped</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-400">
                                <span>Mapped: {Object.values(mappings).filter(Boolean).length} / {headers.length}</span>
                                <span className="text-orange-400 text-xs flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    'error' column detected at different positions - mapped separately
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-surfaceHighlight/30">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button 
                        onClick={handleImport} 
                        disabled={!file}
                        className={!file ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        <Upload size={16} className="mr-2" />
                        Import Data
                    </Button>
                </div>
            </div>
        </div>
    );
}

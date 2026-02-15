import React, { useState, useEffect } from 'react';
import { X, Settings, Table, FileText, GripVertical, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { getFieldConfig, getTableFields, saveTableFields, getPageFields, savePageFields, FieldConfig as DashboardFieldConfig } from '../../services/settingsApi';

export interface FieldConfig {
    id: string;
    label: string;
    visible: boolean;
}

interface CustomizeFieldsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveTableFields?: (fields: FieldConfig[]) => void;
    onSavePageFields?: (fields: FieldConfig[]) => void;
}

// Default fields for the table (fallback)
const defaultTableFields: FieldConfig[] = [
    { id: 'name', label: 'Name', visible: true },
    { id: 'company', label: 'Company', visible: true },
    { id: 'email', label: 'Email', visible: true },
    { id: 'pipeline', label: 'Pipeline', visible: true },
    { id: 'source', label: 'Source', visible: true },
    { id: 'created', label: 'Created', visible: true },
];

// Default fields for the lead detail page (fallback)
const defaultPageFields: FieldConfig[] = [
    { id: 'email', label: 'Email', visible: true },
    { id: 'person_linkedin_url', label: 'LinkedIn Profile', visible: true },
    { id: 'phone', label: 'Phone', visible: true },
    { id: 'person_location', label: 'Location', visible: true },
    { id: 'person_title', label: 'Title', visible: true },
    { id: 'source', label: 'Source', visible: true },
    { id: 'company', label: 'Company Name', visible: true },
    { id: 'company_website', label: 'Company Website', visible: true },
    { id: 'company_linkedin_url', label: 'Company LinkedIn', visible: true },
    { id: 'company_sales_url', label: 'Company Sales Page', visible: true },
    { id: 'company_size', label: 'Company Size', visible: true },
    { id: 'company_industry', label: 'Company Industry', visible: true },
];

export const CustomizeFieldsModal: React.FC<CustomizeFieldsModalProps> = ({
    isOpen,
    onClose,
    onSaveTableFields,
    onSavePageFields,
}) => {
    const [activeTab, setActiveTab] = useState<'table' | 'page'>('table');
    const [availableFields, setAvailableFields] = useState<DashboardFieldConfig[]>([]);
    const [tableFields, setTableFields] = useState<FieldConfig[]>(defaultTableFields);
    const [pageFields, setPageFields] = useState<FieldConfig[]>(defaultPageFields);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load available fields from field_config and current selections
    useEffect(() => {
        if (isOpen) {
            loadFields();
        }
    }, [isOpen]);

    const loadFields = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Load available fields from dashboard field_config
            const dashboardFields = await getFieldConfig();
            
            // Show ALL fields from dashboard config (including locked and hidden)
            // These are the "master" fields the user has configured
            setAvailableFields(dashboardFields);

            // Load current table fields configuration
            try {
                const savedTableFields = await getTableFields();
                if (savedTableFields.length > 0) {
                    setTableFields(savedTableFields.map(f => ({ id: f.id, label: f.label, visible: f.visible })));
                } else if (dashboardFields.length > 0) {
                    // If no saved config but available fields exist, create from available
                    // By default, only show fields that are visible in dashboard
                    setTableFields(dashboardFields.map(f => ({ id: f.id, label: f.label, visible: f.visible })));
                }
            } catch (e) {
                console.log('No saved table fields, using defaults or available fields');
                if (dashboardFields.length > 0) {
                    setTableFields(dashboardFields.map(f => ({ id: f.id, label: f.label, visible: f.visible })));
                }
            }

            // Load current page fields configuration
            try {
                const savedPageFields = await getPageFields();
                
                // Build complete list: defaults + dashboard custom fields
                const completeDefaultFields = [...defaultPageFields];
                
                // Add any custom fields from dashboard that aren't in defaults
                dashboardFields.forEach(df => {
                    if (!completeDefaultFields.some(f => f.id === df.id)) {
                        completeDefaultFields.push({
                            id: df.id,
                            label: df.label,
                            visible: df.visible
                        });
                    }
                });
                
                if (savedPageFields.length > 0) {
                    // Merge saved config with available fields
                    const merged = completeDefaultFields.map(defaultField => {
                        const saved = savedPageFields.find(f => f.id === defaultField.id);
                        return {
                            ...defaultField,
                            visible: saved ? saved.visible : defaultField.visible
                        };
                    });
                    // Add any additional saved fields not in defaults
                    const additionalFields = savedPageFields.filter(
                        saved => !completeDefaultFields.some(def => def.id === saved.id)
                    );
                    setPageFields([...merged, ...additionalFields]);
                } else {
                    // Use defaults merged with dashboard fields
                    setPageFields(completeDefaultFields);
                }
            } catch (e) {
                console.log('No saved page fields, using defaults + dashboard fields');
                // Build complete list: defaults + dashboard custom fields
                const completeDefaultFields = [...defaultPageFields];
                dashboardFields.forEach(df => {
                    if (!completeDefaultFields.some(f => f.id === df.id)) {
                        completeDefaultFields.push({
                            id: df.id,
                            label: df.label,
                            visible: df.visible
                        });
                    }
                });
                setPageFields(completeDefaultFields);
            }
        } catch (err) {
            console.error('Error loading fields:', err);
            setError('Error al cargar los campos. Usando valores por defecto.');
            // Use defaults on error
            setAvailableFields([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Merge available fields with current selections
    const getMergedFields = (): FieldConfig[] => {
        if (activeTab === 'table') {
            // If we have dashboard fields, use those as base
            if (availableFields.length > 0) {
                return availableFields.map(available => {
                    const existing = tableFields.find(f => f.id === available.id);
                    return {
                        id: available.id,
                        label: available.label,
                        visible: existing ? existing.visible : available.visible
                    };
                });
            }
            return tableFields;
        } else {
            return pageFields;
        }
    };

    const handleToggleField = (fieldId: string) => {
        if (activeTab === 'table') {
            const merged = getMergedFields();
            const updated = merged.map(f => 
                f.id === fieldId ? { ...f, visible: !f.visible } : f
            );
            setTableFields(updated);
        } else {
            setPageFields(prev => prev.map(f => 
                f.id === fieldId ? { ...f, visible: !f.visible } : f
            ));
        }
    };

    const handleSave = async () => {
        const merged = getMergedFields();
        
        try {
            if (activeTab === 'table') {
                await saveTableFields(merged);
                onSaveTableFields?.(merged);
            } else {
                await savePageFields(pageFields);
                onSavePageFields?.(pageFields);
            }
            onClose();
        } catch (err) {
            console.error('Error saving fields:', err);
            setError('Error al guardar los cambios');
        }
    };

    const handleRestoreDefaults = () => {
        if (activeTab === 'table') {
            if (availableFields.length > 0) {
                // Restore to dashboard field visibility state
                setTableFields(availableFields.map(f => ({ id: f.id, label: f.label, visible: f.visible })));
            } else {
                setTableFields(defaultTableFields);
            }
        } else {
            setPageFields(defaultPageFields);
        }
    };

    const currentFields = getMergedFields();
    const visibleCount = currentFields.filter(f => f.visible).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-surface border border-white/10 rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Settings size={18} className="text-accent" />
                        <h2 className="text-lg font-semibold text-white">Customizar Campos</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('table')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'table'
                                ? 'text-accent border-b-2 border-accent bg-accent/5'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                    >
                        <Table size={16} />
                        Campos de Tabla
                    </button>
                    <button
                        onClick={() => setActiveTab('page')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'page'
                                ? 'text-accent border-b-2 border-accent bg-accent/5'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                    >
                        <FileText size={16} />
                        Campos de Página
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={24} className="text-accent animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-yellow-400 text-sm">{error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-400 text-sm">
                                    {activeTab === 'table' 
                                        ? 'Selecciona qué columnas mostrar en la tabla de leads'
                                        : 'Selecciona qué campos mostrar en la página de detalle del lead'
                                    }
                                </p>
                                <span className="text-xs text-gray-500">
                                    {visibleCount}/{currentFields.length} visibles
                                </span>
                            </div>

                            {activeTab === 'table' && availableFields.length > 0 && (
                                <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                                    ℹ️ Mostrando {availableFields.length} campos de la configuración del dashboard
                                </div>
                            )}

                            <div className="space-y-2">
                                {activeTab === 'table' && (
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                                        Columnas de la Tabla
                                    </div>
                                )}
                                
                                {activeTab === 'page' && (
                                    <>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                                            Información Personal
                                        </div>
                                        {pageFields.filter(f => ['email', 'person_linkedin_url', 'phone', 'person_location', 'person_title', 'source'].includes(f.id)).map(field => (
                                            <FieldItem 
                                                key={field.id} 
                                                field={field} 
                                                onToggle={() => handleToggleField(field.id)} 
                                            />
                                        ))}
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mt-4 mb-3">
                                            Información de Empresa
                                        </div>
                                        {pageFields.filter(f => ['company', 'company_website', 'company_linkedin_url', 'company_sales_url', 'company_size', 'company_industry'].includes(f.id)).map(field => (
                                            <FieldItem 
                                                key={field.id} 
                                                field={field} 
                                                onToggle={() => handleToggleField(field.id)} 
                                            />
                                        ))}
                                        
                                        {/* Campos dinámicos del dashboard */}
                                        {pageFields.filter(f => !['email', 'person_linkedin_url', 'phone', 'person_location', 'person_title', 'source', 'company', 'company_website', 'company_linkedin_url', 'company_sales_url', 'company_size', 'company_industry'].includes(f.id)).length > 0 && (
                                            <>
                                                <div className="text-xs text-purple-400 uppercase tracking-wider mt-4 mb-3 flex items-center gap-2">
                                                    <Sparkles size={12} />
                                                    Campos Adicionales del Dashboard
                                                </div>
                                                {pageFields.filter(f => !['email', 'person_linkedin_url', 'phone', 'person_location', 'person_title', 'source', 'company', 'company_website', 'company_linkedin_url', 'company_sales_url', 'company_size', 'company_industry'].includes(f.id)).map(field => (
                                                    <FieldItem 
                                                        key={field.id} 
                                                        field={field} 
                                                        onToggle={() => handleToggleField(field.id)} 
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </>
                                )}
                                
                                {activeTab === 'table' && currentFields.map(field => (
                                    <FieldItem 
                                        key={field.id} 
                                        field={field} 
                                        onToggle={() => handleToggleField(field.id)} 
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center px-6 py-4 border-t border-white/10">
                    <button
                        onClick={handleRestoreDefaults}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        Restaurar defaults
                    </button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} size="sm">
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} size="sm" disabled={isLoading}>
                            Guardar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Field item component
interface FieldItemProps {
    field: FieldConfig;
    onToggle: () => void;
}

const FieldItem: React.FC<FieldItemProps> = ({ field, onToggle }) => {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-gray-600 group-hover:text-gray-400" />
                <span className="text-sm text-gray-200">{field.label}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={field.visible}
                    onChange={onToggle}
                    className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
            </label>
        </div>
    );
};

export default CustomizeFieldsModal;

import React from 'react';
import { Lead, FieldConfig } from '../../stores/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { FileText, AlertCircle } from 'lucide-react';

interface DynamicFieldsCardProps {
    lead: Lead;
    visibleFields?: FieldConfig[];
}

export function DynamicFieldsCard({ lead, visibleFields }: DynamicFieldsCardProps) {
    // Get standard field IDs that are already shown in IdentityCard/CompanyCard
    const standardFields = [
        'email', 'person_linkedin_url', 'phone', 'person_location', 
        'person_title', 'source', 'company', 'company_website', 
        'company_linkedin_url', 'company_sales_url', 'company_size', 
        'company_industry'
    ];

    // Filter to get only custom/dynamic fields that are visible
    const dynamicFields = visibleFields?.filter(field => {
        // Only include if it's visible and not a standard field
        if (!field.visible) return false;
        if (standardFields.includes(field.id)) return false;
        // Only include if the lead has data for this field
        return getFieldValue(lead, field.id) !== undefined && 
               getFieldValue(lead, field.id) !== null && 
               getFieldValue(lead, field.id) !== '';
    }) || [];

    if (dynamicFields.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <FileText size={14} />
                    Campos Adicionales
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {dynamicFields.map(field => {
                    const value = getFieldValue(lead, field.id);
                    const isJson = isJsonField(value);
                    
                    return (
                        <div key={field.id} className="space-y-2">
                            <div className="text-sm font-medium text-gray-300">
                                {field.label}
                                {field.custom && (
                                    <span className="ml-2 text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                                        Custom
                                    </span>
                                )}
                            </div>
                            
                            {isJson ? (
                                <JsonFieldViewer data={value} />
                            ) : (
                                <div className="text-sm text-gray-400 break-words">
                                    {formatValue(value)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

// Helper to get field value from lead (handles nested properties)
function getFieldValue(lead: Lead, fieldId: string): any {
    // Direct property access
    if (fieldId in lead) {
        return (lead as any)[fieldId];
    }
    
    // Try with underscore variations
    const variations = [
        fieldId,
        fieldId.replace(/_/g, ''),  // remove all underscores
        fieldId.replace(/([A-Z])/g, '_$1').toLowerCase(), // camelCase to snake_case
        fieldId.replace(/_([a-z])/g, (_, char) => char.toUpperCase()), // snake_case to camelCase
    ];
    
    for (const variant of variations) {
        if (variant in lead) {
            return (lead as any)[variant];
        }
    }
    
    // Check in step_status
    if (lead.stepStatus && fieldId in lead.stepStatus) {
        return (lead.stepStatus as any)[fieldId];
    }
    
    return undefined;
}

// Check if value is JSON (object or JSON string)
function isJsonField(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'object') return true;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return typeof parsed === 'object' && parsed !== null;
        } catch {
            return false;
        }
    }
    return false;
}

// Format simple value for display
function formatValue(value: any): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
}

// Component to display JSON data in a nice format
function JsonFieldViewer({ data }: { data: any }) {
    // Parse if it's a string
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
    // If it's a simple object with few keys, show inline
    const keys = Object.keys(parsedData);
    if (keys.length <= 3 && !keys.some(k => typeof parsedData[k] === 'object')) {
        return (
            <div className="text-sm text-gray-400 space-y-1">
                {keys.map(key => (
                    <div key={key} className="flex items-start gap-2">
                        <span className="text-gray-500 min-w-[100px]">{key}:</span>
                        <span className="text-gray-300">{formatJsonValue(parsedData[key])}</span>
                    </div>
                ))}
            </div>
        );
    }
    
    // For complex objects, show collapsible JSON
    return (
        <div className="bg-black/30 border border-white/10 rounded-lg overflow-hidden">
            <div className="max-h-48 overflow-auto p-3">
                <JsonTree data={parsedData} />
            </div>
            {keys.length > 5 && (
                <div className="px-3 py-1 bg-white/5 text-[10px] text-gray-500 text-center">
                    {keys.length} campos • scroll para ver más
                </div>
            )}
        </div>
    );
}

// Recursive JSON tree component
function JsonTree({ data, level = 0 }: { data: any; level?: number }) {
    if (data === null) return <span className="text-gray-500">null</span>;
    if (typeof data !== 'object') {
        return <span className={getValueColor(typeof data)}>{String(data)}</span>;
    }
    
    const isArray = Array.isArray(data);
    const entries = Object.entries(data);
    
    if (entries.length === 0) {
        return <span className="text-gray-500">{isArray ? '[]' : '{}'}</span>;
    }
    
    return (
        <div className={level > 0 ? 'ml-4' : ''}>
            {entries.map(([key, value], index) => (
                <div key={key} className="flex items-start gap-2 py-0.5">
                    <span className="text-purple-400/80 min-w-[100px] shrink-0">
                        {key}:
                    </span>
                    {typeof value === 'object' && value !== null ? (
                        <div className="flex-1">
                            <span className="text-gray-500 text-xs">
                                {Array.isArray(value) ? `[${value.length} items]` : `{${Object.keys(value).length} fields}`}
                            </span>
                            <JsonTree data={value} level={level + 1} />
                        </div>
                    ) : (
                        <span className={getValueColor(typeof value)}>
                            {formatJsonValue(value)}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

function formatJsonValue(value: any): string {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') {
        // Truncate long strings
        if (value.length > 100) {
            return value.substring(0, 100) + '...';
        }
        return value;
    }
    return String(value);
}

function getValueColor(type: string): string {
    switch (type) {
        case 'string': return 'text-green-400';
        case 'number': return 'text-blue-400';
        case 'boolean': return 'text-yellow-400';
        default: return 'text-gray-400';
    }
}

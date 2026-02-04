import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface ColumnMapperProps {
    headers: string[];
    mappings: Record<string, string>;
    onMappingChange: (header: string, field: string) => void;
}

export const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'company'];
export const AVAILABLE_FIELDS = [
    // Required fields
    { value: 'firstName', label: 'First Name', required: true, category: 'Basic' },
    { value: 'lastName', label: 'Last Name', required: true, category: 'Basic' },
    { value: 'email', label: 'Email Address', required: true, category: 'Basic' },
    { value: 'company', label: 'Company Name', required: true, category: 'Basic' },
    
    // Basic optional fields
    { value: 'linkedin', label: 'LinkedIn URL', required: false, category: 'Basic' },
    { value: 'jobTitle', label: 'Job Title', required: false, category: 'Basic' },
    { value: 'location', label: 'Location', required: false, category: 'Basic' },
    { value: 'phone', label: 'Phone', required: false, category: 'Basic' },
    
    // LinkedIn Profile fields (migration 006)
    { value: 'profileUrl', label: 'Profile URL', required: false, category: 'LinkedIn' },
    { value: 'fullName', label: 'Full Name', required: false, category: 'LinkedIn' },
    { value: 'name', label: 'Name', required: false, category: 'LinkedIn' },
    { value: 'companyId', label: 'Company ID', required: false, category: 'LinkedIn' },
    { value: 'companyUrl', label: 'Company URL', required: false, category: 'LinkedIn' },
    { value: 'regularCompanyUrl', label: 'Regular Company URL', required: false, category: 'LinkedIn' },
    { value: 'summary', label: 'Summary', required: false, category: 'LinkedIn' },
    { value: 'titleDescription', label: 'Title Description', required: false, category: 'LinkedIn' },
    { value: 'industry', label: 'Industry', required: false, category: 'LinkedIn' },
    { value: 'companyLocation', label: 'Company Location', required: false, category: 'LinkedIn' },
    { value: 'durationInRole', label: 'Duration in Role', required: false, category: 'LinkedIn' },
    { value: 'durationInCompany', label: 'Duration in Company', required: false, category: 'LinkedIn' },
    { value: 'pastExperienceCompanyName', label: 'Past Experience Company', required: false, category: 'LinkedIn' },
    { value: 'pastExperienceCompanyUrl', label: 'Past Experience Company URL', required: false, category: 'LinkedIn' },
    { value: 'pastExperienceCompanyTitle', label: 'Past Experience Title', required: false, category: 'LinkedIn' },
    { value: 'pastExperienceDate', label: 'Past Experience Date', required: false, category: 'LinkedIn' },
    { value: 'pastExperienceDuration', label: 'Past Experience Duration', required: false, category: 'LinkedIn' },
    { value: 'connectionDegree', label: 'Connection Degree', required: false, category: 'LinkedIn' },
    { value: 'profileImageUrl', label: 'Profile Image URL', required: false, category: 'LinkedIn' },
    { value: 'sharedConnectionsCount', label: 'Shared Connections Count', required: false, category: 'LinkedIn' },
    { value: 'vmid', label: 'VMID', required: false, category: 'LinkedIn' },
    { value: 'linkedinProfileUrl', label: 'LinkedIn Profile URL', required: false, category: 'LinkedIn' },
    { value: 'isPremium', label: 'Is Premium', required: false, category: 'LinkedIn' },
    { value: 'isOpenLink', label: 'Is OpenLink', required: false, category: 'LinkedIn' },
    { value: 'query', label: 'Query', required: false, category: 'LinkedIn' },
    { value: 'timestamp', label: 'Timestamp', required: false, category: 'LinkedIn' },
    { value: 'defaultProfileUrl', label: 'Default Profile URL', required: false, category: 'LinkedIn' },
    { value: 'searchAccountProfileId', label: 'Search Account Profile ID', required: false, category: 'LinkedIn' },
    { value: 'searchAccountProfileName', label: 'Search Account Profile Name', required: false, category: 'LinkedIn' },
];

export function ColumnMapper({ headers, mappings, onMappingChange }: ColumnMapperProps) {
    // Group fields by category
    const fieldsByCategory = AVAILABLE_FIELDS.reduce((acc, field) => {
        if (!acc[field.category]) acc[field.category] = [];
        acc[field.category].push(field);
        return acc;
    }, {} as Record<string, typeof AVAILABLE_FIELDS>);

    return (
        <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-200">
                    We've auto-matched some columns based on header names. Please review and confirm.
                </div>
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 bg-surfaceHighlight p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div>CSV Header</div>
                    <div className="pl-4">Map to Field</div>
                    <div className="text-center">Status</div>
                </div>

                <div className="bg-surface divide-y divide-white/5">
                    {headers.map(header => {
                        const mappedField = mappings[header];
                        const isMapped = !!mappedField;
                        const mappedFieldInfo = AVAILABLE_FIELDS.find(f => f.value === mappedField);

                        return (
                            <div key={header} className="grid grid-cols-3 p-4 items-center">
                                <div className="text-sm font-medium text-white">{header}</div>

                                <div className="px-4">
                                    <select
                                        className="w-full bg-background border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
                                        value={mappedField || ''}
                                        onChange={(e) => onMappingChange(header, e.target.value)}
                                    >
                                        <option value="">Do not import</option>
                                        {Object.entries(fieldsByCategory).map(([category, fields]) => (
                                            <React.Fragment key={category}>
                                                <option disabled className="bg-surfaceHighlight text-gray-400 font-semibold">
                                                    — {category} —
                                                </option>
                                                {fields.map(field => (
                                                    <option key={field.value} value={field.value} className="pl-4">
                                                        {field.label} {field.required ? '*' : ''}
                                                    </option>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-center">
                                    {isMapped ? (
                                        <div className="flex items-center text-green-400 text-xs gap-1">
                                            <Check size={12} /> 
                                            <span className="flex items-center gap-1">
                                                {mappedFieldInfo?.category === 'LinkedIn' && (
                                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                                )}
                                                Mapped
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-gray-600 text-xs">Ignored</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <span>LinkedIn fields</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-red-400">*</span>
                    <span>Required field</span>
                </div>
            </div>
        </div>
    );
}

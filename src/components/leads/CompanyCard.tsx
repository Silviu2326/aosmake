import React from 'react';
import { Lead, FieldConfig } from '../../stores/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Building2, Globe, Users, Briefcase } from 'lucide-react';

interface CompanyCardProps {
    lead: Lead;
    visibleFields?: FieldConfig[];
}

export function CompanyCard({ lead, visibleFields }: CompanyCardProps) {
    // Determine if a field is visible
    const isFieldVisible = (fieldId: string) => {
        if (!visibleFields) return true;
        const field = visibleFields.find(f => f.id === fieldId);
        return field?.visible ?? true;
    };

    // Check if any company fields are visible
    const hasVisibleFields = [
        'company', 'company_website', 'company_linkedin_url', 'company_sales_url', 'company_size', 'company_industry'
    ].some(id => isFieldVisible(id));

    // Si no hay company o no hay campos visibles, no mostrar la tarjeta
    if (!lead.company || !hasVisibleFields) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-gray-400">Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Company Name */}
                {isFieldVisible('company') && (
                    <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">Name</div>
                            <div className="text-sm text-white font-medium">{lead.company}</div>
                        </div>
                    </div>
                )}

                {/* Website - solo si existe */}
                {isFieldVisible('company_website') && lead.company_website && (
                    <div className="flex items-start gap-3">
                        <Globe className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">Website</div>
                            <a href={lead.company_website.startsWith('http') ? lead.company_website : `https://${lead.company_website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline block truncate">
                                {lead.company_website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </a>
                        </div>
                    </div>
                )}

                {/* LinkedIn URL - solo si existe */}
                {isFieldVisible('company_linkedin_url') && lead.company_linkedin_url && (
                    <div className="flex items-start gap-3">
                        <LinkedinIcon className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">LinkedIn</div>
                            <a href={lead.company_linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline block truncate">
                                {lead.company_linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/company\//, '')}
                            </a>
                        </div>
                    </div>
                )}

                {/* Sales URL - solo si existe */}
                {isFieldVisible('company_sales_url') && lead.company_sales_url && (
                    <div className="flex items-start gap-3">
                        <SalesIcon className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">Sales Page</div>
                            <a href={lead.company_sales_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline block truncate">
                                Ver página
                            </a>
                        </div>
                    </div>
                )}

                {/* Size - solo si existe */}
                {isFieldVisible('company_size') && lead.company_size && (
                    <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">Size</div>
                            <div className="text-sm text-gray-400">{lead.company_size}</div>
                        </div>
                    </div>
                )}

                {/* Industry - solo si existe */}
                {isFieldVisible('company_industry') && lead.company_industry && (
                    <div className="flex items-start gap-3">
                        <Briefcase className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">Industry</div>
                            <div className="text-sm text-gray-400">{lead.company_industry}</div>
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}

function LinkedinIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
    );
}

function SalesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    );
}

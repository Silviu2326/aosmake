import React from 'react';
import { Lead, FieldConfig } from '../../stores/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Mail, Linkedin, Phone, MapPin, Globe } from 'lucide-react';

interface IdentityCardProps {
    lead: Lead;
    visibleFields?: FieldConfig[];
}

export function IdentityCard({ lead, visibleFields }: IdentityCardProps) {
    // Determine if a field is visible
    const isFieldVisible = (fieldId: string) => {
        if (!visibleFields) return true;
        const field = visibleFields.find(f => f.id === fieldId);
        return field?.visible ?? true;
    };

    // Check if any identity fields are visible
    const hasVisibleFields = [
        'email', 'person_linkedin_url', 'phone', 'person_location', 'person_title', 'source'
    ].some(id => isFieldVisible(id));

    if (!hasVisibleFields) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-gray-400">Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Email */}
                {isFieldVisible('email') && (
                    <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">Email</div>
                            <a href={`mailto:${lead.email}`} className="text-sm text-accent hover:underline block break-all">
                                {lead.email}
                            </a>
                        </div>
                    </div>
                )}

                {/* LinkedIn - solo si existe */}
                {isFieldVisible('person_linkedin_url') && lead.person_linkedin_url && (
                    <div className="flex items-start gap-3">
                        <Linkedin className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">LinkedIn</div>
                            <a href={lead.person_linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline block truncate">
                                {lead.person_linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                            </a>
                        </div>
                    </div>
                )}

                {/* Phone - solo si existe */}
                {isFieldVisible('phone') && lead.phone && (
                    <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">Phone</div>
                            <div className="text-sm text-gray-400">{lead.phone}</div>
                        </div>
                    </div>
                )}

                {/* Location - solo si existe */}
                {isFieldVisible('person_location') && lead.person_location && (
                    <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">Location</div>
                            <div className="text-sm text-gray-400">{lead.person_location}</div>
                        </div>
                    </div>
                )}

                {/* Title - solo si existe */}
                {isFieldVisible('person_title') && lead.person_title && (
                    <div className="flex items-start gap-3">
                        <BriefcaseIcon className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">Title</div>
                            <div className="text-sm text-gray-400">{lead.person_title}</div>
                        </div>
                    </div>
                )}

                {/* Source */}
                {isFieldVisible('source') && (
                    <div className="flex items-start gap-3">
                        <Globe className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">Source</div>
                            <div className="text-sm text-gray-400 capitalize">{lead.source.replace('_', ' ')}</div>
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}

function BriefcaseIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

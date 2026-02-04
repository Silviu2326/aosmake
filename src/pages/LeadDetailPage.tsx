import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppStore, Lead } from '../stores/useAppStore';

import { LeadHeader } from '../components/leads/LeadHeader';
import { IdentityCard } from '../components/leads/IdentityCard';
import { CompanyCard } from '../components/leads/CompanyCard';
import { ActivityTimeline } from '../components/leads/ActivityTimeline';
import { TagsSection } from '../components/leads/TagsSection';

const API_BASE_URL = 'https://backendaos-production.up.railway.app/api';

export function LeadDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { leads } = useAppStore();
    const [lead, setLead] = useState<Lead | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLead = async () => {
            if (!id) return;

            // First check if lead is already in store
            const foundInStore = leads.find(l => l.id === id);
            if (foundInStore) {
                setLead(foundInStore);
                setIsLoading(false);
                return;
            }

            // If not in store, fetch from API
            try {
                const response = await fetch(`${API_BASE_URL}/leads/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    // Transform the backend lead to frontend format
                    const transformedLead = transformBackendLead(data);
                    setLead(transformedLead);
                } else {
                    setLead(null);
                }
            } catch (error) {
                console.error('Error fetching lead:', error);
                setLead(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLead();
    }, [id, leads]);

    if (isLoading) return <div className="p-8 text-center text-gray-400">Loading lead...</div>;
    if (!lead) return <div className="p-8 text-center text-gray-400">Lead not found</div>;

    return (
        <div className="space-y-6 pb-20">
            <button onClick={() => navigate('/leads')} className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back to Leads
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-white/10 rounded-xl overflow-hidden shadow-lg">
                        <LeadHeader
                            lead={lead}
                            onVerifyEmail={() => console.log('Verify')}
                            onRunFlow={() => console.log('Run')}
                            onEdit={() => console.log('Edit')}
                            onDelete={() => console.log('Delete')}
                        />
                    </div>

                    <ActivityTimeline />
                </div>

                {/* Sidebar Column (1/3) */}
                <div className="space-y-6">
                    <IdentityCard lead={lead} />
                    <CompanyCard lead={lead} />
                    <TagsSection />
                </div>
            </div>
        </div>
    );
}

// Transform backend lead to frontend format
function transformBackendLead(backendLead: any): Lead {
    return {
        id: backendLead.lead_number,
        LeadNumber: backendLead.lead_number,
        email: backendLead.email || '',
        firstName: backendLead.first_name || '',
        lastName: backendLead.last_name || '',
        company: backendLead.company_name_from_p || backendLead.company_name || '',
        emailStatus: (backendLead.email_validation as any) || 'unknown',
        source: (backendLead.source as any) || 'api',
        createdAt: backendLead.created_at ? new Date(backendLead.created_at) : new Date(),
        stepStatus: backendLead.step_status || undefined,
        phone: backendLead.phone || undefined,
        person_title: backendLead.person_title || undefined,
        person_location: backendLead.person_location || undefined,
        person_linkedin_url: backendLead.person_linkedin_url || undefined,
        company_website: backendLead.company_website || backendLead.company_linkedin_url_from_p || undefined,
        company_linkedin_url: backendLead.company_linkedin_url || undefined,
        company_sales_url: backendLead.company_sales_url || backendLead.company_sales_url_from_p || undefined,
        company_size: backendLead.company_size || undefined,
        company_industry: backendLead.company_industry || undefined
    };
}

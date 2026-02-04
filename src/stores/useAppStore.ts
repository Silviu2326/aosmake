import { create } from 'zustand';

// Basic Type Definitions based on spec
export type EmailStatus = 'valid' | 'invalid' | 'risky' | 'pending' | 'unknown';
export type LeadSource = 'csv_import' | 'linkedin' | 'apollo' | 'manual' | 'api';

export interface LeadStepStatus {
    export?: string;
    verification?: string;
    compScrap?: string;
    box1?: string;
    instantly?: string;
}

export interface Lead {
    id: string;
    LeadNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    emailStatus: EmailStatus;
    source: LeadSource;
    createdAt: Date;
    stepStatus?: LeadStepStatus;
    // Additional fields from database
    phone?: string;
    person_title?: string;
    person_location?: string;
    person_linkedin_url?: string;
    company_website?: string;
    company_linkedin_url?: string;
    company_sales_url?: string;
    company_size?: string;
    company_industry?: string;
    // LinkedIn profile fields (migration 006)
    profileUrl?: string;
    fullName?: string;
    name?: string;
    companyId?: string;
    companyUrl?: string;
    regularCompanyUrl?: string;
    summary?: string;
    titleDescription?: string;
    industry?: string;
    companyLocation?: string;
    durationInRole?: string;
    durationInCompany?: string;
    pastExperienceCompanyName?: string;
    pastExperienceCompanyUrl?: string;
    pastExperienceCompanyTitle?: string;
    pastExperienceDate?: string;
    pastExperienceDuration?: string;
    connectionDegree?: string;
    profileImageUrl?: string;
    sharedConnectionsCount?: number;
    vmid?: string;
    linkedinProfileUrl?: string;
    isPremium?: boolean;
    isOpenLink?: boolean;
    query?: string;
    timestamp?: string;
    defaultProfileUrl?: string;
    searchAccountProfileId?: string;
    searchAccountProfileName?: string;
    // Verification result
    verification_result?: {
        status?: string;
        is_valid?: boolean;
        is_disposable?: boolean;
        is_role?: boolean;
        is_catchall?: boolean;
        confidence?: number;
    };
}

export interface Flow {
    id: string;
    name: string;
    status: 'active' | 'draft' | 'archived';
}

interface AppState {
    // Domain Data
    leads: Lead[];
    flows: Flow[];

    // UI State
    sidebarOpen: boolean;
    theme: 'dark' | 'light';
    isLoading: boolean;
    error: string | null;

    // Actions
    toggleSidebar: () => void;
    setLeads: (leads: Lead[]) => void;
    addLead: (lead: Lead) => void;
    fetchLeads: () => Promise<void>;
}

const API_BASE_URL = 'https://backendaos-production.up.railway.app/api';

// Transform backend lead to frontend lead
const transformLead = (backendLead: any): Lead => ({
    id: backendLead.lead_number || backendLead.LeadNumber,
    LeadNumber: backendLead.lead_number || backendLead.LeadNumber,
    email: backendLead.email || '',
    firstName: backendLead.first_name || backendLead.firstName || '',
    lastName: backendLead.last_name || backendLead.lastName || '',
    company: backendLead.company_name_from_p || backendLead.company_name || backendLead.companyName || '',
    emailStatus: (backendLead.email_validation as EmailStatus) || 'unknown',
    source: (backendLead.source as LeadSource) || 'api',
    createdAt: backendLead.created_at ? new Date(backendLead.created_at) : new Date(),
    stepStatus: backendLead.step_status || backendLead.stepStatus || undefined,
    phone: backendLead.phone || undefined,
    person_title: backendLead.person_title || undefined,
    person_location: backendLead.person_location || undefined,
    person_linkedin_url: backendLead.person_linkedin_url || undefined,
    company_website: backendLead.company_website || backendLead.company_linkedin_url_from_p || undefined,
    company_linkedin_url: backendLead.company_linkedin_url || undefined,
    company_sales_url: backendLead.company_sales_url || backendLead.company_sales_url_from_p || undefined,
    company_size: backendLead.company_size || undefined,
    company_industry: backendLead.company_industry || undefined,
    // LinkedIn profile fields (migration 006)
    profileUrl: backendLead.profileUrl || backendLead.profile_url || undefined,
    fullName: backendLead.fullName || backendLead.full_name || undefined,
    name: backendLead.name || undefined,
    companyId: backendLead.companyId || backendLead.company_id || undefined,
    companyUrl: backendLead.companyUrl || backendLead.company_url || undefined,
    regularCompanyUrl: backendLead.regularCompanyUrl || backendLead.regular_company_url || undefined,
    summary: backendLead.summary || undefined,
    titleDescription: backendLead.titleDescription || backendLead.title_description || undefined,
    industry: backendLead.industry || undefined,
    companyLocation: backendLead.companyLocation || backendLead.company_location || undefined,
    durationInRole: backendLead.durationInRole || backendLead.duration_in_role || undefined,
    durationInCompany: backendLead.durationInCompany || backendLead.duration_in_company || undefined,
    pastExperienceCompanyName: backendLead.pastExperienceCompanyName || backendLead.past_experience_company_name || undefined,
    pastExperienceCompanyUrl: backendLead.pastExperienceCompanyUrl || backendLead.past_experience_company_url || undefined,
    pastExperienceCompanyTitle: backendLead.pastExperienceCompanyTitle || backendLead.past_experience_company_title || undefined,
    pastExperienceDate: backendLead.pastExperienceDate || backendLead.past_experience_date || undefined,
    pastExperienceDuration: backendLead.pastExperienceDuration || backendLead.past_experience_duration || undefined,
    connectionDegree: backendLead.connectionDegree || backendLead.connection_degree || undefined,
    profileImageUrl: backendLead.profileImageUrl || backendLead.profile_image_url || undefined,
    sharedConnectionsCount: backendLead.sharedConnectionsCount || backendLead.shared_connections_count || undefined,
    vmid: backendLead.vmid || undefined,
    linkedinProfileUrl: backendLead.linkedinProfileUrl || backendLead.linkedin_profile_url || undefined,
    isPremium: backendLead.isPremium || backendLead.is_premium || undefined,
    isOpenLink: backendLead.isOpenLink || backendLead.is_open_link || undefined,
    query: backendLead.query || undefined,
    timestamp: backendLead.timestamp || undefined,
    defaultProfileUrl: backendLead.defaultProfileUrl || backendLead.default_profile_url || undefined,
    searchAccountProfileId: backendLead.searchAccountProfileId || backendLead.search_account_profile_id || undefined,
    searchAccountProfileName: backendLead.searchAccountProfileName || backendLead.search_account_profile_name || undefined,
    // Verification result
    verification_result: backendLead.verification_result || undefined
});

export const useAppStore = create<AppState>((set, get) => ({
    leads: [],
    flows: [
        { id: '1', name: 'Cold Outreach Sequence v1', status: 'active' },
        { id: '2', name: 'LinkedIn Connection Request', status: 'draft' },
        { id: '3', name: 'Webinar Follow-up', status: 'archived' }
    ],
    sidebarOpen: true,
    theme: 'dark',
    isLoading: false,
    error: null,

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    setLeads: (leads) => set({ leads }),
    
    addLead: (lead) => set((state) => ({ leads: [...state.leads, lead] })),

    fetchLeads: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${API_BASE_URL}/leads`);
            const data = await response.json();
            
            if (data.success) {
                const leads = data.data.map(transformLead);
                set({ leads, isLoading: false });
            } else {
                set({ error: data.error || 'Failed to fetch leads', isLoading: false });
            }
        } catch (error) {
            set({ error: 'Network error', isLoading: false });
            console.error('Error fetching leads:', error);
        }
    },
}));

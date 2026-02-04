import { create } from 'zustand';
import {
  VerificationStatus,
  CompScrapStatus,
  Box1Status,
  InstantlyStatus,
  DashboardLead,
  Box1Output
} from '../types';
import { dashboardApi, LeadFilters } from '../services/dashboardApi';

// Dashboard Metrics interface
export interface DashboardMetrics {
  // Totales
  totalExport: number;
  
  // Verification
  pendingVerification: number;
  sentVerification: number;
  verified: number;
  verificationRatio: number;
  verifiedWithCompUrl: number;
  verifiedWithCompUrlRatio: number;
  
  // CompScrap
  pendingCompScrap: number;
  sentCompScrap: number;
  scraped: number;
  compScrapRatio: number;
  totalWithCompUrl: number;
  compUrlRatio: number;
  
  // Box1
  pendingBox1: number;
  sentBox1: number;
  dropCount: number;
  fitCount: number;
  hitCount: number;
  hitRatio: number;
  noHitFitCount: number;
  dropRatio: number;
  fitRatio: number;
  storageRatio: number;
  fitHitRatio: number;
  
  // Instantly
  pendingInstantly: number;
  sentInstantly: number;
  repliedCount: number;
  positiveReplyCount: number;
  convertedCount: number;
  replyRatio: number;
  positiveReplyRatio: number;
  conversionRatio: number;
  
  // Estimates
  estimatedVerified: number;
  estimatedCompScrap: number;
  estimatedFitHit: number;
  estimatedPositiveReply: number;
  estimatedConversion: number;
}

// Calculate all metrics from leads
const calculateMetricsFromLeads = (leads: DashboardLead[]): DashboardMetrics => {
  const totalExport = leads.filter(l => l.stepStatus.export).length;
  
  // Verification metrics
  const verified = leads.filter(l => l.stepStatus.verification === 'verified').length;
  const sentVerification = leads.filter(l => 
    l.stepStatus.verification === 'sent' || 
    l.stepStatus.verification === 'verified' ||
    l.stepStatus.verification === 'failed'
  ).length;
  const pendingVerification = leads.filter(l => 
    l.stepStatus.export && 
    l.stepStatus.verification === 'pending'
  ).length;
  const verifiedWithCompUrl = leads.filter(l => 
    l.stepStatus.verification === 'verified' && 
    l.compUrl && 
    l.compUrl.length > 0
  ).length;
  const verificationRatio = totalExport > 0 ? verified / totalExport : 0;
  const verifiedWithCompUrlRatio = verified > 0 ? verifiedWithCompUrl / verified : 0;
  
  // CompScrap metrics
  const scraped = leads.filter(l => l.stepStatus.compScrap === 'scraped').length;
  const sentCompScrap = leads.filter(l => 
    l.stepStatus.compScrap === 'sent' || 
    l.stepStatus.compScrap === 'scraped' ||
    l.stepStatus.compScrap === 'failed'
  ).length;
  const pendingCompScrap = leads.filter(l => 
    l.stepStatus.verification === 'verified' && 
    l.stepStatus.compScrap === 'pending'
  ).length;
  const compScrapRatio = sentCompScrap > 0 ? scraped / sentCompScrap : 0;
  const totalWithCompUrl = leads.filter(l => l.compUrl && l.compUrl.length > 0).length;
  const compUrlRatio = totalExport > 0 ? totalWithCompUrl / totalExport : 0;
  
  // Box1 metrics
  const sentBox1Leads = leads.filter(l => 
    ['fit', 'drop', 'no_fit', 'hit', 'failed'].includes(l.stepStatus.box1)
  ).length;
  const dropCount = leads.filter(l => l.stepStatus.box1 === 'drop').length;
  const fitCount = leads.filter(l => l.stepStatus.box1 === 'fit').length;
  const hitCount = leads.filter(l => l.stepStatus.box1 === 'hit').length;
  const noHitFitCount = leads.filter(l => 
    l.stepStatus.box1 === 'fit' && 
    (!l.box1_outputs || !l.box1_outputs.some(o => o.status === 'hit'))
  ).length;
  const pendingBox1 = leads.filter(l => 
    l.stepStatus.compScrap === 'scraped' && 
    l.stepStatus.box1 === 'pending'
  ).length;
  const sentBox1 = sentBox1Leads;
  const dropRatio = sentBox1 > 0 ? dropCount / sentBox1 : 0;
  const fitRatio = sentBox1 > 0 ? fitCount / sentBox1 : 0;
  const hitRatio = sentBox1 > 0 ? hitCount / sentBox1 : 0;
  const storageRatio = sentBox1 > 0 ? noHitFitCount / sentBox1 : 0;
  const fitHitRatio = sentBox1 > 0 ? (fitCount + hitCount) / sentBox1 : 0;
  
  // Instantly metrics
  const sentInstantly = leads.filter(l => 
    ['sent', 'replied', 'positive_reply', 'converted', 'bounced'].includes(l.stepStatus.instantly)
  ).length;
  const pendingInstantly = leads.filter(l => 
    l.stepStatus.box1 === 'hit' && 
    l.stepStatus.instantly === 'pending'
  ).length;
  const repliedCount = leads.filter(l => 
    ['replied', 'positive_reply', 'converted'].includes(l.stepStatus.instantly)
  ).length;
  const positiveReplyCount = leads.filter(l => 
    ['positive_reply', 'converted'].includes(l.stepStatus.instantly)
  ).length;
  const convertedCount = leads.filter(l => 
    l.stepStatus.instantly === 'converted'
  ).length;
  const replyRatio = sentInstantly > 0 ? repliedCount / sentInstantly : 0;
  const positiveReplyRatio = repliedCount > 0 ? positiveReplyCount / repliedCount : 0;
  const conversionRatio = positiveReplyCount > 0 ? convertedCount / positiveReplyCount : 0;
  
  // Estimates
  const estimatedVerified = totalExport * verificationRatio;
  const estimatedCompScrap = estimatedVerified * compScrapRatio;
  const estimatedFitHit = estimatedCompScrap * fitHitRatio;
  const estimatedPositiveReply = estimatedFitHit * positiveReplyRatio;
  const estimatedConversion = estimatedPositiveReply * conversionRatio;
  
  return {
    totalExport,
    pendingVerification,
    sentVerification,
    verified,
    verificationRatio,
    verifiedWithCompUrl,
    verifiedWithCompUrlRatio,
    pendingCompScrap,
    sentCompScrap,
    scraped,
    compScrapRatio,
    totalWithCompUrl,
    compUrlRatio,
    pendingBox1,
    sentBox1,
    dropCount,
    fitCount,
    hitCount,
    noHitFitCount,
    dropRatio,
    fitRatio,
    hitRatio,
    storageRatio,
    fitHitRatio,
    pendingInstantly,
    sentInstantly,
    repliedCount,
    positiveReplyCount,
    convertedCount,
    replyRatio,
    positiveReplyRatio,
    conversionRatio,
    estimatedVerified,
    estimatedCompScrap,
    estimatedFitHit,
    estimatedPositiveReply,
    estimatedConversion
  };
};

interface DashboardState {
  leads: DashboardLead[];
  metrics: DashboardMetrics;
  isLoading: boolean;
  error: string | null;
  selectedLeadNumbers: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions - API Fetching
  fetchLeads: (filters?: LeadFilters) => Promise<void>;
  fetchMetrics: (campaignId?: string) => Promise<void>;
  refreshData: () => Promise<void>;

  // Actions - CRUD
  setLeads: (leads: DashboardLead[]) => void;
  addLead: (lead: DashboardLead) => void;
  addLeads: (newLeads: DashboardLead[]) => void;
  updateLead: (leadNumber: string, updates: Partial<DashboardLead>) => void;
  deleteLead: (leadNumber: string) => void;
  deleteLeads: (leadNumbers: string[]) => void;

  // Actions - Selection
  toggleLeadSelection: (leadNumber: string) => void;
  selectAllLeads: () => void;
  clearSelection: () => void;

  // Actions - Step Transitions (now with API calls)
  sendToVerification: (leadNumbers?: string[]) => Promise<void>;
  markVerificationComplete: (leadNumbers: string[], verified: boolean, compUrl?: string) => void;
  sendToCompScrap: (leadNumbers?: string[]) => Promise<void>;
  markCompScrapComplete: (leadNumbers: string[], scraped: boolean, compUrl?: string) => void;
  sendToBox1: (leadNumbers?: string[]) => Promise<void>;
  markBox1Complete: (results: { leadNumber: string; output: Box1Output }[]) => void;
  sendToInstantlyStock: (leadNumbers?: string[]) => Promise<void>;
  sendFromStockToInstantly: (leadNumbers?: string[]) => Promise<void>;
  sendToInstantly: (leadNumbers?: string[]) => Promise<void>;
  markInstantlyComplete: (statuses: { leadNumber: string; status: InstantlyStatus; response?: string }[]) => void;

  // Actions - Input/Output
  getVerificationInput: (limit?: number) => Promise<void>;
  getCompScrapInput: (limit?: number) => Promise<void>;
  getBox1Input: (limit?: number) => Promise<void>;
  getInstantlyInput: (limit?: number) => Promise<void>;
  importVerificationOutput: (file: File) => Promise<void>;
  importCompScrapOutput: (file: File) => Promise<void>;
  importBox1Output: (file: File) => Promise<void>;
  exportLeads: (step?: string) => Promise<void>;

  // Actions - Metrics
  recalculateMetrics: () => void;

  // Actions - Import/Export
  importFromCSV: (data: any[]) => Promise<void>;
  exportToCSV: () => string;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  leads: [],
  metrics: {
    totalExport: 0,
    pendingVerification: 0,
    sentVerification: 0,
    verified: 0,
    verificationRatio: 0,
    verifiedWithCompUrl: 0,
    verifiedWithCompUrlRatio: 0,
    pendingCompScrap: 0,
    sentCompScrap: 0,
    scraped: 0,
    compScrapRatio: 0,
    totalWithCompUrl: 0,
    compUrlRatio: 0,
    pendingBox1: 0,
    sentBox1: 0,
    dropCount: 0,
    fitCount: 0,
    hitCount: 0,
    hitRatio: 0,
    noHitFitCount: 0,
    dropRatio: 0,
    fitRatio: 0,
    storageRatio: 0,
    fitHitRatio: 0,
    pendingInstantly: 0,
    sentInstantly: 0,
    repliedCount: 0,
    positiveReplyCount: 0,
    convertedCount: 0,
    replyRatio: 0,
    positiveReplyRatio: 0,
    conversionRatio: 0,
    estimatedVerified: 0,
    estimatedCompScrap: 0,
    estimatedFitHit: 0,
    estimatedPositiveReply: 0,
    estimatedConversion: 0
  },
  isLoading: false,
  error: null,
  selectedLeadNumbers: [],
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  },

  // API Fetching Actions
  fetchLeads: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getLeads(filters);
      set({
        leads: response.data,
        pagination: response.pagination || get().pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch leads',
        isLoading: false,
      });
    }
  },

  fetchMetrics: async (campaignId) => {
    try {
      const response = await dashboardApi.getMetrics(campaignId);
      set({ metrics: response.data });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  },

  refreshData: async () => {
    await Promise.all([
      get().fetchLeads(),
      get().fetchMetrics(),
    ]);
  },
  
  // CRUD Actions
  setLeads: (leads) => {
    set({ leads });
    set({ metrics: calculateMetricsFromLeads(leads) });
  },
  
  addLead: (lead) => {
    const { leads } = get();
    const updatedLeads = [...leads, lead];
    set({ leads: updatedLeads });
    set({ metrics: calculateMetricsFromLeads(updatedLeads) });
  },
  
  addLeads: (newLeads) => {
    const { leads } = get();
    const updatedLeads = [...leads, ...newLeads];
    set({ leads: updatedLeads });
    set({ metrics: calculateMetricsFromLeads(updatedLeads) });
  },
  
  updateLead: (leadNumber, updates) => {
    const { leads } = get();
    const updatedLeads = leads.map(l => 
      l.LeadNumber === leadNumber ? { ...l, ...updates } : l
    );
    set({ leads: updatedLeads });
    set({ metrics: calculateMetricsFromLeads(updatedLeads) });
  },
  
  deleteLead: (leadNumber) => {
    const { leads } = get();
    const updatedLeads = leads.filter(l => l.LeadNumber !== leadNumber);
    set({ leads: updatedLeads });
    set({ metrics: calculateMetricsFromLeads(updatedLeads) });
  },
  
  deleteLeads: (leadNumbers) => {
    const { leads } = get();
    const updatedLeads = leads.filter(l => !leadNumbers.includes(l.LeadNumber));
    set({ leads: updatedLeads });
    set({ metrics: calculateMetricsFromLeads(updatedLeads) });
  },
  
  // Selection Actions
  toggleLeadSelection: (leadNumber) => {
    const { selectedLeadNumbers } = get();
    const isSelected = selectedLeadNumbers.includes(leadNumber);
    if (isSelected) {
      set({ selectedLeadNumbers: selectedLeadNumbers.filter(n => n !== leadNumber) });
    } else {
      set({ selectedLeadNumbers: [...selectedLeadNumbers, leadNumber] });
    }
  },
  
  selectAllLeads: () => {
    const { leads } = get();
    set({ selectedLeadNumbers: leads.map(l => l.LeadNumber) });
  },
  
  clearSelection: () => {
    set({ selectedLeadNumbers: [] });
  },
  
  // Step Transition Actions (with API integration)
  sendToVerification: async (leadNumbers) => {
    const targetLeads = leadNumbers || get().selectedLeadNumbers;
    try {
      await dashboardApi.sendToVerification(targetLeads);
      await get().refreshData();
      set({ selectedLeadNumbers: [] });
    } catch (error) {
      console.error('Failed to send to verification:', error);
      throw error;
    }
  },
  
  markVerificationComplete: (leadNumbers, verified, compUrl) => {
    const { leads } = get();
    const updatedLeads = leads.map(l => 
      leadNumbers.includes(l.LeadNumber)
        ? { 
            ...l, 
            stepStatus: { 
              ...l.stepStatus, 
              verification: verified ? VerificationStatus.VERIFIED : VerificationStatus.FAILED 
            },
            ...(compUrl ? { compUrl } : {})
          }
        : l
    );
    set({ leads: updatedLeads });
    set({ metrics: calculateMetricsFromLeads(updatedLeads) });
  },
  
  sendToCompScrap: async (leadNumbers) => {
    const targetLeads = leadNumbers || get().selectedLeadNumbers;
    try {
      await dashboardApi.sendToCompScrap(targetLeads);
      await get().refreshData();
      set({ selectedLeadNumbers: [] });
    } catch (error) {
      console.error('Failed to send to CompScrap:', error);
      throw error;
    }
  },
  
  markCompScrapComplete: (leadNumbers, scraped, compUrl) => {
    const { leads } = get();
    const updatedLeads = leads.map(l => 
      leadNumbers.includes(l.LeadNumber)
        ? { 
            ...l, 
            stepStatus: { 
              ...l.stepStatus, 
              compScrap: scraped ? CompScrapStatus.SCRAPED : CompScrapStatus.FAILED 
            },
            ...(compUrl ? { compUrl } : {})
          }
        : l
    );
    set({ leads: updatedLeads });
    set({ metrics: calculateMetricsFromLeads(updatedLeads) });
  },
  
  sendToBox1: async (leadNumbers) => {
    const targetLeads = leadNumbers || get().selectedLeadNumbers;
    try {
      await dashboardApi.sendToBox1(targetLeads);
      await get().refreshData();
      set({ selectedLeadNumbers: [] });
    } catch (error) {
      console.error('Failed to send to Box1:', error);
      throw error;
    }
  },
  
  markBox1Complete: (results: { leadNumber: string; output: Box1Output }[]) => {
    const { leads } = get();
    const updatedLeads = leads.map(l => {
      const result = results.find(r => r.leadNumber === l.LeadNumber);
      if (!result) return l;
      
      const statusMap: Record<string, Box1Status> = {
        'hit': Box1Status.HIT,
        'fit': Box1Status.FIT,
        'drop': Box1Status.DROP,
        'no_fit': Box1Status.NO_FIT
      };
      
      return {
        ...l,
        stepStatus: { ...l.stepStatus, box1: statusMap[result.output.status] || Box1Status.FAILED },
        box1_outputs: [...(l.box1_outputs || []), result.output]
      };
    });
    set({ leads: updatedLeads });
    set({ metrics: calculateMetricsFromLeads(updatedLeads) });
  },
  
  sendToInstantlyStock: async (leadNumbers) => {
    const targetLeads = leadNumbers || get().selectedLeadNumbers;
    try {
      await dashboardApi.sendToInstantlyStock(targetLeads);
      await get().refreshData();
      set({ selectedLeadNumbers: [] });
    } catch (error) {
      console.error('Failed to send to Instantly Stock:', error);
      throw error;
    }
  },
  
  sendFromStockToInstantly: async (leadNumbers) => {
    const targetLeads = leadNumbers || get().selectedLeadNumbers;
    try {
      await dashboardApi.sendFromStockToInstantly(targetLeads);
      await get().refreshData();
      set({ selectedLeadNumbers: [] });
    } catch (error) {
      console.error('Failed to send from Stock to Instantly:', error);
      throw error;
    }
  },
  
  sendToInstantly: async (leadNumbers) => {
    const targetLeads = leadNumbers || get().selectedLeadNumbers;
    try {
      await dashboardApi.sendToInstantly(targetLeads);
      await get().refreshData();
      set({ selectedLeadNumbers: [] });
    } catch (error) {
      console.error('Failed to send to Instantly:', error);
      throw error;
    }
  },
  
  markInstantlyComplete: (statuses: { leadNumber: string; status: InstantlyStatus; response?: string }[]) => {
    const { leads } = get();
    const updatedLeads = leads.map(l => {
      const statusInfo = statuses.find(s => s.leadNumber === l.LeadNumber);
      if (!statusInfo) return l;
      
      return {
        ...l,
        stepStatus: { ...l.stepStatus, instantly: statusInfo.status },
        ...(statusInfo.response ? { instantly_response: statusInfo.response } : {})
      };
    });
    set({ leads: updatedLeads });
    set({ metrics: calculateMetricsFromLeads(updatedLeads) });
  },
  
  // Metrics Action
  recalculateMetrics: () => {
    const { leads } = get();
    set({ metrics: calculateMetricsFromLeads(leads) });
  },
  
  // Import/Export Actions (with API integration)
  importFromCSV: async (data) => {
    const newLeads: DashboardLead[] = data.map((row, idx) => ({
      LeadNumber: row.LeadNumber || `LN-${String(idx + 1).padStart(4, '0')}`,
      TargetID: row.TargetID || `TID-${1000 + idx}`,
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      personTitle: row.personTitle || '',
      personTitleDescription: row.personTitleDescription || '',
      personSummary: row.personSummary || '',
      personLocation: row.personLocation || '',
      durationInRole: row.durationInRole || '',
      durationInCompany: row.durationInCompany || '',
      personTimestamp: row.personTimestamp || new Date().toISOString(),
      personLinkedinUrl: row.personLinkedinUrl || '',
      personSalesUrl: row.personSalesUrl || '',
      companyName_fromP: row.companyName_fromP || row.companyName || '',
      companyLinkedinUrl_fromP: row.companyLinkedinUrl_fromP || '',
      companySalesUrl_fromP: row.companySalesUrl_fromP || '',
      email: row.email || '',
      email_validation: row.email_validation || '',
      validation_succes: row.validation_succes || '',
      firstName_cleaned: row.firstName_cleaned || row.firstName || '',
      lastName_cleaned: row.lastName_cleaned || row.lastName || '',
      companyName: row.companyName,
      companyDescription: row.companyDescription,
      companyTagLine: row.companyTagLine,
      industry: row.industry,
      employeeCount: row.employeeCount,
      companyLocation: row.companyLocation,
      website: row.website,
      domain: row.domain,
      yearFounded: row.yearFounded,
      specialties: row.specialties,
      phone: row.phone,
      minRevenue: row.minRevenue,
      maxRevenue: row.maxRevenue,
      growth6Mth: row.growth6Mth,
      growth1Yr: row.growth1Yr,
      growth2Yr: row.growth2Yr,
      companyTimestampSN: row.companyTimestampSN,
      companyTimestampLN: row.companyTimestampLN,
      linkedInCompanyUrl: row.linkedInCompanyUrl,
      salesNavigatorCompanyUrl: row.salesNavigatorCompanyUrl,
      compUrl: row.compUrl,
      stepStatus: {
        export: true,
        verification: VerificationStatus.PENDING,
        compScrap: CompScrapStatus.PENDING,
        box1: Box1Status.PENDING,
        instantly: InstantlyStatus.PENDING
      },
      instantly_body1: row.instantly_body1,
      instantly_body2: row.instantly_body2,
      instantly_body3: row.instantly_body3,
      instantly_body4: row.instantly_body4
    }));

    try {
      set({ isLoading: true, error: null });
      await dashboardApi.createLeads(newLeads);
      await get().refreshData();
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to import leads',
        isLoading: false
      });
      throw error;
    }
  },
  
  exportToCSV: () => {
    const { leads } = get();
    if (leads.length === 0) return '';
    
    const headers = Object.keys(leads[0]);
    const rows = leads.map(lead => 
      headers.map(h => {
        const value = (lead as any)[h];
        if (typeof value === 'object') return JSON.stringify(value);
        return value || '';
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  },

  // Input/Output Actions
  getVerificationInput: async (limit) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getVerificationInput(limit);
      set({ leads: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get verification input',
        isLoading: false,
      });
    }
  },

  getCompScrapInput: async (limit) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getCompScrapInput(limit);
      set({ leads: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get compScrap input',
        isLoading: false,
      });
    }
  },

  getBox1Input: async (limit) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getBox1Input(limit);
      set({ leads: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get box1 input',
        isLoading: false,
      });
    }
  },

  getInstantlyInput: async (limit) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getInstantlyInput(limit);
      set({ leads: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get instantly input',
        isLoading: false,
      });
    }
  },

  importVerificationOutput: async (file) => {
    set({ isLoading: true, error: null });
    try {
      await dashboardApi.importVerificationOutput(file);
      await get().refreshData();
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to import verification output',
        isLoading: false,
      });
      throw error;
    }
  },

  importCompScrapOutput: async (file) => {
    set({ isLoading: true, error: null });
    try {
      await dashboardApi.importCompScrapOutput(file);
      await get().refreshData();
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to import compScrap output',
        isLoading: false,
      });
      throw error;
    }
  },

  importBox1Output: async (file) => {
    set({ isLoading: true, error: null });
    try {
      await dashboardApi.importBox1Output(file);
      await get().refreshData();
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to import box1 output',
        isLoading: false,
      });
      throw error;
    }
  },

  exportLeads: async (step) => {
    try {
      const blob = await dashboardApi.exportLeads(step);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${step || 'all'}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export leads:', error);
      throw error;
    }
  }
}));

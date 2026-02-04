import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useDashboardStore, DashboardMetrics } from '../stores/useDashboardStore';
import { DashboardLead, VerificationStatus, CompScrapStatus, Box1Status, InstantlyStatus } from '../types';
import { LeadFilters } from '../services/dashboardApi';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Mail,
  Download,
  Upload,
  ChevronDown,
  FileSpreadsheet,
  Settings,
  Link,
  Plus,
  Play
} from 'lucide-react';

// Import new components
import { DashboardFilters, FilterState } from '../components/dashboard/DashboardFilters';
import { DashboardPagination, usePagination } from '../components/dashboard/DashboardPagination';
import { DashboardBulkActions } from '../components/dashboard/DashboardBulkActions';
import { DashboardLeadTable } from '../components/dashboard/DashboardLeadTable';
import { ExportModal } from '../components/dashboard/ExportModal';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { NotificationProvider, useNotification } from '../components/dashboard/DashboardNotifications';
import { StageConfigModal } from '../components/dashboard/StageConfigModal';
import { CreateCampaignModal } from '../components/dashboard/CreateCampaignModal';
import { CompScrapImportModal } from '../components/import/CompScrapImportModal';

const API_URL = 'https://backendaos-production.up.railway.app/api';

// Campaign type
interface Campaign {
  id: string;
  name: string;
  description?: string;
  leadCount: number;
  createdAt?: string;
}

// Utility components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-surface border border-border rounded-xl p-4 ${className}`}>
    {children}
  </div>
);

const MetricCard: React.FC<{ 
  title: string; 
  value: string | number; 
  subtitle?: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
}> = ({ title, value, subtitle, type, icon }) => (
  <Card className="hover:border-accent/50 transition-colors">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : type === 'warning' ? 'text-yellow-400' : 'text-white'}`}>{value}</p>
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>
      {icon && <div className="text-accent">{icon}</div>}
    </div>
  </Card>
);

// Format percentage
const formatPercent = (value: number) => `${((value || 0) * 100).toFixed(1)}%`;
const formatNumber = (value: number) => (value || 0).toLocaleString();

// Metrics Display Component
const MetricsDisplay: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
  <div className="space-y-6">
    {/* Total Export */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard 
        title="Total Leads (Export)" 
        value={formatNumber(metrics.totalExport)}
        icon={<Users size={24} />}
      />
    </div>

    {/* Verification Section */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <CheckCircle size={20} className="text-green-400" />
        Paso de Verificación
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard 
          title="Input Verificación Pendiente" 
          value={formatNumber(metrics.pendingVerification)}
          subtitle="Listos para verificación"
        />
        <MetricCard 
          title="Enviados a Verificación" 
          value={formatNumber(metrics.sentVerification)}
        />
        <MetricCard 
          title="Verificados Ahora" 
          value={formatNumber(metrics.verified)}
        />
        <MetricCard 
          title="Ratio de Verificación" 
          value={formatPercent(metrics.verificationRatio)}
          type="success"
        />
        <MetricCard 
          title="Verificados con CompUrl" 
          value={formatNumber(metrics.verifiedWithCompUrl)}
          subtitle={`${formatPercent(metrics.verifiedWithCompUrlRatio)} de verificados`}
        />
      </div>
    </div>

    {/* CompScrap Section */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <BarChart3 size={20} className="text-blue-400" />
        Paso de Company Scrap
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard 
          title="Input CompScrap Pendiente" 
          value={formatNumber(metrics.pendingCompScrap)}
          subtitle="Verificados y listos"
        />
        <MetricCard 
          title="Enviados a CompScrap" 
          value={formatNumber(metrics.sentCompScrap)}
        />
        <MetricCard 
          title="Scrappeados Ahora" 
          value={formatNumber(metrics.scraped)}
        />
        <MetricCard 
          title="Total con CompUrl" 
          value={formatNumber(metrics.totalWithCompUrl)}
          subtitle={formatPercent(metrics.compUrlRatio)}
        />
        <MetricCard 
          title="Ratio de Scrap" 
          value={formatPercent(metrics.compScrapRatio)}
          type="success"
        />
      </div>
    </div>

    {/* Box1 Section */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <TrendingUp size={20} className="text-purple-400" />
        Paso Box1 / FIT
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard 
          title="Input Box1 Pendiente" 
          value={formatNumber(metrics.pendingBox1)}
          subtitle="Scrappeados y listos"
        />
        <MetricCard 
          title="Enviados a Box1" 
          value={formatNumber(metrics.sentBox1)}
        />
        <MetricCard 
          title="DROP" 
          value={formatNumber(metrics.dropCount)}
          type="error"
          subtitle={formatPercent(metrics.dropRatio)}
        />
        <MetricCard 
          title="FIT" 
          value={formatNumber(metrics.fitCount)}
          type="success"
          subtitle={formatPercent(metrics.fitRatio)}
        />
        <MetricCard 
          title="Almacenamiento (FIT no HIT)" 
          value={formatNumber(metrics.noHitFitCount)}
          subtitle={formatPercent(metrics.storageRatio)}
        />
        <MetricCard 
          title="Ratio FIT & HIT" 
          value={formatPercent(metrics.fitHitRatio)}
          type="success"
        />
      </div>
    </div>

    {/* Instantly Section */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <ArrowRight size={20} className="text-orange-400" />
        Paso Instantly / Respuesta
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard 
          title="Input Instantly Pendiente" 
          value={formatNumber(metrics.pendingInstantly)}
          subtitle="HIT y listos"
        />
        <MetricCard 
          title="Enviados a Instantly" 
          value={formatNumber(metrics.sentInstantly)}
        />
        <MetricCard 
          title="Ratio de Respuesta" 
          value={formatPercent(metrics.replyRatio)}
        />
        <MetricCard 
          title="Ratio Respuesta Positiva" 
          value={formatPercent(metrics.positiveReplyRatio)}
        />
        <MetricCard 
          title="Ratio de Conversión" 
          value={formatPercent(metrics.conversionRatio)}
          type="success"
        />
      </div>
    </div>

    {/* Estimates Section */}
    <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-accent" />
        Estimaciones del Pipeline
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Total Export</p>
          <p className="text-xl font-bold text-white">{formatNumber(metrics.totalExport)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Est. Verificado</p>
          <p className="text-xl font-bold text-green-400">{formatNumber(Math.round(metrics.estimatedVerified))}</p>
          <p className="text-xs text-gray-500">× {formatPercent(metrics.verificationRatio)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Est. CompScrap</p>
          <p className="text-xl font-bold text-blue-400">{formatNumber(Math.round(metrics.estimatedCompScrap))}</p>
          <p className="text-xs text-gray-500">× {formatPercent(metrics.compScrapRatio)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Est. FIT&HIT</p>
          <p className="text-xl font-bold text-purple-400">{formatNumber(Math.round(metrics.estimatedFitHit))}</p>
          <p className="text-xs text-gray-500">× {formatPercent(metrics.fitHitRatio)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Est. Respuesta Positiva</p>
          <p className="text-xl font-bold text-yellow-400">{formatNumber(Math.round(metrics.estimatedPositiveReply))}</p>
          <p className="text-xs text-gray-500">× {formatPercent(metrics.positiveReplyRatio)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Est. Conversión</p>
          <p className="text-xl font-bold text-orange-400">{formatNumber(Math.round(metrics.estimatedConversion))}</p>
          <p className="text-xs text-gray-500">× {formatPercent(metrics.conversionRatio)}</p>
        </div>
      </div>
    </div>
  </div>
);

// Dashboard Content Component (uses notifications)
const DashboardContent: React.FC = () => {
  const {
    leads,
    metrics,
    selectedLeadNumbers,
    isLoading,
    error,
    fetchLeads,
    fetchMetrics,
    toggleLeadSelection,
    selectAllLeads,
    clearSelection
  } = useDashboardStore();
  const { success } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'master' | 'verification' | 'compScrap' | 'box1' | 'emailStock' | 'instantly' | 'analytics'>('verification');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isStageConfigOpen, setIsStageConfigOpen] = useState(false);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isCompScrapImportOpen, setIsCompScrapImportOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

  // Fetch campaigns from API
  const fetchCampaigns = useCallback(async () => {
    setIsLoadingCampaigns(true);
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
  }, []);

  // Fetch campaigns on mount
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Reset filters when changing tabs
  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    
    // Reset filters when switching to a specific step tab
    if (tabId === 'verification') {
      setFilters({
        ...filters,
        verificationStatus: VerificationStatus.PENDING,
        compScrapStatus: 'all',
        box1Status: 'all',
        instantlyStatus: 'all'
      });
    } else if (tabId === 'compScrap') {
      setFilters({
        ...filters,
        verificationStatus: 'all',
        compScrapStatus: CompScrapStatus.PENDING,
        box1Status: 'all',
        instantlyStatus: 'all'
      });
    } else if (tabId === 'box1') {
      setFilters({
        ...filters,
        verificationStatus: 'all',
        compScrapStatus: 'all',
        box1Status: Box1Status.PENDING,
        instantlyStatus: 'all'
      });
    } else if (tabId === 'emailStock') {
      setFilters({
        ...filters,
        verificationStatus: 'all',
        compScrapStatus: 'all',
        box1Status: 'all',
        instantlyStatus: InstantlyStatus.STOCK
      });
    } else if (tabId === 'instantly') {
      setFilters({
        ...filters,
        verificationStatus: 'all',
        compScrapStatus: 'all',
        box1Status: 'all',
        instantlyStatus: InstantlyStatus.PENDING
      });
    } else {
      // For overview, analytics, and master tabs, reset status filters
      setFilters({
        ...filters,
        verificationStatus: 'all',
        compScrapStatus: 'all',
        box1Status: 'all',
        instantlyStatus: 'all'
      });
    }
  };

  // Handle campaign creation
  const handleCreateCampaign = async (name: string, description: string) => {
    try {
      const response = await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      
      if (response.ok) {
        success('Campaña creada', `"${name}" ha sido creada correctamente`);
        fetchCampaigns(); // Refresh campaigns list
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      success('Error', 'No se pudo crear la campaña');
    }
  };

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    verificationStatus: 'all',
    compScrapStatus: 'all',
    box1Status: 'all',
    instantlyStatus: 'all',
    hasCompUrl: 'all',
    dateRange: { start: '', end: '' }
  });

  // Fetch data on mount and when campaign changes
  useEffect(() => {
    fetchLeads();
    fetchMetrics();
  }, [fetchLeads, fetchMetrics]);

  // Refetch when filters or campaign changes
  useEffect(() => {
    // Transform FilterState to LeadFilters (convert 'all' and dateRange to undefined)
    const leadFilters: LeadFilters = {
      search: filters.search || undefined,
      verificationStatus: filters.verificationStatus === 'all' ? undefined : filters.verificationStatus,
      compScrapStatus: filters.compScrapStatus === 'all' ? undefined : filters.compScrapStatus,
      box1Status: filters.box1Status === 'all' ? undefined : filters.box1Status,
      instantlyStatus: filters.instantlyStatus === 'all' ? undefined : filters.instantlyStatus,
      hasCompUrl: filters.hasCompUrl === 'all' ? undefined : filters.hasCompUrl,
      startDate: filters.dateRange.start || undefined,
      endDate: filters.dateRange.end || undefined,
      campaignId: selectedCampaign?.id || undefined,
    };
    fetchLeads(leadFilters);
  }, [filters, selectedCampaign, fetchLeads]);

  // Pagination
  const pagination = usePagination(leads.length, 25);

  // Filter leads based on filter state
  const filteredLeads = useMemo(() => {
    // DEBUG: Log lead data structure first time
    if (leads.length > 0 && leads[0].LeadNumber === undefined) {
      console.log('DEBUG: First lead structure:', JSON.stringify(leads[0], null, 2));
    }
    return leads.filter(lead => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matches = 
          lead.LeadNumber?.toLowerCase().includes(search) ||
          lead.firstName?.toLowerCase().includes(search) ||
          lead.lastName?.toLowerCase().includes(search) ||
          (lead.companyName?.toLowerCase().includes(search) || false) ||
          (lead.companyName_fromP?.toLowerCase().includes(search) || false) ||
          lead.email?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      // Status filters
      if (filters.verificationStatus !== 'all' && lead.stepStatus?.verification !== filters.verificationStatus) return false;
      if (filters.compScrapStatus !== 'all' && lead.stepStatus?.compScrap !== filters.compScrapStatus) return false;
      if (filters.box1Status !== 'all' && lead.stepStatus?.box1 !== filters.box1Status) return false;
      if (filters.instantlyStatus !== 'all' && lead.stepStatus?.instantly !== filters.instantlyStatus) return false;

      // CompUrl filter
      if (filters.hasCompUrl !== 'all') {
        const hasUrl = !!lead.compUrl;
        if (filters.hasCompUrl !== hasUrl) return false;
      }

      return true;
    });
  }, [leads, filters]);

  // Get paginated leads
  const paginatedLeads = useMemo(() => {
    return filteredLeads.slice(pagination.startIndex, pagination.endIndex);
  }, [filteredLeads, pagination.startIndex, pagination.endIndex]);

  // Calculate counts for each step (with safety check for stepStatus)
  const verificationCount = filteredLeads.filter(l => l.stepStatus?.export && l.stepStatus?.verification === 'pending').length;
  const compScrapCount = filteredLeads.filter(l => l.stepStatus?.verification === 'verified' && l.stepStatus?.compScrap === 'pending').length;
  const box1Count = filteredLeads.filter(l => l.stepStatus?.compScrap === 'scraped' && l.stepStatus?.box1 === 'pending').length;
  const emailStockCount = filteredLeads.filter(l => l.stepStatus?.instantly === 'stock').length;
  const instantlyCount = filteredLeads.filter(l => l.stepStatus?.box1 === 'hit' && l.stepStatus?.instantly === 'pending').length;

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: <BarChart3 size={18} />, count: 0 },
    { id: 'analytics', label: 'Análisis', icon: <TrendingUp size={18} />, count: 0 },
    { id: 'master', label: 'Tabla Master', icon: <Users size={18} />, count: filteredLeads.length },
    { id: 'verification', label: 'Input Verificación', icon: <CheckCircle size={18} />, count: verificationCount },
    { id: 'compScrap', label: 'Input CompScrap', icon: <BarChart3 size={18} />, count: compScrapCount },
    { id: 'box1', label: 'Input Box1', icon: <TrendingUp size={18} />, count: box1Count },
    { id: 'emailStock', label: 'Email Stock', icon: <Mail size={18} />, count: emailStockCount },
    { id: 'instantly', label: 'Input Instantly', icon: <ArrowRight size={18} />, count: instantlyCount }
  ];

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleSendSelected = async () => {
    if (selectedLeadNumbers.length === 0) return;
    
    const count = selectedLeadNumbers.length;
    
    switch (activeTab) {
      case 'verification':
        try {
          const response = await fetch(`${API_URL}/leads/run-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leadNumbers: selectedLeadNumbers })
          });
          
          if (response.ok) {
            success('Verificación iniciada', `${count} leads enviados al flujo de verificación`);
            fetchLeads(); // Refresh the list
            clearSelection();
          } else {
            throw new Error('Failed to start verification');
          }
        } catch (error) {
          console.error('Error starting verification:', error);
          success('Error', 'No se pudo iniciar la verificación');
        }
        break;
      case 'box1':
        try {
          const response = await fetch(`${API_URL}/leads/run-box1`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leadNumbers: selectedLeadNumbers })
          });
          
          if (response.ok) {
            success('Flujo Box1 iniciado', `${count} leads enviados al flujo Box1`);
            fetchLeads();
            clearSelection();
          } else {
            throw new Error('Failed to start Box1 flow');
          }
        } catch (error) {
          console.error('Error starting Box1 flow:', error);
          success('Error', 'No se pudo iniciar el flujo Box1');
        }
        break;
      default:
        success(
          'Leads enviados',
          `${count} leads enviados al siguiente paso`
        );
    }
  };

  const handleViewLead = (lead: DashboardLead) => {
    console.log('View lead:', lead.LeadNumber);
    // TODO: Open lead detail modal
  };

  // Handle errors
  if (error) {
    return (
      <div className="p-6 min-h-screen bg-background">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          <button
            onClick={() => fetchLeads()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-background">
      {isLoading && (
        <div className="fixed top-4 right-4 bg-accent text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Loading...
        </div>
      )}
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de Control del Pipeline</h1>
          <p className="text-gray-400 mt-1">Monitorea tu pipeline de procesamiento de leads</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Campaign Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCampaignOpen(!isCampaignOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
            >
              <Users size={18} />
              {selectedCampaign?.name || 'Seleccionar Campaña'}
              <ChevronDown size={16} className={`transition-transform ${isCampaignOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCampaignOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-xl z-50">
                {campaigns.map(campaign => (
                  <button
                    key={campaign.id}
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setIsCampaignOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedCampaign?.id === campaign.id ? 'bg-accent/20 text-accent' : 'text-gray-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{campaign.name}</span>
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                      {campaign.leadCount}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create Campaign Button */}
          <button
            onClick={() => setIsCreateCampaignOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus size={18} />
            Nueva Campaña
          </button>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
          >
            <FileSpreadsheet size={18} />
            Exportar
          </button>

          <button 
            onClick={() => setIsStageConfigOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
          >
            <Link size={18} />
            Configurar Etapas
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-accent text-white' 
                : 'bg-surface text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-accent/20 text-accent'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6 overflow-hidden">
        {activeTab === 'overview' && <MetricsDisplay metrics={metrics} />}
        {activeTab === 'analytics' && (
          <div className="w-full overflow-hidden">
            <DashboardCharts leads={leads} metrics={metrics} />
          </div>
        )}
        
        {activeTab !== 'overview' && activeTab !== 'analytics' && (
          <Card>
            {/* Tab-specific header with action button */}
            {activeTab === 'verification' && (
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-400" />
                  <h2 className="text-lg font-semibold text-white">Input Verificación</h2>
                  <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-sm">
                    {verificationCount} leads
                  </span>
                </div>
                <button
                  onClick={handleSendSelected}
                  disabled={selectedLeadNumbers.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedLeadNumbers.length > 0
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-surface text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Play size={18} />
                  Iniciar Verificación
                  {selectedLeadNumbers.length > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                      {selectedLeadNumbers.length}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* CompScrap Tab Header with Import/Export buttons */}
            {activeTab === 'compScrap' && (
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} className="text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Input CompScrap</h2>
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-sm">
                    {compScrapCount} leads
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsCompScrapImportOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Upload size={18} />
                    Importar CSV
                  </button>
                  <button
                    onClick={() => {
                      const headers = ['LeadNumber', 'firstName', 'lastName', 'companyName', 'email', 'compUrl'];
                      const rows = filteredLeads.map(l => [
                        l.LeadNumber,
                        l.firstName,
                        l.lastName,
                        l.companyName,
                        l.email,
                        l.compUrl || ''
                      ]);
                      
                      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `compScrap-input-${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      
                      success('Exportación completada', `${filteredLeads.length} leads exportados`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Download size={18} />
                    Exportar CSV
                  </button>
                </div>
              </div>
            )}

            {/* Box1 Tab Header with Run Flow button */}
            {activeTab === 'box1' && (
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Input Box1</h2>
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-sm">
                    {box1Count} leads
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendSelected}
                    disabled={selectedLeadNumbers.length === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedLeadNumbers.length > 0
                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                        : 'bg-surface text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Play size={18} />
                    Ejecutar Flujo
                    {selectedLeadNumbers.length > 0 && (
                      <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                        {selectedLeadNumbers.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const headers = ['LeadNumber', 'firstName', 'lastName', 'companyName', 'email', 'compUrl'];
                      const rows = filteredLeads.map(l => [
                        l.LeadNumber,
                        l.firstName,
                        l.lastName,
                        l.companyName,
                        l.email,
                        l.compUrl || ''
                      ]);
                      
                      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `box1-input-${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      
                      success('Exportación completada', `${filteredLeads.length} leads exportados`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <Download size={18} />
                    Exportar CSV
                  </button>
                </div>
              </div>
            )}

            {/* EmailStock Tab Header */}
            {activeTab === 'emailStock' && (
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Mail size={20} className="text-cyan-400" />
                  <h2 className="text-lg font-semibold text-white">Email Stock</h2>
                  <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full text-sm">
                    {emailStockCount} leads
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const headers = ['LeadNumber', 'firstName', 'lastName', 'companyName', 'email'];
                      const rows = filteredLeads.map(l => [
                        l.LeadNumber,
                        l.firstName,
                        l.lastName,
                        l.companyName,
                        l.email
                      ]);
                      
                      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `email-stock-${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      
                      success('Exportación completada', `${filteredLeads.length} leads exportados`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <Download size={18} />
                    Exportar CSV
                  </button>
                  <button
                    onClick={handleSendSelected}
                    disabled={selectedLeadNumbers.length === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedLeadNumbers.length > 0
                        ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                        : 'bg-surface text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Play size={18} />
                    Enviar a Instantly
                    {selectedLeadNumbers.length > 0 && (
                      <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                        {selectedLeadNumbers.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Instantly Tab Header */}
            {activeTab === 'instantly' && (
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ArrowRight size={20} className="text-orange-400" />
                  <h2 className="text-lg font-semibold text-white">Input Instantly</h2>
                  <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full text-sm">
                    {instantlyCount} leads
                  </span>
                </div>
                <button
                  onClick={handleSendSelected}
                  disabled={selectedLeadNumbers.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedLeadNumbers.length > 0
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-surface text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Play size={18} />
                  Enviar a Instantly
                  {selectedLeadNumbers.length > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                      {selectedLeadNumbers.length}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Filters Component */}
            <DashboardFilters
              filters={filters}
              onFiltersChange={setFilters}
              leadCount={leads.length}
              filteredCount={filteredLeads.length}
            />

            {/* Lead Table */}
            <DashboardLeadTable
              leads={paginatedLeads}
              selectedIds={selectedLeadNumbers}
              onSelect={toggleLeadSelection}
              onSelectAll={(select) => select ? selectAllLeads() : clearSelection()}
              onViewLead={handleViewLead}
            />

            {/* Pagination */}
            <DashboardPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={filteredLeads.length}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={pagination.goToPage}
              onItemsPerPageChange={pagination.setItemsPerPage}
            />
          </Card>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedLeadNumbers.length > 0 && (
        <DashboardBulkActions
          selectedCount={selectedLeadNumbers.length}
          selectedIds={selectedLeadNumbers}
          onClearSelection={clearSelection}
          onSendToVerification={activeTab === 'verification' ? handleSendSelected : undefined}
          onSendToCompScrap={activeTab === 'compScrap' ? handleSendSelected : undefined}
          onSendToBox1={activeTab === 'box1' ? handleSendSelected : undefined}
          onSendToInstantly={activeTab === 'instantly' ? handleSendSelected : undefined}
        />
      )}

      {/* Export Modal */}
      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)}
        leads={leads}
      />

      {/* Stage Config Modal */}
      <StageConfigModal
        isOpen={isStageConfigOpen}
        onClose={() => setIsStageConfigOpen(false)}
        onSave={(configs) => {
          console.log('Configs saved:', configs);
          success('Configuración guardada', 'Las versiones del PreCrafter han sido enlazadas correctamente');
        }}
      />

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
        onCreate={handleCreateCampaign}
      />

      {/* CompScrap Import Modal */}
      <CompScrapImportModal
        isOpen={isCompScrapImportOpen}
        onClose={() => setIsCompScrapImportOpen(false)}
        onImportComplete={() => {
          fetchLeads();
          fetchMetrics();
          success('Importación completada', 'Los datos de CompScrap han sido importados correctamente');
        }}
      />
    </div>
  );
};

// Main Dashboard Page with Notification Provider
export const DashboardPage: React.FC = () => {
  return (
    <NotificationProvider>
      <DashboardContent />
    </NotificationProvider>
  );
};

export default DashboardPage;

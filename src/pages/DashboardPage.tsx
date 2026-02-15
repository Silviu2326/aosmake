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
  Settings,
  Link,
  Plus,
  Play,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bot
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
import { FieldConfigModal, FieldConfig, DataTransformRule } from '../components/dashboard/FieldConfigModal';
import { AutomationManagerModal } from '../components/dashboard/AutomationManagerModal';
import { 
  getFieldConfig, 
  saveFieldConfig as saveFieldConfigApi, 
  getTransformRules, 
  saveTransformRules as saveTransformRulesApi 
} from '../services/settingsApi';

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
  const [isFieldConfigOpen, setIsFieldConfigOpen] = useState(false);
  const [isAutomationManagerOpen, setIsAutomationManagerOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [fieldConfig, setFieldConfig] = useState<FieldConfig[]>([]);
  const [transformRules, setTransformRules] = useState<DataTransformRule[]>([]);
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [blockSize, setBlockSize] = useState<string>('50');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  // Load field configuration from server on mount, with localStorage fallback
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to load from server first
        const [serverFields, serverRules] = await Promise.all([
          getFieldConfig(),
          getTransformRules()
        ]);

        if (serverFields.length > 0) {
          setFieldConfig(serverFields);
        } else {
          // Fallback to localStorage if server is empty
          const savedConfig = localStorage.getItem('dashboardFieldConfig');
          if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            setFieldConfig(parsed);
            // Sync to server for future use
            await saveFieldConfigApi(parsed).catch(err => 
              console.error('Failed to sync field config to server:', err)
            );
          }
        }

        if (serverRules.length > 0) {
          setTransformRules(serverRules);
        } else {
          const savedRules = localStorage.getItem('dashboardTransformRules');
          if (savedRules) {
            const parsed = JSON.parse(savedRules);
            setTransformRules(parsed);
            // Sync to server for future use
            await saveTransformRulesApi(parsed).catch(err => 
              console.error('Failed to sync transform rules to server:', err)
            );
          }
        }
      } catch (error) {
        console.error('Error loading settings from server:', error);
        // Fallback to localStorage on any error
        const savedConfig = localStorage.getItem('dashboardFieldConfig');
        const savedRules = localStorage.getItem('dashboardTransformRules');
        if (savedConfig) {
          try {
            setFieldConfig(JSON.parse(savedConfig));
          } catch (e) {
            console.error('Error parsing localStorage config:', e);
          }
        }
        if (savedRules) {
          try {
            setTransformRules(JSON.parse(savedRules));
          } catch (e) {
            console.error('Error parsing localStorage rules:', e);
          }
        }
      }
    };

    loadSettings();
  }, []);

  // Save field configuration and transform rules to server (and localStorage as backup)
  const handleSaveFieldConfig = async (fields: FieldConfig[], rules?: DataTransformRule[]) => {
    try {
      // Save to server
      await saveFieldConfigApi(fields);
      if (rules) {
        await saveTransformRulesApi(rules);
      }

      // Update local state
      setFieldConfig(fields);
      if (rules) {
        setTransformRules(rules);
      }

      // Also save to localStorage as backup/caching
      localStorage.setItem('dashboardFieldConfig', JSON.stringify(fields));
      if (rules) {
        localStorage.setItem('dashboardTransformRules', JSON.stringify(rules));
      }

      const rulesCount = rules?.filter(r => r.enabled).length || 0;
      success(
        'Configuración guardada',
        `Campos actualizados${rulesCount > 0 ? ` • ${rulesCount} regla(s) activa(s)` : ''}`
      );
    } catch (error) {
      console.error('Error saving field config to server:', error);
      
      // Still save to localStorage so user doesn't lose their settings
      setFieldConfig(fields);
      localStorage.setItem('dashboardFieldConfig', JSON.stringify(fields));
      if (rules) {
        setTransformRules(rules);
        localStorage.setItem('dashboardTransformRules', JSON.stringify(rules));
      }
      
      success(
        'Configuración guardada (local)',
        'No se pudo sincronizar con el servidor. Los cambios se guardaron localmente.'
      );
    }
  };

  // Reset filters when changing tabs - filtros inteligentes según el pipeline
  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    
    // Filtros que reflejan el estado REAL de cada etapa en el flujo del pipeline
    if (tabId === 'verification') {
      // Input Verificación: Leads exportados que aún no están verificados
      setFilters({
        ...filters,
        verificationStatus: VerificationStatus.PENDING,
        compScrapStatus: 'all',
        box1Status: 'all',
        instantlyStatus: 'all',
        hasCompUrl: 'all'
      });
    } else if (tabId === 'compScrap') {
      // Input CompScrap: Leads verificados que aún no tienen compScrap
      setFilters({
        ...filters,
        verificationStatus: VerificationStatus.VERIFIED,
        compScrapStatus: CompScrapStatus.PENDING,
        box1Status: 'all',
        instantlyStatus: 'all',
        hasCompUrl: 'all'
      });
    } else if (tabId === 'box1') {
      // Input Box1: Leads scrappeados que aún no tienen Box1
      setFilters({
        ...filters,
        verificationStatus: 'all',
        compScrapStatus: CompScrapStatus.SCRAPED,
        box1Status: Box1Status.PENDING,
        instantlyStatus: 'all',
        hasCompUrl: 'all'
      });
    } else if (tabId === 'emailStock') {
      // Email Stock: Leads en stock (generalmente FIT que no son HIT)
      setFilters({
        ...filters,
        verificationStatus: 'all',
        compScrapStatus: 'all',
        box1Status: 'all',
        instantlyStatus: InstantlyStatus.STOCK,
        hasCompUrl: 'all'
      });
    } else if (tabId === 'instantly') {
      // Input Instantly: Leads HIT que aún no están en Instantly
      setFilters({
        ...filters,
        verificationStatus: 'all',
        compScrapStatus: 'all',
        box1Status: Box1Status.HIT,
        instantlyStatus: InstantlyStatus.PENDING,
        hasCompUrl: 'all'
      });
    } else {
      // For overview, analytics, and master tabs, reset status filters
      setFilters({
        ...filters,
        verificationStatus: 'all',
        compScrapStatus: 'all',
        box1Status: 'all',
        instantlyStatus: 'all',
        hasCompUrl: 'all'
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

  // Tabs organizados en grupos
  const viewTabs = [
    { id: 'overview', label: 'Resumen', icon: <BarChart3 size={16} />, count: 0, color: 'gray' },
    { id: 'analytics', label: 'Análisis', icon: <TrendingUp size={16} />, count: 0, color: 'gray' },
  ] as const;

  const pipelineTabs = [
    { id: 'master', label: 'Tabla Master', icon: <Users size={16} />, count: filteredLeads.length, color: 'slate' },
    { id: 'verification', label: 'Verificación', icon: <CheckCircle size={16} />, count: verificationCount, color: 'green' },
    { id: 'compScrap', label: 'CompScrap', icon: <BarChart3 size={16} />, count: compScrapCount, color: 'blue' },
    { id: 'box1', label: 'Box1', icon: <TrendingUp size={16} />, count: box1Count, color: 'purple' },
    { id: 'emailStock', label: 'Email Stock', icon: <Mail size={16} />, count: emailStockCount, color: 'cyan' },
    { id: 'instantly', label: 'Instantly', icon: <ArrowRight size={16} />, count: instantlyCount, color: 'orange' }
  ] as const;

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
      <div className="mb-6 space-y-4">
        {/* Header Principal Mejorado */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-gradient-to-r from-surface via-surface to-surface/80 border border-border/50 rounded-2xl">
          {/* Izquierda: Icono + Título + Stats */}
          <div className="flex items-start gap-4">
            {/* Icono Grande con fondo */}
            <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/20 border border-accent/20">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-7 h-7 text-accent"
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                <path d="M3 4h18l-3 6H6l-3-6z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10l-2 6h16l-2-6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 16l-1.5 4h9l-1.5-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Título y subtítulo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                  Pipeline
                </h1>
                {/* Badge de estado */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Activo
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                Gestión y seguimiento de leads en tiempo real
              </p>
              
              {/* Stats rápidas */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-semibold text-white">{formatNumber(metrics.totalExport)}</span>
                  <span className="text-xs text-gray-500">Total Leads</span>
                </div>
                <div className="w-px h-4 bg-border/50" />
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-semibold text-green-400">{formatPercent(metrics.conversionRatio)}</span>
                  <span className="text-xs text-gray-500">Conversión</span>
                </div>
                <div className="w-px h-4 bg-border/50 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-lg font-semibold text-accent">{formatNumber(metrics.estimatedFitHit)}</span>
                  <span className="text-xs text-gray-500">Est. FIT&HIT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Derecha: Campaña activa */}
          {selectedCampaign && (
            <div className="flex items-center gap-3 px-4 py-3 bg-background/50 rounded-xl border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Campaña Activa</p>
                <p className="text-sm font-medium text-white truncate max-w-[200px]">{selectedCampaign.name}</p>
              </div>
              <span className="ml-2 px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
                {selectedCampaign.leadCount}
              </span>
            </div>
          )}
        </div>
        
        {/* Toolbar organizada con grupos */}
        <div className="flex flex-wrap items-center gap-3 p-2 bg-surface/50 border border-border/50 rounded-xl">
          
          {/* Grupo: Campaña */}
          <div className="flex items-center gap-1 bg-background rounded-lg p-1 border border-border/50">
            <div className="relative">
              <button
                onClick={() => setIsCampaignOpen(!isCampaignOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/5 transition-colors"
              >
                <Users size={16} className="text-accent" />
                <span className="max-w-[120px] truncate">{selectedCampaign?.name || 'Seleccionar Campaña'}</span>
                <ChevronDown size={14} className={`transition-transform ${isCampaignOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCampaignOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-xl z-50">
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
            <div className="w-px h-5 bg-border/50" />
            <button
              onClick={() => setIsCreateCampaignOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-md transition-colors"
              title="Nueva Campaña"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nueva</span>
            </button>
          </div>

          {/* Separador vertical en desktop */}
          <div className="hidden md:block w-px h-8 bg-border/50" />

          {/* Grupo: Configuración */}
          <div className="flex items-center gap-1 bg-background rounded-lg p-1 border border-border/50">
            <button
              onClick={() => setIsFieldConfigOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              title="Configurar Campos"
            >
              <Settings size={16} />
              <span className="hidden lg:inline">Campos</span>
            </button>
            <div className="w-px h-5 bg-border/50" />
            <button
              onClick={() => setIsStageConfigOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              title="Configurar Etapas"
            >
              <Link size={16} />
              <span className="hidden lg:inline">Etapas</span>
            </button>
          </div>

          {/* Botón destacado: Automatización */}
          <button
            onClick={() => setIsAutomationManagerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 ml-auto bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
          >
            <Bot size={18} />
            <span className="hidden sm:inline">Gestionar Automatización</span>
            <span className="sm:hidden">Automatizar</span>
          </button>
        </div>
      </div>

      {/* Tabs - Organizados en grupos */}
      <div className="flex flex-wrap items-center gap-4 mb-6 overflow-x-auto pb-2">
        
        {/* Grupo: Visualización */}
        <div className="flex items-center gap-1 p-1 bg-surface/50 border border-border/50 rounded-xl">
          {viewTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-accent text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Separador */}
        <div className="hidden sm:block w-px h-8 bg-border/50" />

        {/* Grupo: Pipeline */}
        <div className="flex items-center gap-1 p-1 bg-surface/50 border border-border/50 rounded-xl">
          {pipelineTabs.map(tab => {
            const colorClasses = {
              slate: activeTab === tab.id ? 'bg-slate-500 text-white' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-500/10',
              green: activeTab === tab.id ? 'bg-green-500 text-white' : 'text-green-400 hover:text-green-300 hover:bg-green-500/10',
              blue: activeTab === tab.id ? 'bg-blue-500 text-white' : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10',
              purple: activeTab === tab.id ? 'bg-purple-500 text-white' : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10',
              cyan: activeTab === tab.id ? 'bg-cyan-500 text-white' : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10',
              orange: activeTab === tab.id ? 'bg-orange-500 text-white' : 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10',
              gray: activeTab === tab.id ? 'bg-gray-500 text-white' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-500/10'
            }[tab.color];

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ${colorClasses}`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.label.split(' ')[0]}</span>
                {tab.count > 0 && (
                  <span className={`ml-0.5 px-1.5 py-0 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-current/20'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
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
                    onClick={() => setIsCalendarModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Calendar size={18} />
                    Calendario
                  </button>
                  <button
                    onClick={() => setIsOrganizeModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Settings size={18} />
                    Organizar
                  </button>
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

      {/* Field Configuration Modal */}
      <FieldConfigModal
        isOpen={isFieldConfigOpen}
        onClose={() => setIsFieldConfigOpen(false)}
        onSave={handleSaveFieldConfig}
        initialFields={fieldConfig}
        initialTransformRules={transformRules}
      />

      {/* Automation Manager Modal */}
      <AutomationManagerModal
        isOpen={isAutomationManagerOpen}
        onClose={() => setIsAutomationManagerOpen(false)}
      />

      {/* Organize Email Stock Modal */}
      {isOrganizeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Organizar Email Stock</h2>
            <p className="text-gray-400 mb-6">Especifica el tamaño de cada bloque para organizar los leads</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tamaño del bloque
              </label>
              <input
                type="number"
                min="1"
                value={blockSize}
                onChange={(e) => setBlockSize(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Ej: 50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Los {emailStockCount} leads se organizarán en bloques de {blockSize || '?'} leads cada uno
                ({Math.ceil(emailStockCount / (parseInt(blockSize) || 1))} bloques)
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsOrganizeModalOpen(false);
                  setBlockSize('50');
                }}
                className="px-4 py-2 bg-surface border border-border rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const size = parseInt(blockSize);
                  if (size > 0) {
                    // TODO: Implement organization logic
                    success('Organización completada', `Leads organizados en bloques de ${size}`);
                    setIsOrganizeModalOpen(false);
                    setBlockSize('50');
                  }
                }}
                disabled={!blockSize || parseInt(blockSize) <= 0}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  blockSize && parseInt(blockSize) > 0
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-surface text-gray-500 cursor-not-allowed'
                }`}
              >
                Organizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Calendario de Email Stock</h2>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-400" />
              </button>
              <h3 className="text-lg font-semibold text-white">
                {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() +
                 currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).slice(1)}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {(() => {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const today = new Date();
                const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

                const days = [];

                // Empty cells for days before month starts
                for (let i = 0; i < firstDay; i++) {
                  days.push(
                    <div key={`empty-${i}`} className="aspect-square" />
                  );
                }

                // Days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  const isToday = isCurrentMonth && today.getDate() === day;
                  days.push(
                    <button
                      key={day}
                      onClick={() => {
                        const selectedDate = new Date(year, month, day);
                        success('Fecha seleccionada', selectedDate.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }));
                      }}
                      className={`aspect-square flex items-center justify-center rounded-lg transition-colors ${
                        isToday
                          ? 'bg-blue-500 text-white font-bold'
                          : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  );
                }

                return days;
              })()}
            </div>

            {/* Calendar footer */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
                  Hoy: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1 bg-surface border border-border rounded text-gray-300 hover:bg-white/5 transition-colors"
                >
                  Ir a hoy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

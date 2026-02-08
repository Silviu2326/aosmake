import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Brain,
  Key,
  Clock,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Target,
  BarChart3,
  Activity,
  Layers,
  Gauge,
  Server,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  PieChart
} from 'lucide-react';
import { useDashboardStore } from '../stores/useDashboardStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { DashboardLead } from '../types';

// Date range types
type DatePreset = '7d' | '30d' | '90d' | '1y' | 'custom';

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

// API Key Usage Metrics
interface ApiKeyMetrics {
  id: number;
  name: string;
  calls: number;
  tokens: number;
  cost: number;
  avgLatency: number;
  errors: number;
  successRate: number;
  usageLimit: number;
  usagePercent: number;
  status: 'active' | 'limit_reached' | 'disabled';
  hourlyData: number[]; // calls per hour
  dailyData: number[]; // calls per day
}

// Data aggregation by day
interface DayData {
  date: string;
  timestamp: number;
  total: number;
  geminiCalls: number;
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  latency: number;
  cost: number;
  byApiKey: Record<number, { calls: number; tokens: number; errors: number }>;
}

// Utility: Generate date range
const getDateRange = (preset: DatePreset): DateRange => {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case '7d':
      start.setDate(end.getDate() - 7);
      return { start, end, label: 'Últimos 7 días' };
    case '30d':
      start.setDate(end.getDate() - 30);
      return { start, end, label: 'Últimos 30 días' };
    case '90d':
      start.setDate(end.getDate() - 90);
      return { start, end, label: 'Últimos 90 días' };
    case '1y':
      start.setFullYear(end.getFullYear() - 1);
      return { start, end, label: 'Último año' };
    default:
      start.setDate(end.getDate() - 30);
      return { start, end, label: 'Personalizado' };
  }
};

// Aggregate data by day
const aggregateByDay = (leads: DashboardLead[], geminiKeys: { id: number; key_name: string }[], startDate: Date, endDate: Date): DayData[] => {
  const dayMap = new Map<string, DayData>();
  
  // Initialize all days in range
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const byApiKey: Record<number, { calls: number; tokens: number; errors: number }> = {};
    geminiKeys.forEach(key => {
      byApiKey[key.id] = { calls: 0, tokens: 0, errors: 0 };
    });
    
    dayMap.set(dateStr, {
      date: dateStr,
      timestamp: current.getTime(),
      total: 0,
      geminiCalls: 0,
      tokensUsed: 0,
      inputTokens: 0,
      outputTokens: 0,
      latency: 0,
      cost: 0,
      byApiKey
    });
    current.setDate(current.getDate() + 1);
  }

  // Distribute calls among API keys (round-robin simulation)
  let keyIndex = 0;
  
  leads.forEach(lead => {
    const timestamp = lead.personTimestamp || new Date().toISOString();
    const dateStr = timestamp.split('T')[0];
    const dayData = dayMap.get(dateStr);

    if (dayData && geminiKeys.length > 0) {
      dayData.total++;
      
      // Simulate distribution across API keys (round-robin)
      const activeKeys = geminiKeys.map(k => k.id);
      
      if (lead.stepStatus?.verification === 'verified') {
        const keyId = activeKeys[keyIndex % activeKeys.length];
        dayData.byApiKey[keyId].calls += 2;
        dayData.byApiKey[keyId].tokens += 1500;
        dayData.geminiCalls += 2;
        dayData.tokensUsed += 1500;
        dayData.inputTokens += 900;
        dayData.outputTokens += 600;
        dayData.latency += 720;
        keyIndex++;
      }
      if (lead.stepStatus?.compScrap === 'scraped') {
        const keyId = activeKeys[keyIndex % activeKeys.length];
        dayData.byApiKey[keyId].calls += 1;
        dayData.byApiKey[keyId].tokens += 800;
        dayData.geminiCalls += 1;
        dayData.tokensUsed += 800;
        dayData.inputTokens += 500;
        dayData.outputTokens += 300;
        dayData.latency += 650;
        keyIndex++;
      }
      if (lead.stepStatus?.box1 === 'hit' || lead.stepStatus?.box1 === 'fit') {
        const keyId = activeKeys[keyIndex % activeKeys.length];
        dayData.byApiKey[keyId].calls += 3;
        dayData.byApiKey[keyId].tokens += 2500;
        dayData.geminiCalls += 3;
        dayData.tokensUsed += 2500;
        dayData.inputTokens += 1500;
        dayData.outputTokens += 1000;
        dayData.latency += 980;
        keyIndex++;
      }
      if (lead.stepStatus?.instantly === 'converted') {
        const keyId = activeKeys[keyIndex % activeKeys.length];
        dayData.byApiKey[keyId].calls += 1;
        dayData.byApiKey[keyId].tokens += 600;
        dayData.geminiCalls += 1;
        dayData.tokensUsed += 600;
        dayData.inputTokens += 400;
        dayData.outputTokens += 200;
        dayData.latency += 450;
        keyIndex++;
      }
      
      // Calculate cost
      dayData.cost = (dayData.inputTokens / 1000 * 0.000125) + (dayData.outputTokens / 1000 * 0.0005);
    }
  });

  return Array.from(dayMap.values()).sort((a, b) => a.timestamp - b.timestamp);
};

// Calculate metrics per API key
const calculateApiKeyMetrics = (
  data: DayData[], 
  geminiKeys: { id: number; key_name: string; is_enabled: boolean; usage_limit: number }[]
): ApiKeyMetrics[] => {
  return geminiKeys.map(key => {
    let calls = 0;
    let tokens = 0;
    let errors = 0;
    const dailyData: number[] = [];
    
    data.forEach(day => {
      const keyData = day.byApiKey[key.id] || { calls: 0, tokens: 0, errors: 0 };
      calls += keyData.calls;
      tokens += keyData.tokens;
      errors += keyData.errors;
      dailyData.push(keyData.calls);
    });
    
    // Simulate hourly distribution based on daily data
    const hourlyData = dailyData.flatMap(d => {
      const base = d / 24;
      return Array(24).fill(0).map(() => Math.max(0, Math.round(base + (Math.random() - 0.5) * base)));
    });
    
    const cost = (tokens / 1000 * 0.0003125); // average cost per token
    const successRate = calls > 0 ? ((calls - errors) / calls) * 100 : 100;
    const usagePercent = key.usage_limit > 0 ? (calls / key.usage_limit) * 100 : 0;
    
    let status: 'active' | 'limit_reached' | 'disabled' = 'active';
    if (!key.is_enabled) status = 'disabled';
    else if (usagePercent >= 100) status = 'limit_reached';
    
    return {
      id: key.id,
      name: key.key_name,
      calls,
      tokens,
      cost,
      avgLatency: 750 + Math.random() * 200,
      errors,
      successRate,
      usageLimit: key.usage_limit,
      usagePercent: Math.min(usagePercent, 100),
      status,
      hourlyData,
      dailyData
    };
  });
};

// Area Chart Component
interface AreaChartProps {
  data: DayData[];
  height?: number;
  color?: string;
  dataKey?: keyof DayData;
}

const AreaChart: React.FC<AreaChartProps> = ({ data, height = 300, color = '#06b6d4', dataKey = 'geminiCalls' }) => {
  if (data.length === 0) return null;
  const maxValue = Math.max(...data.map(d => (d[dataKey] as number) || 0), 1);
  const minValue = Math.min(...data.map(d => (d[dataKey] as number) || 0), 0);
  const range = maxValue - minValue || 1;
  const width = 100;
  const chartHeight = 80;
  const padding = 10;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = chartHeight - (((d[dataKey] as number) || 0 - minValue) / range) * (chartHeight - padding * 2) - padding;
    return { x, y, value: (d[dataKey] as number) || 0 };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${width} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
        <g className="opacity-10">
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" y1={chartHeight * (y / 100)} x2={width} y2={chartHeight * (y / 100)} stroke="currentColor" strokeWidth="0.2" />
          ))}
        </g>
        <path d={areaPath} fill={color} fillOpacity="0.2" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="0.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  label: string;
  value: number | string;
  format?: 'number' | 'decimal' | 'percent' | 'currency' | 'tokens';
  trend?: number;
  icon?: React.ReactNode;
  subtitle?: string;
  highlight?: boolean;
  color?: 'cyan' | 'purple' | 'green' | 'amber' | 'rose';
}

const MetricCard: React.FC<MetricCardProps> = ({
  label, value, format = 'number', trend, icon, subtitle, highlight = false, color = 'purple'
}) => {
  const colorClasses = {
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-400',
    green: 'from-emerald-500/10 to-green-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/10 to-yellow-500/10 border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/10 to-red-500/10 border-rose-500/30 text-rose-400'
  };

  const formattedValue = format === 'number'
    ? typeof value === 'number' ? value.toLocaleString('es-ES') : value
    : format === 'decimal'
    ? typeof value === 'number' ? value.toFixed(1) : value
    : format === 'percent'
    ? `${typeof value === 'number' ? value.toFixed(1) : value}%`
    : format === 'currency'
    ? `$${typeof value === 'number' ? value.toFixed(4) : value}`
    : format === 'tokens'
    ? `${typeof value === 'number' ? (value / 1000).toFixed(1) : value}K`
    : String(value);

  const trendIcon = trend === undefined ? null : trend > 0
    ? <ArrowUpRight size={14} className="text-emerald-400" />
    : trend < 0
    ? <ArrowDownRight size={14} className="text-rose-400" />
    : <Minus size={14} className="text-gray-500" />;

  return (
    <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
      highlight ? `bg-gradient-to-br ${colorClasses[color]}` : 'bg-surface border-white/5 hover:border-white/10'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-medium">{label}</div>
          {icon && <div className="text-gray-600">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <div className={`text-3xl font-light tracking-tight ${highlight ? `text-${color}-400` : 'text-white'}`}>
            {formattedValue}
          </div>
          {trendIcon}
        </div>
        {(trend !== undefined || subtitle) && (
          <div className="flex items-center gap-2 text-xs">
            {trend !== undefined && (
              <span className={`font-mono ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-rose-400' : 'text-gray-500'}`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
            )}
            {subtitle && <span className="text-gray-600">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// API Key Card Component
interface ApiKeyCardProps {
  apiKey: ApiKeyMetrics;
  totalCalls: number;
  onReset?: () => void;
}

const ApiKeyCard: React.FC<ApiKeyCardProps> = ({ apiKey, totalCalls, onReset }) => {
  const percentOfTotal = totalCalls > 0 ? (apiKey.calls / totalCalls) * 100 : 0;
  const isNearLimit = apiKey.usagePercent >= 80 && apiKey.usagePercent < 100;
  const isAtLimit = apiKey.usagePercent >= 100;
  
  const statusColors = {
    active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    limit_reached: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    disabled: 'border-gray-500/30 bg-gray-500/10 text-gray-400'
  };

  const statusIcons = {
    active: <CheckCircle size={16} className="text-emerald-400" />,
    limit_reached: <AlertTriangle size={16} className="text-amber-400" />,
    disabled: <Server size={16} className="text-gray-400" />
  };

  return (
    <div className={`bg-surface border rounded-xl p-5 transition-all hover:scale-[1.01] ${
      apiKey.status === 'disabled' ? 'border-gray-500/20 opacity-60' : 'border-white/5 hover:border-white/10'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Key size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{apiKey.name}</h3>
            <p className="text-xs text-gray-500">ID: {apiKey.id}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusColors[apiKey.status]}`}>
          {statusIcons[apiKey.status]}
          <span className="text-xs font-medium capitalize">{apiKey.status === 'limit_reached' ? 'Límite alcanzado' : apiKey.status === 'disabled' ? 'Deshabilitada' : 'Activa'}</span>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Uso del límite</span>
          <span className={`font-mono ${isAtLimit ? 'text-amber-400' : isNearLimit ? 'text-yellow-400' : 'text-white'}`}>
            {apiKey.calls.toLocaleString()} / {apiKey.usageLimit.toLocaleString()}
          </span>
        </div>
        <div className="h-3 bg-black/30 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isAtLimit ? 'bg-amber-500' : isNearLimit ? 'bg-yellow-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(apiKey.usagePercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{apiKey.usagePercent.toFixed(1)}% utilizado</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Llamadas totales</p>
          <p className="text-xl font-semibold text-white">{apiKey.calls.toLocaleString()}</p>
          <p className="text-xs text-gray-600">{percentOfTotal.toFixed(1)}% del total</p>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Tokens consumidos</p>
          <p className="text-xl font-semibold text-cyan-400">{(apiKey.tokens / 1000).toFixed(1)}K</p>
          <p className="text-xs text-gray-600">~${apiKey.cost.toFixed(4)}</p>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Tasa de éxito</p>
          <p className="text-xl font-semibold text-emerald-400">{apiKey.successRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-600">{apiKey.errors} errores</p>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Latencia promedio</p>
          <p className="text-xl font-semibold text-amber-400">{Math.round(apiKey.avgLatency)}ms</p>
          <p className="text-xs text-gray-600">por llamada</p>
        </div>
      </div>

      {/* Mini Chart */}
      {apiKey.dailyData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-2">Actividad diaria</p>
          <div className="flex items-end gap-1 h-12">
            {apiKey.dailyData.slice(-30).map((value, i) => {
              const max = Math.max(...apiKey.dailyData, 1);
              const height = (value / max) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-purple-500/30 hover:bg-purple-500/50 rounded-t transition-all"
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`${value} llamadas`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      {onReset && (
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            Resetear contador
          </button>
        </div>
      )}
    </div>
  );
};

// Main Statistics Page
export const StatisticsPage: React.FC = () => {
  const { leads, fetchLeads } = useDashboardStore();
  const { geminiKeys, fetchAllKeys } = useSettingsStore();
  const [preset, setPreset] = useState<DatePreset>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchAllKeys();
  }, [fetchLeads, fetchAllKeys]);

  const currentRange = useMemo(() => {
    if (preset === 'custom' && customStart && customEnd) {
      return { start: new Date(customStart), end: new Date(customEnd), label: 'Personalizado' };
    }
    return getDateRange(preset);
  }, [preset, customStart, customEnd]);

  const currentData = useMemo(
    () => aggregateByDay(leads, geminiKeys, currentRange.start, currentRange.end),
    [leads, geminiKeys, currentRange]
  );

  const apiKeyMetrics = useMemo(
    () => calculateApiKeyMetrics(currentData, geminiKeys),
    [currentData, geminiKeys]
  );

  const totalStats = useMemo(() => {
    const totalCalls = apiKeyMetrics.reduce((sum, k) => sum + k.calls, 0);
    const totalTokens = apiKeyMetrics.reduce((sum, k) => sum + k.tokens, 0);
    const totalCost = apiKeyMetrics.reduce((sum, k) => sum + k.cost, 0);
    const totalErrors = apiKeyMetrics.reduce((sum, k) => sum + k.errors, 0);
    const avgSuccessRate = apiKeyMetrics.length > 0 
      ? apiKeyMetrics.reduce((sum, k) => sum + k.successRate, 0) / apiKeyMetrics.length 
      : 0;
    return { totalCalls, totalTokens, totalCost, totalErrors, avgSuccessRate };
  }, [apiKeyMetrics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchLeads(), fetchAllKeys()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExport = () => {
    setIsExporting(true);
    const headers = ['Fecha', 'Total Calls', 'Total Tokens', 'Costo'];
    apiKeyMetrics.forEach(key => {
      headers.push(`${key.name} - Calls`, `${key.name} - Tokens`);
    });
    
    const rows = currentData.map(day => {
      const row = [day.date, day.geminiCalls, day.tokensUsed, day.cost];
      apiKeyMetrics.forEach(key => {
        const keyData = day.byApiKey[key.id] || { calls: 0, tokens: 0 };
        row.push(keyData.calls, keyData.tokens);
      });
      return row;
    });
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gemini-api-keys-stats-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(false), 1000);
  };

  return (
    <div className="min-h-screen bg-background text-white p-6">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto mb-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">Estadísticas por API Key</h1>
              <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-400 font-mono flex items-center gap-1">
                <Key size={12} /> Gemini
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Consumo detallado de cada API key de Gemini configurada
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-white/5 hover:border-white/10 rounded-lg transition-all disabled:opacity-50 text-sm">
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} /> Actualizar
            </button>
            <button onClick={handleExport} disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-all disabled:opacity-50 text-sm text-purple-400">
              <Download size={16} /> {isExporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-white/5 rounded-lg">
            <Calendar size={16} className="text-gray-600" />
            <span className="text-xs text-gray-500 uppercase">Período:</span>
          </div>
          {(['7d', '30d', '90d', '1y'] as DatePreset[]).map(p => (
            <button key={p} onClick={() => setPreset(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                preset === p && preset !== 'custom'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-surface text-gray-400 border border-white/5 hover:border-white/10'
              }`}>
              {p === '7d' ? '7 días' : p === '30d' ? '30 días' : p === '90d' ? '90 días' : '1 año'}
            </button>
          ))}
          <div className="flex items-center gap-2">
            <input type="date" value={customStart}
              onChange={(e) => { setCustomStart(e.target.value); if (e.target.value && customEnd) setPreset('custom'); }}
              className="px-3 py-2 bg-surface border border-white/5 rounded-lg text-sm text-gray-300 focus:border-purple-500/50" />
            <span className="text-gray-600">—</span>
            <input type="date" value={customEnd}
              onChange={(e) => { setCustomEnd(e.target.value); if (customStart && e.target.value) setPreset('custom'); }}
              className="px-3 py-2 bg-surface border border-white/5 rounded-lg text-sm text-gray-300 focus:border-purple-500/50" />
          </div>
          <div className="ml-auto text-xs text-gray-600 font-mono">
            {currentRange.start.toLocaleDateString('es-ES')} — {currentRange.end.toLocaleDateString('es-ES')}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard label="Total Llamadas" value={totalStats.totalCalls} format="number"
            icon={<Zap size={18} />} highlight color="purple" />
          <MetricCard label="Total Tokens" value={totalStats.totalTokens} format="tokens"
            icon={<Activity size={18} />} />
          <MetricCard label="Costo Total" value={totalStats.totalCost} format="currency"
            icon={<DollarSign size={18} />} color="green" />
          <MetricCard label="Tasa de Éxito" value={totalStats.avgSuccessRate} format="percent"
            icon={<Target size={18} />} color="cyan" />
          <MetricCard label="API Keys Activas" value={apiKeyMetrics.filter(k => k.status === 'active').length} format="number"
            icon={<Key size={18} />} color="amber" subtitle={`de ${apiKeyMetrics.length} configuradas`} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-400" /> Llamadas Totales por Día
            </h3>
            <AreaChart data={currentData} height={240} color="#a855f7" dataKey="geminiCalls" />
          </div>
          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Activity size={18} className="text-cyan-400" /> Tokens Consumidos por Día
            </h3>
            <AreaChart data={currentData} height={240} color="#06b6d4" dataKey="tokensUsed" />
          </div>
        </div>

        {/* API Keys Usage Distribution */}
        <div className="bg-surface border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <PieChart size={18} className="text-purple-400" /> Distribución de Uso entre API Keys
          </h3>
          <div className="flex items-center gap-8">
            {/* Pie Chart Simulation */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {apiKeyMetrics.reduce((acc, key, i) => {
                  const prevPercent = acc.total;
                  const percent = totalStats.totalCalls > 0 ? (key.calls / totalStats.totalCalls) * 100 : 0;
                  const colors = ['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
                  
                  if (percent > 0) {
                    const startAngle = (prevPercent / 100) * 360;
                    const endAngle = ((prevPercent + percent) / 100) * 360;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    
                    const x1 = 50 + 40 * Math.cos(startRad);
                    const y1 = 50 + 40 * Math.sin(startRad);
                    const x2 = 50 + 40 * Math.cos(endRad);
                    const y2 = 50 + 40 * Math.sin(endRad);
                    
                    const largeArc = percent > 50 ? 1 : 0;
                    
                    acc.paths.push(
                      <path
                        key={key.id}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={colors[i % colors.length]}
                        stroke="#111"
                        strokeWidth="2"
                      />
                    );
                  }
                  acc.total += percent;
                  return acc;
                }, { paths: [] as React.ReactNode[], total: 0 }).paths}
                <circle cx="50" cy="50" r="25" fill="#111" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold">{apiKeyMetrics.length}</p>
                  <p className="text-xs text-gray-500">Keys</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {apiKeyMetrics.map((key, i) => {
                const colors = ['bg-purple-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                const percent = totalStats.totalCalls > 0 ? (key.calls / totalStats.totalCalls) * 100 : 0;
                return (
                  <div key={key.id} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{key.name}</span>
                        <span className="text-sm text-gray-400">{key.calls.toLocaleString()} llamadas ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="h-1.5 bg-black/30 rounded-full overflow-hidden mt-1">
                        <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* API Keys Detailed Cards */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Key size={18} className="text-purple-400" /> Consumo por API Key
          </h3>
          {apiKeyMetrics.length === 0 ? (
            <div className="bg-surface border border-white/5 rounded-xl p-8 text-center">
              <Key size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No hay API keys configuradas</p>
              <p className="text-sm text-gray-500 mt-2">Ve a Configuración para añadir tus keys de Gemini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiKeyMetrics.map(apiKey => (
                <ApiKeyCard
                  key={apiKey.id}
                  apiKey={apiKey}
                  totalCalls={totalStats.totalCalls}
                  onReset={() => console.log('Reset key', apiKey.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Daily Breakdown Table */}
        <div className="bg-surface border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Desglose Diario por API Key</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-400">Total</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-400">Tokens</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-400">Costo</th>
                  {apiKeyMetrics.map(key => (
                    <th key={key.id} className="text-right py-3 px-4 font-medium text-purple-400">{key.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.slice().reverse().map(day => (
                  <tr key={day.date} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-gray-400">{day.date}</td>
                    <td className="py-3 px-4 text-right font-mono text-white">{day.geminiCalls}</td>
                    <td className="py-3 px-4 text-right font-mono text-cyan-400">{(day.tokensUsed / 1000).toFixed(1)}K</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">${day.cost.toFixed(4)}</td>
                    {apiKeyMetrics.map(key => {
                      const keyData = day.byApiKey[key.id] || { calls: 0 };
                      return (
                        <td key={key.id} className="py-3 px-4 text-right font-mono text-gray-400">
                          {keyData.calls > 0 ? keyData.calls : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;

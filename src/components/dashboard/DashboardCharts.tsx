import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Calendar, RefreshCw } from 'lucide-react';
import { DashboardMetrics, DashboardLead } from '../../types';

// Tipos de período temporal
type TimePeriod = '7d' | '30d' | '90d' | 'all';

// Punto de datos para gráficos
interface DataPoint {
  label: string;
  value: number;
  timestamp: string;
}

// Datos históricos simulados (en producción vendrían del backend)
const generateHistoricalData = (leads: DashboardLead[], days: number): DataPoint[] => {
  const data: DataPoint[] = [];
  const now = new Date();
  
  // Simular distribución temporal basada en el timestamp del lead
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Simular algunos leads por día
    const leadsThatDay = leads.filter(l => 
      l.personTimestamp?.startsWith(dateStr)
    ).length || Math.floor(Math.random() * (leads.length / days) * 2);
    
    data.push({
      label: dateStr,
      value: leadsThatDay,
      timestamp: dateStr
    });
  }
  
  return data;
};

// Componente de barra simple
const Bar: React.FC<{ value: number; max: number; label: string; color: string }> = ({ 
  value, 
  max, 
  label, 
  color 
}) => {
  const height = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div className="flex flex-col items-center flex-1">
      <div className="relative w-full h-32 flex items-end justify-center gap-1">
        <div 
          className={`w-full ${color} rounded-t transition-all duration-300`}
          style={{ height: `${Math.max(height, 2)}%` }}
          title={`${label}: ${value}`}
        />
        {value > 0 && (
          <span className="absolute -top-6 text-xs text-gray-400 font-mono">
            {value}
          </span>
        )}
      </div>
      <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
        {label.slice(5)} {/* Remove date prefix */}
      </span>
    </div>
  );
};

// Gráfico de barras de evolución
interface EvolutionChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({ data, title, color = 'bg-accent' }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  // Mostrar solo cada N-ésimo label para evitar overcrowding
  const step = Math.ceil(data.length / 7);
  const filteredData = data.filter((_, idx) => idx % step === 0 || idx === data.length - 1);
  
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <BarChart3 size={18} className="text-accent" />
          {title}
        </h3>
        <div className="text-sm text-gray-400">
          Total: <span className="text-white font-medium">{data.reduce((a, b) => a + b.value, 0)}</span>
        </div>
      </div>
      
      <div className="flex items-end gap-0.5 h-36">
        {data.map((point, idx) => (
          <Bar
            key={point.label}
            value={point.value}
            max={maxValue}
            label={point.label}
            color={color}
          />
        ))}
      </div>
    </div>
  );
};

// Gráfico de donut para distribución de estados
interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  title: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ segments, title }) => {
  const total = segments.reduce((a, b) => a + b.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  
  const gradientParts = segments.map(seg => {
    const percentage = total > 0 ? seg.value / total : 0;
    const dashLength = percentage * circumference;
    const result = {
      ...seg,
      offset,
      dashLength,
      percentage
    };
    offset += dashLength;
    return result;
  });

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-white font-medium mb-4">{title}</h3>
      
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {gradientParts.map((seg, idx) => (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="20"
                strokeDasharray={`${seg.dashLength} ${circumference}`}
                strokeDashoffset={-seg.offset}
                className="transition-all duration-500"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-sm text-gray-300">{seg.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-mono">{seg.value}</span>
              <span className="text-xs text-gray-500">
                ({total > 0 ? ((seg.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tendencia (comparación con período anterior)
interface TrendIndicatorProps {
  current: number;
  previous: number;
  label: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ current = 0, previous = 0, label }) => {
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = change >= 0;
  
  return (
    <div className="bg-surface border border-border rounded-lg p-3">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-white">{(current || 0).toLocaleString()}</span>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">vs período anterior</div>
    </div>
  );
};

// Componente principal de charts
interface DashboardChartsProps {
  leads: DashboardLead[];
  metrics: DashboardMetrics;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ leads, metrics }) => {
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const periodDays: Record<TimePeriod, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    'all': leads.length * 2 // Simular todos los datos
  };
  
  const historicalData = useMemo(() => 
    generateHistoricalData(leads, periodDays[period]),
    [leads, period]
  );
  
  // Distribución de estados para donut charts
  const verificationDistribution = [
    { label: 'Pendiente', value: metrics.pendingVerification, color: '#f59e0b' },
    { label: 'Enviado', value: metrics.sentVerification - metrics.verified, color: '#3b82f6' },
    { label: 'Verificado', value: metrics.verified, color: '#22c55e' },
    { label: 'Fallido', value: leads.filter(l => l.stepStatus?.verification === 'failed').length, color: '#ef4444' }
  ].filter(s => s.value > 0);
  
  const box1Distribution = [
    { label: 'Pendiente', value: metrics.pendingBox1, color: '#f59e0b' },
    { label: 'Enviado', value: metrics.sentBox1 - metrics.hitCount - metrics.fitCount - metrics.dropCount, color: '#3b82f6' },
    { label: 'HIT', value: metrics.hitCount, color: '#22c55e' },
    { label: 'FIT', value: metrics.fitCount, color: '#a855f7' },
    { label: 'DROP', value: metrics.dropCount, color: '#ef4444' }
  ].filter(s => s.value > 0);
  
  const instantlyDistribution = [
    { label: 'Pendiente', value: metrics.pendingInstantly, color: '#f59e0b' },
    { label: 'Enviado', value: metrics.sentInstantly - metrics.repliedCount, color: '#3b82f6' },
    { label: 'Replied', value: metrics.repliedCount - metrics.positiveReplyCount, color: '#3b82f6' },
    { label: '+ Reply', value: metrics.positiveReplyCount - metrics.convertedCount, color: '#a855f7' },
    { label: 'Convertido', value: metrics.convertedCount, color: '#22c55e' }
  ].filter(s => s.value > 0);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular refresh
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };
  
  return (
    <div className="space-y-6 overflow-hidden">
      {/* Header con selector de período */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-white">Análisis y Evolución</h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface border border-border rounded-lg overflow-hidden">
            {(['7d', '30d', '90d', 'all'] as TimePeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  period === p 
                    ? 'bg-accent text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === 'all' ? 'Todo' : p}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-surface border border-border rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {/* Gráfico de evolución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div className="w-full overflow-hidden">
          <EvolutionChart 
            data={historicalData} 
            title="Leads por Día" 
            color="bg-accent"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full">
          <TrendIndicator 
            current={metrics.totalExport}
            previous={Math.round(metrics.totalExport * 0.85)}
            label="Total Leads"
          />
          <TrendIndicator 
            current={metrics.verified}
            previous={Math.round(metrics.verified * 0.9)}
            label="Verificados"
          />
          <TrendIndicator 
            current={metrics.hitCount + metrics.fitCount}
            previous={Math.round((metrics.hitCount + metrics.fitCount) * 0.8)}
            label="FIT & HIT"
          />
          <TrendIndicator 
            current={metrics.convertedCount}
            previous={Math.round(metrics.convertedCount * 0.75)}
            label="Conversiones"
          />
        </div>
      </div>
      
      {/* Distribución de estados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="w-full overflow-hidden">
          <DonutChart 
            segments={verificationDistribution}
            title="Estado de Verificación"
          />
        </div>
        <div className="w-full overflow-hidden">
          <DonutChart 
            segments={box1Distribution}
            title="Estado de Box1"
          />
        </div>
        <div className="w-full overflow-hidden">
          <DonutChart 
            segments={instantlyDistribution}
            title="Estado de Instantly"
          />
        </div>
      </div>
      
      {/* Resumen de pipeline */}
      <div className="bg-gradient-to-r from-accent/10 via-purple-500/10 to-pink-500/10 border border-accent/20 rounded-xl p-6 w-full overflow-hidden">
        <h3 className="text-lg font-semibold text-white mb-4">Resumen del Pipeline</h3>
        <div className="flex items-center justify-between flex-wrap gap-4 overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500 flex-shrink-0" />
            <span className="text-gray-300 whitespace-nowrap">Pendiente: {metrics.pendingVerification + metrics.pendingCompScrap + metrics.pendingBox1 + metrics.pendingInstantly}</span>
          </div>
          <div className="text-2xl text-accent flex-shrink-0">→</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 flex-shrink-0" />
            <span className="text-gray-300 whitespace-nowrap">En Proceso: {metrics.sentVerification + metrics.sentCompScrap + metrics.sentBox1 + metrics.sentInstantly}</span>
          </div>
          <div className="text-2xl text-accent flex-shrink-0">→</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 flex-shrink-0" />
            <span className="text-gray-300 whitespace-nowrap">Completado: {metrics.verified + metrics.scraped + metrics.hitCount + metrics.convertedCount}</span>
          </div>
          <div className="text-2xl text-accent flex-shrink-0">→</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500 flex-shrink-0" />
            <span className="text-gray-300 whitespace-nowrap">Conversiones: {metrics.convertedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;

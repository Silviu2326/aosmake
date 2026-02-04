import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { VerificationStatus, CompScrapStatus, Box1Status, InstantlyStatus } from '../../types';

export interface FilterState {
  search: string;
  verificationStatus: VerificationStatus | 'all';
  compScrapStatus: CompScrapStatus | 'all';
  box1Status: Box1Status | 'all';
  instantlyStatus: InstantlyStatus | 'all';
  hasCompUrl: boolean | 'all';
  dateRange: { start: string; end: string };
}

interface DashboardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  leadCount: number;
  filteredCount: number;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  leadCount,
  filteredCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = {
    verification: [
      { value: 'all', label: 'Todos' },
      { value: 'pending', label: 'Pendiente' },
      { value: 'sent', label: 'Enviado' },
      { value: 'verified', label: 'Verificado' },
      { value: 'failed', label: 'Fallido' }
    ],
    compScrap: [
      { value: 'all', label: 'Todos' },
      { value: 'pending', label: 'Pendiente' },
      { value: 'sent', label: 'Enviado' },
      { value: 'scraped', label: 'Scraped' },
      { value: 'failed', label: 'Fallido' }
    ],
    box1: [
      { value: 'all', label: 'Todos' },
      { value: 'pending', label: 'Pendiente' },
      { value: 'sent', label: 'Enviado' },
      { value: 'fit', label: 'FIT' },
      { value: 'hit', label: 'HIT' },
      { value: 'drop', label: 'DROP' },
      { value: 'no_fit', label: 'NO FIT' },
      { value: 'failed', label: 'Fallido' }
    ],
    instantly: [
      { value: 'all', label: 'Todos' },
      { value: 'pending', label: 'Pendiente' },
      { value: 'sent', label: 'Enviado' },
      { value: 'replied', label: 'Replied' },
      { value: 'positive_reply', label: 'Positive Reply' },
      { value: 'converted', label: 'Convertido' },
      { value: 'bounced', label: 'Bounced' }
    ],
    hasCompUrl: [
      { value: 'all', label: 'Todos' },
      { value: 'true', label: 'Con URL' },
      { value: 'false', label: 'Sin URL' }
    ]
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      verificationStatus: 'all',
      compScrapStatus: 'all',
      box1Status: 'all',
      instantlyStatus: 'all',
      hasCompUrl: 'all',
      dateRange: { start: '', end: '' }
    });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.verificationStatus !== 'all' ||
    filters.compScrapStatus !== 'all' ||
    filters.box1Status !== 'all' ||
    filters.instantlyStatus !== 'all' ||
    filters.hasCompUrl !== 'all' ||
    filters.dateRange.start !== '' ||
    filters.dateRange.end !== '';

  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por LeadNumber, nombre, empresa, email..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-accent"
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            hasActiveFilters 
              ? 'border-accent text-accent bg-accent/10' 
              : 'border-border text-gray-300 hover:bg-white/5'
          }`}
        >
          <Filter size={18} />
          Filtros
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-accent rounded-full" />
          )}
          <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
            Limpiar
          </button>
        )}

        <div className="text-gray-400 text-sm">
          <span className="text-accent font-medium">{filteredCount}</span>
          {' / '}
          <span>{leadCount}</span>
          {' leads'}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-border">
          {/* Verification Status */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">Estado Verificación</label>
            <select
              value={filters.verificationStatus}
              onChange={(e) => onFiltersChange({ ...filters, verificationStatus: e.target.value as VerificationStatus | 'all' })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-gray-300 focus:outline-none focus:border-accent text-sm"
            >
              {statusOptions.verification.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* CompScrap Status */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">Estado CompScrap</label>
            <select
              value={filters.compScrapStatus}
              onChange={(e) => onFiltersChange({ ...filters, compScrapStatus: e.target.value as CompScrapStatus | 'all' })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-gray-300 focus:outline-none focus:border-accent text-sm"
            >
              {statusOptions.compScrap.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Box1 Status */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">Estado Box1</label>
            <select
              value={filters.box1Status}
              onChange={(e) => onFiltersChange({ ...filters, box1Status: e.target.value as Box1Status | 'all' })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-gray-300 focus:outline-none focus:border-accent text-sm"
            >
              {statusOptions.box1.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Instantly Status */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">Estado Instantly</label>
            <select
              value={filters.instantlyStatus}
              onChange={(e) => onFiltersChange({ ...filters, instantlyStatus: e.target.value as InstantlyStatus | 'all' })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-gray-300 focus:outline-none focus:border-accent text-sm"
            >
              {statusOptions.instantly.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Has CompUrl */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">CompUrl</label>
            <select
              value={filters.hasCompUrl === 'all' ? 'all' : filters.hasCompUrl ? 'true' : 'false'}
              onChange={(e) => onFiltersChange({ ...filters, hasCompUrl: e.target.value === 'all' ? 'all' : e.target.value === 'true' })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-gray-300 focus:outline-none focus:border-accent text-sm"
            >
              {statusOptions.hasCompUrl.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">Fecha Desde</label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => onFiltersChange({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-gray-300 focus:outline-none focus:border-accent text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;

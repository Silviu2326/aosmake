import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Eye, ExternalLink, MousePointer2, X } from 'lucide-react';
import { DashboardLead } from '../../types';

export type ColumnId = 
  | 'select'
  | 'LeadNumber'
  | 'TargetID'
  | 'firstName'
  | 'lastName'
  | 'personTitle'
  | 'companyName'
  | 'email'
  | 'verificationStatus'
  | 'compScrapStatus'
  | 'box1Status'
  | 'instantlyStatus'
  | 'compUrl'
  | 'actions';

export interface Column {
  id: ColumnId;
  label: string;
  width?: string;
  sortable?: boolean;
  visible?: boolean;
}

interface DashboardLeadTableProps {
  leads: DashboardLead[];
  selectedIds: string[];
  onSelect: (leadNumber: string) => void;
  onSelectAll: (select: boolean) => void;
  onSelectFirstN?: (n: number) => void;
  onViewLead?: (lead: DashboardLead) => void;
  columns?: Column[];
}

const defaultColumns: Column[] = [
  { id: 'select', label: '', width: '40px', visible: true },
  { id: 'LeadNumber', label: 'Lead #', width: '100px', sortable: true, visible: true },
  { id: 'firstName', label: 'Nombre', width: '120px', sortable: true, visible: true },
  { id: 'lastName', label: 'Apellido', width: '120px', sortable: true, visible: true },
  { id: 'personTitle', label: 'Título', sortable: true, visible: true },
  { id: 'companyName', label: 'Empresa', sortable: true, visible: true },
  { id: 'email', label: 'Email', sortable: true, visible: true },
  { id: 'verificationStatus', label: 'Verificación', width: '120px', sortable: true, visible: true },
  { id: 'compScrapStatus', label: 'CompScrap', width: '120px', sortable: true, visible: true },
  { id: 'box1Status', label: 'Box1', width: '100px', sortable: true, visible: true },
  { id: 'instantlyStatus', label: 'Instantly', width: '110px', sortable: true, visible: true },
  { id: 'compUrl', label: 'CompUrl', width: '150px', visible: true },
  { id: 'actions', label: '', width: '60px', visible: true }
];

export const DashboardLeadTable: React.FC<DashboardLeadTableProps> = ({
  leads,
  selectedIds,
  onSelect,
  onSelectAll,
  onViewLead,
  columns = defaultColumns
}) => {
  const [sortColumn, setSortColumn] = useState<ColumnId | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnVisibility, setColumnVisibility] = useState<Record<ColumnId, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: col.visible ?? true }), {} as Record<ColumnId, boolean>)
  );

  const handleSort = (columnId: ColumnId) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const sortedLeads = useMemo(() => {
    if (!sortColumn) return leads;

    return [...leads].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortColumn) {
        case 'LeadNumber':
          aVal = a.LeadNumber;
          bVal = b.LeadNumber;
          break;
        case 'firstName':
          aVal = a.firstName?.toLowerCase();
          bVal = b.firstName?.toLowerCase();
          break;
        case 'lastName':
          aVal = a.lastName?.toLowerCase();
          bVal = b.lastName?.toLowerCase();
          break;
        case 'personTitle':
          aVal = a.personTitle?.toLowerCase();
          bVal = b.personTitle?.toLowerCase();
          break;
        case 'companyName':
          aVal = (a.companyName || a.companyName_fromP)?.toLowerCase();
          bVal = (b.companyName || b.companyName_fromP)?.toLowerCase();
          break;
        case 'email':
          aVal = a.email?.toLowerCase();
          bVal = b.email?.toLowerCase();
          break;
        case 'verificationStatus':
          aVal = a.stepStatus?.verification;
          bVal = b.stepStatus?.verification;
          break;
        case 'compScrapStatus':
          aVal = a.stepStatus?.compScrap;
          bVal = b.stepStatus?.compScrap;
          break;
        case 'box1Status':
          aVal = a.stepStatus?.box1;
          bVal = b.stepStatus?.box1;
          break;
        case 'instantlyStatus':
          aVal = a.stepStatus?.instantly;
          bVal = b.stepStatus?.instantly;
          break;
        default:
          return 0;
      }

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [leads, sortColumn, sortDirection]);

  const allSelected = leads.length > 0 && selectedIds.length === leads.length;

  const getStatusBadge = (status: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const statusLabels: Record<string, { label: string; type: 'success' | 'warning' | 'error' | 'info' }> = {
      verified: { label: 'Verificado', type: 'success' },
      sent: { label: 'Enviado', type: 'info' },
      pending: { label: 'Pendiente', type: 'warning' },
      failed: { label: 'Fallido', type: 'error' },
      scraped: { label: 'Scraped', type: 'success' },
      hit: { label: 'HIT', type: 'success' },
      fit: { label: 'FIT', type: 'success' },
      drop: { label: 'DROP', type: 'error' },
      no_fit: { label: 'NO FIT', type: 'warning' },
      replied: { label: 'Replied', type: 'info' },
      positive_reply: { label: '+ Reply', type: 'success' },
      converted: { label: 'CONVERTIDO', type: 'success' },
      bounced: { label: 'Bounced', type: 'error' }
    };

    const config = statusLabels[status] || { label: status, type: 'info' as const };
    
    const colors = {
      success: 'bg-green-500/20 text-green-400',
      warning: 'bg-yellow-500/20 text-yellow-400',
      error: 'bg-red-500/20 text-red-400',
      info: 'bg-blue-500/20 text-blue-400'
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[config.type]}`}>
        {config.label}
      </span>
    );
  };

  const visibleColumns = columns.filter(col => columnVisibility[col.id]);

  return (
    <div className="overflow-x-auto">
      {/* Quick Selection Panel */}
      {leads.length > 0 && (
        <div className="bg-surface/50 border border-border rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <MousePointer2 size={18} className="text-accent" />
              <span className="text-gray-300 text-sm font-medium">Selección rápida:</span>
              
              {/* Quick select buttons */}
              <div className="flex gap-1">
                {[10, 25, 50, 100].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      const leadNumbers = leads.slice(0, num).map(l => l.LeadNumber);
                      leadNumbers.forEach(leadNumber => {
                        if (!selectedIds.includes(leadNumber)) {
                          onSelect(leadNumber);
                        }
                      });
                    }}
                    disabled={num > leads.length}
                    className="px-3 py-1.5 text-xs bg-accent/20 text-accent hover:bg-accent/30 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => onSelectAll(true)}
                  className="px-3 py-1.5 text-xs bg-accent/20 text-accent hover:bg-accent/30 rounded transition-colors"
                >
                  Todos ({leads.length})
                </button>
              </div>
            </div>

            {/* Custom number input */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={leads.length}
                placeholder="Nº"
                className="w-20 px-3 py-1.5 text-sm bg-background border border-border rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const num = parseInt(e.currentTarget.value);
                    if (num > 0 && num <= leads.length) {
                      const leadNumbers = leads.slice(0, num).map(l => l.LeadNumber);
                      leadNumbers.forEach(leadNumber => {
                        if (!selectedIds.includes(leadNumber)) {
                          onSelect(leadNumber);
                        }
                      });
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                  const num = parseInt(input?.value || '0');
                  if (num > 0 && num <= leads.length) {
                    const leadNumbers = leads.slice(0, num).map(l => l.LeadNumber);
                    leadNumbers.forEach(leadNumber => {
                      if (!selectedIds.includes(leadNumber)) {
                        onSelect(leadNumber);
                      }
                    });
                    input.value = '';
                  }
                }}
                className="px-3 py-1.5 text-xs bg-accent text-white rounded hover:bg-accent/80 transition-colors"
              >
                Seleccionar
              </button>
            </div>

            {/* Selected count */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-accent text-sm font-medium">
                  {selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => onSelectAll(false)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  title="Limpiar selección"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Column visibility toggle */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400 text-sm">Columnas:</span>
        <div className="flex flex-wrap gap-2">
          {columns.filter(col => col.id !== 'select').map(col => (
            <label
              key={col.id}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                columnVisibility[col.id]
                  ? 'bg-accent/20 text-accent'
                  : 'bg-surface text-gray-500'
              }`}
            >
              <input
                type="checkbox"
                checked={columnVisibility[col.id]}
                onChange={() => setColumnVisibility(prev => ({
                  ...prev,
                  [col.id]: !prev[col.id]
                }))}
                className="sr-only"
              />
              {col.label}
            </label>
          ))}
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {visibleColumns.map(col => (
              <React.Fragment key={col.id}>
                {col.id === 'select' && (
                  <th className="text-left p-3" style={{ width: col.width }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => onSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-accent"
                    />
                  </th>
                )}
                {col.sortable && col.visible && (
                  <th
                    className="text-left p-3 text-gray-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors"
                    style={{ width: col.width }}
                    onClick={() => handleSort(col.id)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortColumn === col.id && (
                        sortDirection === 'asc' 
                          ? <ChevronUp size={14} />
                          : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                )}
                {!col.sortable && col.visible && col.id !== 'select' && (
                  <th
                    className="text-left p-3 text-gray-400 font-medium whitespace-nowrap"
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                )}
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedLeads.map((lead, idx) => (
            <tr
              key={lead.LeadNumber || idx}
              className={`border-b border-border/50 hover:bg-white/5 transition-colors ${
                selectedIds.includes(lead.LeadNumber) ? 'bg-accent/10' : ''
              }`}
            >
              {visibleColumns.map(col => (
                <React.Fragment key={col.id}>
                  {/* Checkbox column */}
                  {col.id === 'select' && (
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.LeadNumber)}
                        onChange={() => onSelect(lead.LeadNumber)}
                        className="w-4 h-4 rounded border-border bg-accent"
                      />
                    </td>
                  )}

                  {/* Lead Number */}
                  {col.id === 'LeadNumber' && col.visible && (
                    <td className="p-3 text-white font-mono">{lead.LeadNumber}</td>
                  )}

                  {/* First Name */}
                  {col.id === 'firstName' && col.visible && (
                    <td className="p-3 text-white">{lead.firstName}</td>
                  )}

                  {/* Last Name */}
                  {col.id === 'lastName' && col.visible && (
                    <td className="p-3 text-white">{lead.lastName}</td>
                  )}

                  {/* Person Title */}
                  {col.id === 'personTitle' && col.visible && (
                    <td className="p-3 text-gray-300 truncate max-w-[200px]" title={lead.personTitle}>
                      {lead.personTitle}
                    </td>
                  )}

                  {/* Company Name */}
                  {col.id === 'companyName' && col.visible && (
                    <td className="p-3 text-white font-medium truncate max-w-[150px]">
                      {lead.companyName || lead.companyName_fromP}
                    </td>
                  )}

                  {/* Email */}
                  {col.id === 'email' && col.visible && (
                    <td className="p-3 text-gray-300 truncate max-w-[200px]" title={lead.email}>
                      {lead.email}
                    </td>
                  )}

                  {/* Verification Status */}
                  {col.id === 'verificationStatus' && col.visible && (
                    <td className="p-3">
                      {getStatusBadge(lead.stepStatus?.verification)}
                    </td>
                  )}

                  {/* CompScrap Status */}
                  {col.id === 'compScrapStatus' && col.visible && (
                    <td className="p-3">
                      {getStatusBadge(lead.stepStatus?.compScrap)}
                    </td>
                  )}

                  {/* Box1 Status */}
                  {col.id === 'box1Status' && col.visible && (
                    <td className="p-3">
                      {getStatusBadge(lead.stepStatus?.box1)}
                    </td>
                  )}

                  {/* Instantly Status */}
                  {col.id === 'instantlyStatus' && col.visible && (
                    <td className="p-3">
                      {getStatusBadge(lead.stepStatus?.instantly)}
                    </td>
                  )}

                  {/* CompUrl */}
                  {col.id === 'compUrl' && col.visible && (
                    <td className="p-3">
                      {lead.compUrl ? (
                        <a
                          href={lead.compUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 truncate max-w-[150px]"
                          title={lead.compUrl}
                        >
                          <ExternalLink size={12} />
                          {lead.compUrl.replace(/^https?:\/\//, '').slice(0, 20)}...
                        </a>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  )}

                  {/* Actions */}
                  {col.id === 'actions' && col.visible && (
                    <td className="p-3">
                      <button
                        onClick={() => onViewLead?.(lead)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  )}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {leads.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay leads para mostrar
        </div>
      )}
    </div>
  );
};

export default DashboardLeadTable;

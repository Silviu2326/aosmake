import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, Check } from 'lucide-react';
import { DashboardLead } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: DashboardLead[];
}

type ExportFormat = 'csv' | 'json' | 'excel';

interface ExportOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const exportOptions: ExportOption[] = [
  {
    id: 'csv',
    label: 'CSV',
    description: 'Compatible con Excel, Google Sheets',
    icon: <FileSpreadsheet size={24} />
  },
  {
    id: 'json',
    label: 'JSON',
    description: 'Estructura de datos completa',
    icon: <FileText size={24} />
  },
  {
    id: 'excel',
    label: 'Excel',
    description: 'Archivo .xlsx con formato',
    icon: <FileSpreadsheet size={24} />
  }
];

interface ColumnOption {
  key: string;
  label: string;
  category: 'identifiers' | 'personal' | 'company' | 'email' | 'status' | 'outputs';
  selected: boolean;
}

const defaultColumns: ColumnOption[] = [
  // Identifiers
  { key: 'LeadNumber', label: 'Lead Number', category: 'identifiers', selected: true },
  { key: 'TargetID', label: 'Target ID', category: 'identifiers', selected: true },
  // Personal
  { key: 'firstName', label: 'Nombre', category: 'personal', selected: true },
  { key: 'lastName', label: 'Apellido', category: 'personal', selected: true },
  { key: 'personTitle', label: 'Título', category: 'personal', selected: false },
  { key: 'personLocation', label: 'Ubicación', category: 'personal', selected: false },
  // Company
  { key: 'companyName', label: 'Empresa', category: 'company', selected: true },
  { key: 'companyName_fromP', label: 'Empresa (Prospect)', category: 'company', selected: false },
  { key: 'industry', label: 'Industria', category: 'company', selected: false },
  { key: 'employeeCount', label: 'Empleados', category: 'company', selected: false },
  { key: 'website', label: 'Website', category: 'company', selected: false },
  // Email
  { key: 'email', label: 'Email', category: 'email', selected: true },
  { key: 'email_validation', label: 'Validación Email', category: 'email', selected: false },
  // Status
  { key: 'verificationStatus', label: 'Estado Verificación', category: 'status', selected: true },
  { key: 'compScrapStatus', label: 'Estado CompScrap', category: 'status', selected: true },
  { key: 'box1Status', label: 'Estado Box1', category: 'status', selected: true },
  { key: 'instantlyStatus', label: 'Estado Instantly', category: 'status', selected: true },
  { key: 'compUrl', label: 'CompUrl', category: 'status', selected: true }
];

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, leads }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [columns, setColumns] = useState<ColumnOption[]>(defaultColumns);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [dateInFilename, setDateInFilename] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const toggleColumn = (key: string) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, selected: !col.selected } : col
    ));
  };

  const selectCategory = (category: ColumnOption['category']) => {
    setColumns(prev => prev.map(col => 
      col.category === category ? { ...col, selected: true } : col
    ));
  };

  const deselectCategory = (category: ColumnOption['category']) => {
    setColumns(prev => prev.map(col => 
      col.category === category ? { ...col, selected: false } : col
    ));
  };

  const generateFilename = () => {
    const base = 'dashboard_export';
    const date = dateInFilename ? `_${new Date().toISOString().split('T')[0]}` : '';
    const ext = selectedFormat === 'excel' ? 'xlsx' : selectedFormat;
    return `${base}${date}.${ext}`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const selectedColumns = columns.filter(c => c.selected);
      const data = leads.map(lead => {
        const row: Record<string, any> = {};
        selectedColumns.forEach(col => {
          if (col.key.includes('Status')) {
            row[col.label] = (lead as any).stepStatus?.[col.key.replace('Status', '')] || '';
          } else {
            row[col.label] = (lead as any)[col.key] || '';
          }
        });
        return row;
      });

      let content: string;
      let mimeType: string;

      if (selectedFormat === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
      } else {
        // CSV format
        const headers = selectedColumns.map(c => c.label);
        const rows = data.map(row => 
          headers.map(h => {
            const value = row[h];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        );
        content = includeHeaders ? [headers.join(','), ...rows].join('\n') : rows.join('\n');
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Simular pequeño delay para UX
      await new Promise(resolve => setTimeout(resolve, 500));
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  const categories = ['identifiers', 'personal', 'company', 'email', 'status', 'outputs'] as const;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-white">Exportar Datos</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Formato de Exportación</label>
            <div className="grid grid-cols-3 gap-3">
              {exportOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setSelectedFormat(option.id)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedFormat === option.id
                      ? 'bg-accent/20 border-accent text-white'
                      : 'border-border text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <div className="mb-2">{option.icon}</div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs opacity-70">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">Columnas a Exportar</label>
              <div className="flex gap-2">
                <button
                  onClick={() => selectCategory('identifiers')}
                  className="text-xs text-accent hover:underline"
                >
                  Seleccionar todos
                </button>
              </div>
            </div>
            
            {/* Category tabs */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => selectCategory(cat)}
                  className="px-3 py-1 text-xs bg-surface border border-border rounded-full text-gray-400 hover:text-white whitespace-nowrap"
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {columns.map(col => (
                <label
                  key={col.key}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    col.selected ? 'bg-accent/10' : 'hover:bg-white/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={col.selected}
                    onChange={() => toggleColumn(col.key)}
                    className="w-4 h-4 rounded border-border bg-accent"
                  />
                  <span className={`text-sm ${col.selected ? 'text-white' : 'text-gray-500'}`}>
                    {col.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Opciones</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-accent"
                />
                <span className="text-gray-300 text-sm">Incluir encabezados de columna</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dateInFilename}
                  onChange={(e) => setDateInFilename(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-accent"
                />
                <span className="text-gray-300 text-sm">Incluir fecha en nombre de archivo</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Vista Previa del Archivo</label>
            <div className="bg-background border border-border rounded-lg p-3 font-mono text-xs text-gray-400">
              {generateFilename()}
              <br />
              <span className="text-accent">{leads.length}</span> registros
              <span className="mx-2">|</span>
              <span className="text-green-400">{columns.filter(c => c.selected).length}</span> columnas
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || columns.filter(c => c.selected).length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download size={18} />
                Exportar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;

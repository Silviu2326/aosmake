import React, { useState } from 'react';
import { 
  Send, 
  Trash2, 
  Download, 
  X, 
  Check, 
  MoreHorizontal,
  Eye,
  Mail,
  RefreshCw
} from 'lucide-react';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant: 'primary' | 'danger' | 'secondary';
  action: () => void;
}

interface DashboardBulkActionsProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onSendToVerification?: () => void;
  onSendToCompScrap?: () => void;
  onSendToBox1?: () => void;
  onSendToInstantly?: () => void;
  onDeleteSelected?: () => void;
  onExportSelected?: () => void;
}

export const DashboardBulkActions: React.FC<DashboardBulkActionsProps> = ({
  selectedCount,
  selectedIds,
  onClearSelection,
  onSendToVerification,
  onSendToCompScrap,
  onSendToBox1,
  onSendToInstantly,
  onDeleteSelected,
  onExportSelected
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: () => void) => {
    setIsProcessing(true);
    try {
      await action();
    } finally {
      setIsProcessing(false);
      onClearSelection();
    }
  };

  if (selectedCount === 0) return null;

  const actions: BulkAction[] = [
    ...(onSendToVerification ? [{
      id: 'verification',
      label: 'Enviar a Verificación',
      icon: <Check size={16} />,
      variant: 'primary' as const,
      action: onSendToVerification
    }] : []),
    ...(onSendToCompScrap ? [{
      id: 'compScrap',
      label: 'Enviar a CompScrap',
      icon: <RefreshCw size={16} />,
      variant: 'primary' as const,
      action: onSendToCompScrap
    }] : []),
    ...(onSendToBox1 ? [{
      id: 'box1',
      label: 'Enviar a Box1',
      icon: <Eye size={16} />,
      variant: 'primary' as const,
      action: onSendToBox1
    }] : []),
    ...(onSendToInstantly ? [{
      id: 'instantly',
      label: 'Enviar a Instantly',
      icon: <Mail size={16} />,
      variant: 'primary' as const,
      action: onSendToInstantly
    }] : []),
    ...(onExportSelected ? [{
      id: 'export',
      label: 'Exportar seleccionados',
      icon: <Download size={16} />,
      variant: 'secondary' as const,
      action: onExportSelected
    }] : []),
    ...(onDeleteSelected ? [{
      id: 'delete',
      label: 'Eliminar seleccionados',
      icon: <Trash2 size={16} />,
      variant: 'danger' as const,
      action: onDeleteSelected
    }] : [])
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 shadow-lg z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Selection info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={true}
                onChange={onClearSelection}
                className="w-5 h-5 rounded border-border bg-accent"
              />
              <span className="text-white font-medium">
                {selectedCount} {selectedCount === 1 ? 'lead seleccionado' : 'leads seleccionados'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <MoreHorizontal size={16} />
                Acciones
                <ChevronIcon expanded={isExpanded} />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <>
                {actions.slice(0, 3).map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.action)}
                    disabled={isProcessing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      action.variant === 'primary'
                        ? 'bg-accent text-white hover:bg-accent/90'
                        : action.variant === 'danger'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                        : 'bg-surface border border-border text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
                
                {actions.length > 3 && (
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-gray-300 hover:bg-white/5 transition-colors">
                      <MoreHorizontal size={16} />
                      Más
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                      <div className="bg-surface border border-border rounded-lg shadow-xl py-2 min-w-[200px]">
                        {actions.slice(3).map(action => (
                          <button
                            key={action.id}
                            onClick={() => handleAction(action.action)}
                            disabled={isProcessing}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors ${
                              action.variant === 'danger'
                                ? 'text-red-400 hover:bg-red-500/10'
                                : 'text-gray-300 hover:bg-white/5'
                            }`}
                          >
                            {action.icon}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {actions.slice(0, 2).map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.action)}
                    disabled={isProcessing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      action.variant === 'primary'
                        ? 'bg-accent text-white hover:bg-accent/90'
                        : 'bg-surface border border-border text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
                {actions.length > 2 && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <MoreHorizontal size={16} />
                    Ver más
                  </button>
                )}
              </>
            )}

            <div className="h-8 w-px bg-border mx-2" />

            <button
              onClick={onClearSelection}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
              Cancelar
            </button>
          </div>
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <div className="mt-4 flex items-center justify-center gap-2 text-accent">
            <div className="animate-spin w-5 h-5 border-2 border-accent border-t-transparent rounded-full" />
            <span>Procesando {selectedCount} leads...</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Chevron icon helper
const ChevronIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Inline selection bar for compact view
export const SelectionBar: React.FC<{
  count: number;
  onClear: () => void;
  onAction: () => void;
  actionLabel?: string;
}> = ({ count, onClear, onAction, actionLabel = 'Procesar' }) => (
  <div className="flex items-center gap-3 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg">
    <input
      type="checkbox"
      checked={true}
      onChange={onClear}
      className="w-4 h-4 rounded border-border bg-accent"
    />
    <span className="text-accent font-medium">{count} seleccionados</span>
    <button
      onClick={onAction}
      className="ml-auto flex items-center gap-1 px-3 py-1 bg-accent text-white text-sm rounded hover:bg-accent/90 transition-colors"
    >
      <Send size={14} />
      {actionLabel}
    </button>
    <button
      onClick={onClear}
      className="p-1 text-gray-400 hover:text-white transition-colors"
    >
      <X size={16} />
    </button>
  </div>
);

export default DashboardBulkActions;

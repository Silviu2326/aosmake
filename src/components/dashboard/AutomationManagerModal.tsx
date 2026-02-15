import { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  BarChart3, 
  Mail, 
  Settings,
  AlertTriangle,
  Save,
  Loader2
} from 'lucide-react';
import { 
  getAllStageAutomationSettings, 
  batchUpsertStageAutomationSettings,
  StageAutomationSetting 
} from '../../services/stageAutomationApi';

interface AutomationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PipelineStage {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const stages: PipelineStage[] = [
  {
    id: 'compScrap',
    name: 'Input CompScrap',
    description: 'Scraping de información de compañías',
    icon: <BarChart3 size={24} />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'emailStock',
    name: 'Email Stock',
    description: 'Gestión de leads en stock',
    icon: <Mail size={24} />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20'
  }
];

export const AutomationManagerModal: React.FC<AutomationManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [worrisomeLeads, setWorrisomeLeads] = useState<Record<string, string>>({
    compScrap: '',
    emailStock: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load data from Supabase when modal opens
  useEffect(() => {
    if (isOpen) {
      loadStageAutomationSettings();
    }
  }, [isOpen]);

  const loadStageAutomationSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const settings = await getAllStageAutomationSettings();
      
      // Convert array to record for easier access
      const worrisomeMap: Record<string, string> = {};
      settings.forEach(setting => {
        worrisomeMap[setting.stage_id] = setting.worrisome_leads.toString();
      });
      
      setWorrisomeLeads(prev => ({
        ...prev,
        ...worrisomeMap
      }));
    } catch (err) {
      console.error('Error loading stage automation settings:', err);
      setError('Error al cargar la configuración desde Supabase');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      const settings: Omit<StageAutomationSetting, 'id' | 'created_at' | 'updated_at'>[] = stages.map(stage => ({
        stage_id: stage.id,
        stage_name: stage.name,
        worrisome_leads: parseInt(worrisomeLeads[stage.id] || '0', 10) || 0,
        is_automated: false,
        automation_config: {}
      }));
      
      await batchUpsertStageAutomationSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving stage automation settings:', err);
      setError('Error al guardar en Supabase');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorrisomeLeadsChange = (stageId: string, value: string) => {
    // Only allow numeric values
    if (value === '' || /^\d*$/.test(value)) {
      setWorrisomeLeads(prev => ({
        ...prev,
        [stageId]: value
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-xl p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Gestionar Automatización</h2>
            <p className="text-gray-400 text-sm mt-1">
              Configura las etapas del pipeline (guardado en stage_automation_settings)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm">Configuración guardada correctamente en Supabase</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-accent animate-spin" />
            <span className="ml-3 text-gray-400">Cargando desde Supabase...</span>
          </div>
        ) : (
          <>
            {/* Pipeline Stages Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings size={20} className="text-accent" />
                Etapas del Pipeline
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className={`relative p-5 rounded-xl border ${stage.bgColor} transition-all hover:scale-[1.02] group`}
                  >
                    {/* Stage Number */}
                    <div className="absolute top-3 right-3 text-xs font-bold text-gray-500">
                      #{index + 1}
                    </div>

                    {/* Icon and Title */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`${stage.color}`}>
                        {stage.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${stage.color}`}>
                          {stage.name}
                        </h4>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4">
                      {stage.description}
                    </p>

                    {/* Worrisome Leads Input */}
                    <div className="mb-4 p-3 bg-background/50 rounded-lg border border-border">
                      <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                        <AlertTriangle size={16} className="text-yellow-400" />
                        Leads Preocupantes
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={worrisomeLeads[stage.id] || ''}
                        onChange={(e) => handleWorrisomeLeadsChange(stage.id, e.target.value)}
                        placeholder="0"
                        disabled={isSaving}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Número de leads que requieren atención especial
                      </p>
                    </div>

                    {/* Automation Status */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                        <span className="text-xs text-gray-400">Sin automatizar</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Note */}
            <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-gray-400">
                <span className="text-accent font-medium">Nota:</span> Los datos se guardan en la tabla <code className="bg-background px-1 py-0.5 rounded text-accent">stage_automation_settings</code> de Supabase.
              </p>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar en Supabase
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

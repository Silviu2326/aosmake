import React, { useState, useEffect } from 'react';
import { X, Link, Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface StageConfig {
  id: string;
  name: string;
  precrafterVersionId: string | null;
  enabled: boolean;
}

interface StageConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (configs: StageConfig[]) => void;
}

const STAGES: StageConfig[] = [
  { id: 'verification', name: 'Verificación', precrafterVersionId: null, enabled: true },
  { id: 'compScrap', name: 'Company Scrap', precrafterVersionId: null, enabled: true },
  { id: 'box1', name: 'Box1 / FIT', precrafterVersionId: null, enabled: true },
  { id: 'instantly', name: 'Instantly / Respuesta', precrafterVersionId: null, enabled: true },
];

export const StageConfigModal: React.FC<StageConfigModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [configs, setConfigs] = useState<StageConfig[]>(STAGES);
  const [availableVersions, setAvailableVersions] = useState<{ version: number; label?: string; folder?: string; created_at?: string; createdAt?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar versiones guardadas y versiones disponibles del PreCrafter
  useEffect(() => {
    if (isOpen) {
      loadConfigs();
      loadVersions();
    }
  }, [isOpen]);

  const loadConfigs = async () => {
    try {
      const response = await fetch('https://backendaos-production.up.railway.app/api/workflows/precrafter/versions');
      if (response.ok) {
        const data = await response.json();
        // Cargar configuraciones guardadas
        const savedConfigs = JSON.parse(localStorage.getItem('stageConfigs') || 'null');
        if (savedConfigs) {
          setConfigs(savedConfigs);
        }
      }
    } catch (e) {
      console.error('Error loading configs:', e);
    }
  };

  // Datos de ejemplo por defecto
  const defaultVersions = [
    { version: 1, label: 'v1.0 - Verificación Estándar', created_at: new Date().toISOString() },
    { version: 2, label: 'v2.0 - Con Búsqueda de Emails', created_at: new Date().toISOString() },
    { version: 3, label: 'v3.0 - Verificación Avanzada', created_at: new Date().toISOString() },
    { version: 4, label: 'v4.0 - Latest', created_at: new Date().toISOString() },
  ];

  const loadVersions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://backendaos-production.up.railway.app/api/workflows/precrafter/versions');
      if (response.ok) {
        const data = await response.json();
        // La API devuelve directamente el array o { versions: [...] }
        const apiVersions = Array.isArray(data) ? data : (data.versions || []);
        console.log('Versiones cargadas:', apiVersions);
        if (apiVersions.length === 0) {
          // Si no hay versiones en la API, usar las por defecto
          setAvailableVersions(defaultVersions);
        } else {
          setAvailableVersions(apiVersions);
        }
      } else {
        // Si no hay backend, usar datos de ejemplo
        setAvailableVersions(defaultVersions);
      }
    } catch (e) {
      // Datos de ejemplo si falla la conexión
      setAvailableVersions(defaultVersions);
      setError('No se pudo conectar al servidor. Usando versiones locales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionChange = (stageId: string, versionId: string) => {
    setConfigs(prev => prev.map(config => 
      config.id === stageId 
        ? { ...config, precrafterVersionId: versionId || null }
        : config
    ));
  };

  const handleToggleEnabled = (stageId: string) => {
    setConfigs(prev => prev.map(config =>
      config.id === stageId
        ? { ...config, enabled: !config.enabled }
        : config
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Guardar en localStorage
      localStorage.setItem('stageConfigs', JSON.stringify(configs));
      onSave(configs);
      onClose();
    } catch (e) {
      setError('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadVersion = async (versionId: string, stageId: string) => {
    try {
      const response = await fetch(`https://backendaos-production.up.railway.app/api/workflows/precrafter/versions/${versionId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Cargando versión ${versionId} para etapa ${stageId}:`, data);
        // Aquí se podría aplicar el workflow al nodo correspondiente
      }
    } catch (e) {
      console.error('Error loading version:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Link size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Configuración de Etapas</h2>
              <p className="text-sm text-gray-400">Enlaza versiones del PreCrafter con cada etapa del pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-500" />
              <p className="text-sm text-yellow-400">{error}</p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={24} className="text-accent animate-spin" />
              <span className="ml-2 text-gray-400">Cargando versiones...</span>
            </div>
          )}

          {/* Stages List */}
          {!isLoading && (
            <div className="space-y-4">
              {configs.map((config) => (
                <div 
                  key={config.id}
                  className={`p-4 rounded-lg border transition-all ${
                    config.enabled 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white/5 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        config.enabled 
                          ? 'bg-accent/20 text-accent' 
                          : 'bg-gray-600/20 text-gray-500'
                      }`}>
                        {config.enabled ? (
                          <CheckCircle size={16} />
                        ) : (
                          <AlertCircle size={16} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{config.name}</h3>
                        <p className="text-xs text-gray-500">
                          {config.precrafterVersionId 
                            ? `Versión enlazada: ${availableVersions.find(v => String(v.version) === config.precrafterVersionId)?.label || config.precrafterVersionId}`
                            : 'Sin versión enlazada'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleEnabled(config.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.enabled ? 'bg-accent' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {config.enabled && (
                    <div className="ml-11">
                      <label className="block text-sm text-gray-400 mb-2">
                        Versión del PreCrafter
                      </label>
                      <select
                        value={config.precrafterVersionId || ''}
                        onChange={(e) => handleVersionChange(config.id, e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                      >
                        <option value="">-- Seleccionar versión --</option>
                        {availableVersions.map((version) => (
                          <option key={version.version} value={version.version}>
                            {version.label ? `${version.label}` : `v${version.version} - ${new Date(version.created_at || version.createdAt).toLocaleDateString()}`}
                          </option>
                        ))}
                      </select>

                      {config.precrafterVersionId && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleLoadVersion(config.precrafterVersionId!, config.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg text-sm transition-colors"
                          >
                            <Database size={14} />
                            Cargar Workflow
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
              <Database size={14} />
              Acerca de las versiones
            </h4>
            <p className="text-sm text-gray-400">
              Las versiones del PreCrafter son workflows guardados que se aplicarán automáticamente 
              a los leads en cada etapa del pipeline. Puedes crear y gestionar versiones desde el 
              Panel del PreCrafter usando el botón de "Clone".
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-surface/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageConfigModal;

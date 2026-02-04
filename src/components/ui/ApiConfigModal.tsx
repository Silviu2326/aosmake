import React, { useState, useEffect } from 'react';
import { X, Settings, Key, Eye, EyeOff, CheckCircle2, AlertCircle, Save, Trash2, Plus } from 'lucide-react';

interface ApiConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ApiKeyEntry {
    id: string;
    key: string;
    label: string;
}

interface ApiConfig {
    gemini: ApiKeyEntry[];
    perplexity: ApiKeyEntry[];
}

const API_PROVIDERS = [
    {
        id: 'gemini',
        name: 'Google Gemini',
        placeholder: 'AIza...',
        description: 'Para nodos LLM con modelos Gemini',
        docsUrl: 'https://aistudio.google.com/app/apikey',
        color: 'blue'
    },
    {
        id: 'perplexity',
        name: 'Perplexity',
        placeholder: 'pplx-...',
        description: 'Para nodos de búsqueda con Perplexity',
        docsUrl: 'https://www.perplexity.ai/settings/api',
        color: 'cyan'
    }
];

const STORAGE_KEY = 'aos_studio_api_config_v2';

const createEmptyConfig = (): ApiConfig => ({
    gemini: [],
    perplexity: []
});

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
    isOpen,
    onClose
}) => {
    const [config, setConfig] = useState<ApiConfig>(createEmptyConfig());
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [saved, setSaved] = useState(false);
    const [testingKey, setTestingKey] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({});

    // Load config from localStorage
    useEffect(() => {
        if (isOpen) {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setConfig(parsed);
                } catch (e) {
                    console.error('Error loading API config:', e);
                    setConfig(createEmptyConfig());
                }
            } else {
                setConfig(createEmptyConfig());
            }
            setSaved(false);
            setTestResults({});
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

        // Also send to backend to update env
        fetch('https://backendaos-production.up.railway.app/api/config/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        }).catch(e => console.error('Error saving to backend:', e));

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const toggleVisibility = (keyId: string) => {
        const newVisible = new Set(visibleKeys);
        if (newVisible.has(keyId)) {
            newVisible.delete(keyId);
        } else {
            newVisible.add(keyId);
        }
        setVisibleKeys(newVisible);
    };

    const addApiKey = (providerId: string) => {
        const newEntry: ApiKeyEntry = {
            id: `${providerId}_${Date.now()}`,
            key: '',
            label: `API Key ${config[providerId as keyof ApiConfig].length + 1}`
        };
        setConfig(prev => ({
            ...prev,
            [providerId]: [...prev[providerId as keyof ApiConfig], newEntry]
        }));
    };

    const updateApiKey = (providerId: string, entryId: string, updates: Partial<ApiKeyEntry>) => {
        setConfig(prev => ({
            ...prev,
            [providerId]: prev[providerId as keyof ApiConfig].map(entry =>
                entry.id === entryId ? { ...entry, ...updates } : entry
            )
        }));
        // Clear test result when key changes
        if (updates.key !== undefined) {
            setTestResults(prev => ({ ...prev, [entryId]: null }));
        }
    };

    const removeApiKey = (providerId: string, entryId: string) => {
        setConfig(prev => ({
            ...prev,
            [providerId]: prev[providerId as keyof ApiConfig].filter(entry => entry.id !== entryId)
        }));
        setTestResults(prev => {
            const newResults = { ...prev };
            delete newResults[entryId];
            return newResults;
        });
    };

    const testConnection = async (providerId: string, entryId: string, apiKey: string) => {
        if (!apiKey) return;

        setTestingKey(entryId);
        setTestResults(prev => ({ ...prev, [entryId]: null }));

        try {
            const response = await fetch('https://backendaos-production.up.railway.app/api/config/test-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: providerId, apiKey })
            });

            const data = await response.json();
            setTestResults(prev => ({ ...prev, [entryId]: data.success ? 'success' : 'error' }));
        } catch (e) {
            setTestResults(prev => ({ ...prev, [entryId]: 'error' }));
        }

        setTestingKey(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-[600px] max-h-[85vh] bg-[#111] border border-white/10 rounded-lg shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Settings size={18} className="text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Configuración de APIs</h3>
                            <p className="text-[10px] text-gray-500">
                                Configura múltiples API keys para cada proveedor
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {API_PROVIDERS.map((provider) => {
                        const entries = config[provider.id as keyof ApiConfig] || [];
                        const hasKeys = entries.length > 0;

                        return (
                            <div
                                key={provider.id}
                                className={`p-4 rounded-lg border transition-colors ${
                                    hasKeys
                                        ? `border-${provider.color}-500/30 bg-${provider.color}-500/5`
                                        : 'border-white/10 bg-white/5'
                                }`}
                            >
                                {/* Provider Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Key size={14} className={hasKeys ? `text-${provider.color}-400` : 'text-gray-500'} />
                                        <span className="text-sm font-medium text-white">{provider.name}</span>
                                        {hasKeys && (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                                                {entries.length} key{entries.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <a
                                        href={provider.docsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-accent hover:underline"
                                    >
                                        Obtener API Key →
                                    </a>
                                </div>

                                <p className="text-[10px] text-gray-500 mb-3">{provider.description}</p>

                                {/* API Keys List */}
                                <div className="space-y-2">
                                    {entries.map((entry, index) => {
                                        const isVisible = visibleKeys.has(entry.id);
                                        const testResult = testResults[entry.id];
                                        const isTesting = testingKey === entry.id;

                                        return (
                                            <div key={entry.id} className="flex gap-2 items-center">
                                                {/* Label input */}
                                                <input
                                                    type="text"
                                                    value={entry.label}
                                                    onChange={(e) => updateApiKey(provider.id, entry.id, { label: e.target.value })}
                                                    className="w-24 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-[10px] text-gray-300 focus:border-accent focus:outline-none"
                                                    placeholder="Etiqueta"
                                                />

                                                {/* Key input */}
                                                <div className="flex-1 relative">
                                                    <input
                                                        type={isVisible ? 'text' : 'password'}
                                                        value={entry.key}
                                                        onChange={(e) => updateApiKey(provider.id, entry.id, { key: e.target.value })}
                                                        placeholder={provider.placeholder}
                                                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-1.5 pr-16 text-xs text-white font-mono placeholder-gray-600 focus:border-accent focus:outline-none"
                                                    />
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                        <button
                                                            onClick={() => toggleVisibility(entry.id)}
                                                            className="p-1 text-gray-500 hover:text-white transition-colors"
                                                            title={isVisible ? 'Ocultar' : 'Mostrar'}
                                                        >
                                                            {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Test button */}
                                                <button
                                                    onClick={() => testConnection(provider.id, entry.id, entry.key)}
                                                    disabled={!entry.key || isTesting}
                                                    className={`px-2 py-1.5 text-[9px] rounded border transition-colors flex items-center gap-1 ${
                                                        testResult === 'success'
                                                            ? 'border-green-500/30 bg-green-500/20 text-green-400'
                                                            : testResult === 'error'
                                                            ? 'border-red-500/30 bg-red-500/20 text-red-400'
                                                            : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {isTesting ? (
                                                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : testResult === 'success' ? (
                                                        <CheckCircle2 size={10} />
                                                    ) : testResult === 'error' ? (
                                                        <AlertCircle size={10} />
                                                    ) : (
                                                        'Test'
                                                    )}
                                                </button>

                                                {/* Delete button */}
                                                <button
                                                    onClick={() => removeApiKey(provider.id, entry.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* Add Key Button */}
                                    <button
                                        onClick={() => addApiKey(provider.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-gray-400 hover:text-white border border-dashed border-white/10 hover:border-white/30 rounded transition-colors w-full justify-center mt-2"
                                    >
                                        <Plus size={12} />
                                        Añadir API Key
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Info box */}
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-[10px] text-blue-300">
                                <p className="font-medium mb-1">Información</p>
                                <ul className="text-blue-400/80 space-y-0.5">
                                    <li>• Puedes añadir múltiples API keys para balancear las solicitudes</li>
                                    <li>• Las keys se guardan localmente en tu navegador</li>
                                    <li>• Usa la etiqueta para identificar cada key (ej: "Personal", "Trabajo")</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                    <div className="text-[10px] text-gray-500">
                        {saved && (
                            <span className="text-green-400 flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                Guardado correctamente
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 text-xs bg-accent hover:bg-accent/80 text-white rounded transition-colors"
                        >
                            <Save size={14} />
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to get stored API keys
export const getApiConfig = (): ApiConfig => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error loading API config:', e);
        }
    }
    return createEmptyConfig();
};

// Helper to get a random key for a provider (for load balancing)
export const getRandomApiKey = (providerId: 'gemini' | 'perplexity'): string | null => {
    const config = getApiConfig();
    const keys = config[providerId];
    if (!keys || keys.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex].key || null;
};

// Helper to get all keys for a provider
export const getAllApiKeys = (providerId: 'gemini' | 'perplexity'): string[] => {
    const config = getApiConfig();
    const keys = config[providerId];
    if (!keys) return [];
    return keys.map(k => k.key).filter(k => k);
};

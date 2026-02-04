import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { 
    Plus, 
    Trash2, 
    Check, 
    Eye, 
    EyeOff,
    Zap,
    Search,
    Mail,
    RefreshCw,
    Loader2
} from 'lucide-react';

export function SettingsPage() {
    const {
        geminiKeys,
        loading,
        fetchAllKeys,
        addGeminiKey,
        removeGeminiKey,
        toggleGeminiKey,
        perplexityKey,
        perplexityEnabled,
        setPerplexityKey,
        togglePerplexity,
        anymailfinderKey,
        anymailfinderEnabled,
        setAnymailfinderKey,
        toggleAnymailfinder
    } = useSettingsStore();

    const [newGeminiKey, setNewGeminiKey] = useState('');
    const [newGeminiName, setNewGeminiName] = useState('');
    const [showGeminiKey, setShowGeminiKey] = useState<number | null>(null);
    const [showPerplexityKey, setShowPerplexityKey] = useState(false);
    const [showAnymailfinderKey, setShowAnymailfinderKey] = useState(false);

    useEffect(() => {
        fetchAllKeys();
    }, [fetchAllKeys]);

    const handleAddGeminiKey = async () => {
        if (newGeminiKey.trim()) {
            await addGeminiKey(newGeminiKey.trim(), newGeminiName.trim() || `Key ${geminiKeys.length + 1}`);
            setNewGeminiKey('');
            setNewGeminiName('');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Configuración</h1>
                <p className="text-gray-400 mt-1">Gestiona tus API keys y proveedores de servicios</p>
            </div>

            {/* Gemini API Keys Section */}
            <div className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Zap className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Google Gemini API</h2>
                            <p className="text-sm text-gray-400">Añade múltiples keys para balanceo de carga</p>
                        </div>
                    </div>
                    <span className="text-sm text-gray-400">
                        {geminiKeys.filter(k => k.is_enabled).length} / {geminiKeys.length} activas
                    </span>
                </div>

                {/* Add new key */}
                <div className="flex gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="Nombre (opcional)"
                        value={newGeminiName}
                        onChange={(e) => setNewGeminiName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-accent"
                    />
                    <input
                        type="text"
                        placeholder="AIza..."
                        value={newGeminiKey}
                        onChange={(e) => setNewGeminiKey(e.target.value)}
                        className="flex-[2] px-4 py-2 bg-background border border-border rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-accent"
                    />
                    <button
                        onClick={handleAddGeminiKey}
                        disabled={!newGeminiKey.trim() || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus size={18} />
                        Añadir
                    </button>
                </div>

                {/* Keys list */}
                <div className="space-y-3">
                    {loading && geminiKeys.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-accent" size={24} />
                        </div>
                    ) : geminiKeys.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No hay keys configuradas. Añade tu primera API key de Gemini.
                        </p>
                    ) : (
                        geminiKeys.map((key) => (
                            <div 
                                key={key.id}
                                className={`flex items-center gap-4 p-4 rounded-lg border ${
                                    key.is_enabled 
                                        ? 'bg-background/50 border-border' 
                                        : 'bg-surface border-border/50 opacity-60'
                                }`}
                            >
                                <button
                                    onClick={() => toggleGeminiKey(key.id)}
                                    className={`p-2 rounded-lg transition-colors ${
                                        key.is_enabled 
                                            ? 'text-green-400 hover:bg-green-400/10' 
                                            : 'text-gray-500 hover:bg-gray-500/10'
                                    }`}
                                >
                                    <Check size={20} />
                                </button>
                                
                                <div className="flex-1">
                                    <p className="text-white font-medium">{key.key_name}</p>
                                    <p className="text-gray-500 text-sm font-mono">
                                        {showGeminiKey === key.id && key.key ? key.key : `${key.key ? key.key.substring(0, 8) + '••••••••' : '••••••••••••••••'}`}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowGeminiKey(showGeminiKey === key.id ? null : key.id)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showGeminiKey === key.id ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <button
                                    onClick={() => removeGeminiKey(key.id)}
                                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Other API Providers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Perplexity */}
                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Search className="text-orange-400" size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-medium">Perplexity</h3>
                            <p className="text-xs text-gray-500">Búsqueda web AI</p>
                        </div>
                        <button
                            onClick={() => togglePerplexity(!perplexityEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors ${
                                perplexityEnabled ? 'bg-accent' : 'bg-gray-600'
                            }`}
                        >
                            <div 
                                className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                                    perplexityEnabled ? 'translate-x-7' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type={showPerplexityKey ? 'text' : 'password'}
                            placeholder="pplx-..."
                            value={perplexityKey}
                            onChange={(e) => setPerplexityKey(e.target.value)}
                            disabled={!perplexityEnabled}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-accent disabled:opacity-50"
                        />
                        <button
                            onClick={() => setShowPerplexityKey(!showPerplexityKey)}
                            disabled={!perplexityEnabled}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
                        >
                            {showPerplexityKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* AnymailFinder */}
                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Mail className="text-green-400" size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-medium">AnymailFinder</h3>
                            <p className="text-xs text-gray-500">Búsqueda de emails</p>
                        </div>
                        <button
                            onClick={() => toggleAnymailfinder(!anymailfinderEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors ${
                                anymailfinderEnabled ? 'bg-accent' : 'bg-gray-600'
                            }`}
                        >
                            <div 
                                className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                                    anymailfinderEnabled ? 'translate-x-7' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type={showAnymailfinderKey ? 'text' : 'password'}
                            placeholder="anymailfinder_api_key..."
                            value={anymailfinderKey}
                            onChange={(e) => setAnymailfinderKey(e.target.value)}
                            disabled={!anymailfinderEnabled}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-accent disabled:opacity-50"
                        />
                        <button
                            onClick={() => setShowAnymailfinderKey(!showAnymailfinderKey)}
                            disabled={!anymailfinderEnabled}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
                        >
                            {showAnymailfinderKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <RefreshCw className="text-blue-400 mt-1" size={18} />
                    <div>
                        <p className="text-blue-400 font-medium">Acerca del balanceo de carga</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Cuando tienes múltiples API keys de Gemini configuradas, el sistema las usará 
                            de forma rotativa basándose en el uso actual. Esto ayuda a distribuir las 
                            solicitudes y evitar límites de tasa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;

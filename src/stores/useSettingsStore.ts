import { create } from 'zustand';

// Get API URL from environment or use default
const getApiUrl = () => {
    try {
        return (import.meta as unknown as { env?: { VITE_API_URL?: string } })?.env?.VITE_API_URL || 'https://backendaos-production.up.railway.app';
    } catch {
        return 'https://backendaos-production.up.railway.app';
    }
};
const API_URL = getApiUrl();

export interface GeminiKey {
    id: number;
    key: string;
    key_name: string;
    is_enabled: boolean;
    usage_count: number;
    usage_limit: number;
}

export interface SettingsState {
    geminiKeys: GeminiKey[];
    loading: boolean;
    error: string | null;
    perplexityKey: string;
    perplexityEnabled: boolean;
    anymailfinderKey: string;
    anymailfinderEnabled: boolean;
    
    fetchAllKeys: () => Promise<void>;
    addGeminiKey: (key: string, name: string) => Promise<void>;
    removeGeminiKey: (id: number) => Promise<void>;
    toggleGeminiKey: (id: number) => Promise<void>;
    setPerplexityKey: (key: string) => Promise<void>;
    togglePerplexity: (enabled: boolean) => Promise<void>;
    setAnymailfinderKey: (key: string) => Promise<void>;
    toggleAnymailfinder: (enabled: boolean) => Promise<void>;
    getRandomGeminiKey: () => GeminiKey | null;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    geminiKeys: [],
    loading: false,
    error: null,
    perplexityKey: '',
    perplexityEnabled: false,
    anymailfinderKey: '',
    anymailfinderEnabled: false,

    fetchAllKeys: async () => {
        set({ loading: true, error: null });
        try {
            const [geminiRes, perplexityRes, anymailRes] = await Promise.all([
                fetch(`${API_URL}/api/keys/gemini`),
                fetch(`${API_URL}/api/keys/perplexity`),
                fetch(`${API_URL}/api/keys/anymailfinder`)
            ]);

            const geminiData = await geminiRes.json();
            const perplexityData = await perplexityRes.json();
            const anymailData = await anymailRes.json();

            const savedKeys = JSON.parse(localStorage.getItem('geminiKeys') || '{}');

            set({
                geminiKeys: geminiData.success ? geminiData.data.map((k: any) => ({
                    ...k,
                    key: k.api_key || savedKeys[k.id] || ''
                })) : [],
                perplexityKey: perplexityData.success && perplexityData.data.length > 0 ? perplexityData.data[0].api_key : '',
                perplexityEnabled: perplexityData.success && perplexityData.data.length > 0 ? perplexityData.data[0].is_enabled : false,
                anymailfinderKey: anymailData.success && anymailData.data.length > 0 ? anymailData.data[0].api_key : '',
                anymailfinderEnabled: anymailData.success && anymailData.data.length > 0 ? anymailData.data[0].is_enabled : false,
                loading: false
            });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addGeminiKey: async (key, name) => {
        try {
            const res = await fetch(`${API_URL}/api/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'gemini',
                    key_name: name || `Key ${get().geminiKeys.length + 1}`,
                    api_key: key,
                    is_enabled: true,
                    usage_limit: 1000
                })
            });
            const data = await res.json();
            if (data.success) {
                // Guardar en localStorage para persistencia
                const savedKeys = JSON.parse(localStorage.getItem('geminiKeys') || '{}');
                savedKeys[data.data.id] = key;
                localStorage.setItem('geminiKeys', JSON.stringify(savedKeys));

                set((state) => ({
                    geminiKeys: [...state.geminiKeys, {
                        id: data.data.id,
                        key: key,
                        key_name: data.data.key_name,
                        is_enabled: data.data.is_enabled,
                        usage_count: 0,
                        usage_limit: data.data.usage_limit || 1000
                    }]
                }));
            }
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    removeGeminiKey: async (id) => {
        try {
            await fetch(`${API_URL}/api/keys/gemini/${id}`, { method: 'DELETE' });
            // Eliminar de localStorage
            const savedKeys = JSON.parse(localStorage.getItem('geminiKeys') || '{}');
            delete savedKeys[id];
            localStorage.setItem('geminiKeys', JSON.stringify(savedKeys));
            
            set((state) => ({
                geminiKeys: state.geminiKeys.filter(k => k.id !== id)
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    toggleGeminiKey: async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/keys/gemini/${id}/toggle`, { 
                method: 'PATCH' 
            });
            const data = await res.json();
            if (data.success) {
                set((state) => ({
                    geminiKeys: state.geminiKeys.map(k =>
                        k.id === id ? { ...k, is_enabled: data.data.is_enabled } : k
                    )
                }));
            }
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    setPerplexityKey: async (key) => {
        try {
            await fetch(`${API_URL}/api/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'perplexity',
                    key_name: 'main',
                    api_key: key,
                    is_enabled: get().perplexityEnabled
                })
            });
            set({ perplexityKey: key });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    togglePerplexity: async (enabled) => {
        try {
            if (get().perplexityKey) {
                await fetch(`${API_URL}/api/keys`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: 'perplexity',
                        key_name: 'main',
                        api_key: get().perplexityKey,
                        is_enabled: enabled
                    })
                });
            }
            set({ perplexityEnabled: enabled });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    setAnymailfinderKey: async (key) => {
        try {
            await fetch(`${API_URL}/api/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'anymailfinder',
                    key_name: 'main',
                    api_key: key,
                    is_enabled: get().anymailfinderEnabled
                })
            });
            set({ anymailfinderKey: key });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    toggleAnymailfinder: async (enabled) => {
        try {
            if (get().anymailfinderKey) {
                await fetch(`${API_URL}/api/keys`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: 'anymailfinder',
                        key_name: 'main',
                        api_key: get().anymailfinderKey,
                        is_enabled: enabled
                    })
                });
            }
            set({ anymailfinderEnabled: enabled });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    getRandomGeminiKey: () => {
        const enabledKeys = get().geminiKeys.filter(k => k.is_enabled);
        if (enabledKeys.length === 0) return null;
        return enabledKeys.sort((a, b) => a.usage_count - b.usage_count)[0];
    }
}));

import { create } from 'zustand';
import { api } from '../utils/api';

const useConfigStore = create((set, get) => ({
    config: null,
    isLoading: false,
    isSaving: false,
    error: null,

    // Load current user's config from the backend
    fetchConfig: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await api.get('/config');
            const { config } = response.data;

            set({
                config: config || null,
                isLoading: false,
                error: null,
            });

            return { success: true, config: config || null };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to fetch config';

            set({
                config: null,
                isLoading: false,
                error: errorMessage,
            });

            return { success: false, error: errorMessage };
        }
    },

    
    saveConfig: async (partialConfig) => {
        set({ isSaving: true, error: null });

        try {
            const current = get().config || {};

            
            const payload = {
                layout: partialConfig.layout ?? current.layout ?? 'default',
                theme: partialConfig.theme ?? current.theme ?? 'light',
                pinnedRepos: partialConfig.pinnedRepos ?? current.pinnedRepos ?? [],
            };

            const response = await api.put('/config', payload);
            const { config } = response.data;

            set({
                config,
                isSaving: false,
                error: null,
            });

            return { success: true, config };
        } catch (error) {
            const errorMessage =
                error.response?.data?.error || error.message || 'Failed to save config';

            set({
                isSaving: false,
                error: errorMessage,
            });

            return { success: false, error: errorMessage };
        }
    },

   
    resetConfig: () => {
        set({ config: null, isLoading: false, isSaving: false, error: null });
    },

    setConfig: (newConfig) => {
        set({ config: newConfig });
    },

    clearError: () => {
        set({ error: null });
    },
}));

export default useConfigStore;

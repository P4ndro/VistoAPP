import { create } from 'zustand';
import { api } from '../utils/api';

const useExportsStore = create((set, get) => ({
    exports: [],
    isLoading: false,
    error: null,

    // Fetch all exports for current user
    fetchExports: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await api.get('/exports');
            const { exports } = response.data;

            set({
                exports: exports || [],
                isLoading: false,
                error: null,
            });

            return { success: true, exports: exports || [] };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to fetch exports';

            set({
                exports: [],
                isLoading: false,
                error: errorMessage,
            });

            return { success: false, error: errorMessage };
        }
    },

    // Save a new export
    saveExport: async (tag, exportData = {}) => {
        set({ error: null });

        try {
            const response = await api.post('/exports', {
                tag,
                exportData,
            });

            const { export: exportRecord } = response.data;

            // Add to local state
            set((state) => ({
                exports: [exportRecord, ...state.exports],
                error: null,
            }));

            return { success: true, export: exportRecord };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to save export';

            set({
                error: errorMessage,
            });

            return { success: false, error: errorMessage };
        }
    },

    // Fetch a single export by ID
    fetchExportById: async (exportId) => {
        set({ isLoading: true, error: null });

        try {
            const response = await api.get(`/exports/${exportId}`);
            const { export: exportRecord } = response.data;

            set({
                isLoading: false,
                error: null,
            });

            return { success: true, export: exportRecord };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to fetch export';

            set({
                isLoading: false,
                error: errorMessage,
            });

            return { success: false, error: errorMessage };
        }
    },

    // Delete an export
    deleteExport: async (exportId) => {
        set({ error: null });

        try {
            await api.delete(`/exports/${exportId}`);

            // Remove from local state
            set((state) => ({
                exports: state.exports.filter((exp) => exp._id !== exportId),
                error: null,
            }));

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to delete export';

            set({
                error: errorMessage,
            });

            return { success: false, error: errorMessage };
        }
    },

    // Reset store
    resetExports: () => {
        set({ exports: [], isLoading: false, error: null });
    },

    clearError: () => {
        set({ error: null });
    },
}));

export default useExportsStore;


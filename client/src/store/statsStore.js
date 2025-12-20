import { create } from 'zustand';
import { api } from '../utils/api';

const useStatsStore = create((set, get) => ({
    stats: null,
    isLoading: false,
    isSyncing: false,
    error: null,

    fetchStats: async () => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await api.get('/stats');
            const { stats } = response.data;
            
            set({
                stats: stats || null,
                isLoading: false,
                error: null,
            });
            
            return { success: true, stats: stats || null };
            
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to fetch stats';
            set({
                stats: null,
                isLoading: false,
                error: errorMessage,
            });
            
            return { success: false, error: errorMessage };
        }
    },

    syncStats: async () => {
        set({ isSyncing: true, error: null });
        
        try {
            const response = await api.post('/stats/sync');
            console.log('Sync response:', response.data);
            const { stats } = response.data;
            
            if (!stats) {
                throw new Error('No stats returned from server');
            }
            
            console.log('Stats received:', {
                repositoryCount: stats.repositoryCount,
                totalStars: stats.totalStars,
                totalCommits: stats.totalCommits
            });
            
            set({
                stats,
                isSyncing: false,
                error: null,
            });
            
            return { success: true, stats };
            
        } catch (error) {
            console.error('Sync error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to sync stats';
            set({
                isSyncing: false,
                error: errorMessage,
            });
            
            return { success: false, error: errorMessage };
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));

export default useStatsStore;


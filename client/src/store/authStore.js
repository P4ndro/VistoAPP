import { create } from 'zustand';
import { api } from '../utils/api';


const useAuthStore = create((set, get) => ({
 
  user: null,              
  isAuthenticated: false,  
  isLoading: true,         
  error: null,             


  checkAuth: async () => {

    set({ isLoading: true, error: null });
    
    try {
      // Call backend /auth/me endpoint

      const response = await api.get('/auth/me');
      
     
      const { user } = response.data;
   
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { success: true, user };
      
    } catch (error) {
      // Network errors don't have error.response, so handle separately
      if (!error.response) {
        // Network error (backend not running, CORS, etc.)
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null, // Don't show error for network issues, just allow login attempt
        });
        return { success: false, error: null };
      }
  
      if (error.response?.status === 401 || error.response?.status === 404) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,  // No error, just not logged in
        });
        return { success: false, error: null };
      }
  
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.response?.data?.error || 'Failed to check authentication',
      });
      
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to check authentication' 
      };
    }
  },

  
  logout: async () => {
    try {
      // Tell backend to clear the httpOnly cookie
      await api.post('/auth/logout');
    } catch (error) {

      console.error('Logout error:', error);
    } finally {
      // Always clear state, even if API call failed
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user, 
      error: null,
    });
  },

  
  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
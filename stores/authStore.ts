import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAdmin: boolean;
  isSubAdmin: boolean;
  balance: number;
  updateBalance: (newBalance: number) => void;
  updateAdmin: (isAdmin: boolean) => void;
  updateSubAdmin: (isSubAdmin: boolean) => void;
  updateUserData: (user: User | null, balance?: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      isSubAdmin: false,
      balance: 0,
      setUser: (user) => set({ 
        user,
        isAdmin: user?.roles?.includes('admin') || false,
        isSubAdmin: user?.roles?.includes('sub-admin') || false 
      }),
      logout: () => {
        // Clear the access token from API client and localStorage
        apiClient.setToken(null);
        // Clear the auth store state
        set({ user: null, isAdmin: false, isSubAdmin: false, balance: 0 });
      },
      updateAdmin: (isAdmin: boolean) => set({ isAdmin }),
      updateSubAdmin: (isSubAdmin: boolean) => set({ isSubAdmin }),
      updateBalance: (newBalance: number) => set({ balance: newBalance }),
      updateUserData: (user, balance) => set((state) => ({
        user,
        isAdmin: user?.roles?.includes('admin') || false,
        isSubAdmin: user?.roles?.includes('sub-admin') || false,
        balance: balance !== undefined ? balance : state.balance
      })),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAdmin: state.isAdmin,
        isSubAdmin: state.isSubAdmin,
        balance: state.balance 
      }),
    }
  )
);
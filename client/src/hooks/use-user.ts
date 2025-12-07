import { create } from 'zustand';
import { UserResponse } from '@/lib/authApi';
import { getCurrentUser } from '@/lib/authApi';

interface UserStore {
  user: UserResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: UserResponse | null) => void;
  clearUser: () => void;
  refreshUser: () => Promise<void>; // <-- added
}

export const useUser = create<UserStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = await getCurrentUser();
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch user', isLoading: false });
    }
  },
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  refreshUser: async () => {
    // just re-fetches the current user and updates the store
    await get().fetchUser();
  },
}));

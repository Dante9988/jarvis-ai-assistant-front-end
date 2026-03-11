import { create } from "zustand";
import type { UserProfile } from "@/lib/contracts/types";
import { authApi, ApiError } from "@/lib/contracts/api";
import { getTokenStorage } from "@/lib/contracts/auth";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  initialize: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => void;
  setUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    const storage = getTokenStorage();
    const stored = await storage.get();
    if (!stored) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const user = await authApi.getProfile(stored);
      set({ token: stored, user, isLoading: false, isAuthenticated: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await storage.remove();
      }
      set({ token: null, user: null, isLoading: false, isAuthenticated: false });
    }
  },

  login: async (token: string) => {
    const storage = getTokenStorage();
    await storage.set(token);
    const user = await authApi.getProfile(token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    const storage = getTokenStorage();
    await storage.remove();
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (user: UserProfile) => {
    set({ user });
  },
}));

export function getToken(): string | null {
  return useAuthStore.getState().token;
}

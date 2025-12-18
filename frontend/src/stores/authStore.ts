import { create } from 'zustand';

interface User {
  id: number;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null, token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

const TOKEN_KEY = 'auth_token';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    set({ user, token, isAuthenticated: !!user });
  },
  setIsLoading: (loading) => set({ isLoading: loading }),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

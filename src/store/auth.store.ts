import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import {
  setAccessToken,
  setRefreshHandler,
  setUnauthorizedHandler,
} from "@/lib/api";
import * as authService from "@/services/auth.service";
import type { User } from "@/lib/types";

// Margen (segundos) para renovar el token antes de que expire.
const REFRESH_MARGIN_SECONDS = 60;
const MIN_REFRESH_DELAY_MS = 10_000;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function clearRefreshTimer(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  expiresIn: number | null;
  initialized: boolean;
  loading: boolean;

  // Acciones públicas.
  login: (email: string, password: string) => Promise<User>;
  logout: (callApi?: boolean) => Promise<void>;
  refreshMe: () => Promise<void>;
  can: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  initialize: () => Promise<void>;

  // Acciones internas.
  setSession: (token: string, user: User, expiresIn: number) => void;
  applyToken: (token: string, expiresIn: number | null) => void;
  runRefresh: () => Promise<void>;
}

// Almacenamiento seguro para SSR (no hay localStorage en el servidor).
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function resolveStorage(): StateStorage {
  return typeof window !== "undefined" ? window.localStorage : noopStorage;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresIn: null,
      initialized: false,
      loading: false,

      applyToken: (token, expiresIn) => {
        setAccessToken(token);
        set({ token, expiresIn: expiresIn ?? get().expiresIn });

        const seconds = expiresIn ?? get().expiresIn;
        if (seconds && seconds > 0) {
          clearRefreshTimer();
          const delay = Math.max(
            (seconds - REFRESH_MARGIN_SECONDS) * 1000,
            MIN_REFRESH_DELAY_MS,
          );
          refreshTimer = setTimeout(() => {
            void get().runRefresh();
          }, delay);
        }
      },

      runRefresh: async () => {
        try {
          const res = await authService.refresh();
          get().applyToken(res.access_token, res.expires_in);
        } catch {
          await get().logout(false);
        }
      },

      setSession: (token, user, expiresIn) => {
        set({ user });
        get().applyToken(token, expiresIn);
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await authService.login(email, password);
          get().setSession(res.access_token, res.user, res.expires_in);
          return res.user;
        } finally {
          set({ loading: false });
        }
      },

      logout: async (callApi = true) => {
        clearRefreshTimer();
        if (callApi && get().token) {
          try {
            await authService.logout();
          } catch {
            // Aunque falle en el server, limpiamos la sesión local.
          }
        }
        setAccessToken(null);
        set({ user: null, token: null, expiresIn: null });
      },

      refreshMe: async () => {
        const res = await authService.me();
        set({ user: res.user });
      },

      can: (permission) => {
        const user = get().user;
        return user !== null && user.permissions.includes(permission);
      },

      hasRole: (role) => get().user?.role === role,

      initialize: async () => {
        if (get().initialized) return;

        // Registra en el cliente HTTP cómo renovar el token y reaccionar al 401.
        setRefreshHandler(async () => {
          try {
            const res = await authService.refresh();
            get().applyToken(res.access_token, res.expires_in);
            return res.access_token;
          } catch {
            return null;
          }
        });
        setUnauthorizedHandler(() => {
          void get().logout(false);
        });

        const token = get().token;
        if (token) {
          setAccessToken(token);
          try {
            await get().refreshMe();
            get().applyToken(token, get().expiresIn ?? null);
          } catch {
            await get().logout(false);
          }
        }

        set({ initialized: true });
      },
    }),
    {
      name: "cup-ficct-auth",
      storage: createJSONStorage(resolveStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        expiresIn: state.expiresIn,
      }),
    },
  ),
);

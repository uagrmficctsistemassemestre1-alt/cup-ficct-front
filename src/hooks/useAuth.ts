"use client";

import { useAuthStore } from "@/store/auth.store";

// Acceso cómodo al estado y acciones de autenticación.
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const can = useAuthStore((s) => s.can);
  const hasRole = useAuthStore((s) => s.hasRole);

  return {
    user,
    token,
    initialized,
    loading,
    isAuthenticated: token !== null,
    login,
    logout,
    refreshMe,
    can,
    hasRole,
  };
}

// Helper directo para chequear un permiso.
export function useCan(permission: string): boolean {
  return useAuthStore((s) => s.can(permission));
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import * as authService from "@/services/authService";
import type { AdminUser } from "@/types/auth.types";
import { errorMessage } from "@/utils/errorHandler";
import { toast } from "sonner";



interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const loadCurrentUser = async () => {
    const response = await authService.getCurrentUser();
    setUser(response.data);
  };

  useEffect(() => {
    let cancelled = false;
    authService
      .getCurrentUser()
      .then((response) => {
        if (!cancelled) setUser(response.data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        void navigate({ to: "/admin/login", replace: true });
      }
    };
    window.addEventListener("csl-unauthorized", onUnauthorized);
    return () => window.removeEventListener("csl-unauthorized", onUnauthorized);
  }, [navigate, pathname]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      loadCurrentUser,
      login: async (email, password) => {
        const response = await authService.login(email, password);
        setUser(response.data);
        toast.success(response.message);
        void navigate({ to: "/admin/dashboard" });
      },
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          throw new Error(errorMessage(error));
        } finally {
          setUser(null);
          void navigate({ to: "/" });
        }
      },
    }),
    [user, isLoading, navigate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

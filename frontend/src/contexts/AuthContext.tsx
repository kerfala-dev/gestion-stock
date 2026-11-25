
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

import type {
  AuthUser,
  LoginCredentials,
} from "../types/auth";

import * as authService from "../services/authService";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurer la session au démarrage
  useEffect(() => {
    async function restoreSession() {
      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  // Connexion
  async function login(credentials: LoginCredentials) {
    const authenticatedUser = await authService.login(credentials);
    setUser(authenticatedUser);
  }

  // Déconnexion
  async function logout() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }

  return (

    <AuthContext.Provider
      value = {{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur de AuthProvider."
    );
  }

  return context;
}

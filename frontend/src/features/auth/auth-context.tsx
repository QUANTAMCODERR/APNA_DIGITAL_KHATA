
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getCurrentUser } from "./auth-api";
import {
  getToken,
  removeToken,
  saveToken,
} from "./token-storage";

import type { UserResponse } from "./types";

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: UserResponse, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const savedToken = getToken();

      if (!savedToken) {
        if (active) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(savedToken);

        if (active) {
          setToken(savedToken);
          setUser(currentUser);
        }
      } catch {
        removeToken();

        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  function setAuth(authUser: UserResponse, authToken: string) {
    saveToken(authToken);
    setUser(authUser);
    setToken(authToken);
  }

  function logout() {
    removeToken();
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        setAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/api";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("user_session_token");

      if (storedToken) {
        try {
          setToken(storedToken);

          const res = await api.get("/auth/me", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          setUser(res.data.user);
        } catch (err) {
          console.error("Failed to restore session:", err);

          localStorage.removeItem("user_session_token");
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("user_session_token", newToken);

    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("user_session_token");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

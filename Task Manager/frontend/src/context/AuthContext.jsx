import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, setUnauthorizedHandler } from "../api/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("ttm_token");
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(logout);

    const loadUser = async () => {
      const token = localStorage.getItem("ttm_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/auth/me");
        setUser(data.user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password }
    });
    localStorage.setItem("ttm_token", data.token);
    setUser(data.user);
  };

  const signup = async (payload) => {
    const data = await apiRequest("/auth/signup", {
      method: "POST",
      body: payload
    });
    localStorage.setItem("ttm_token", data.token);
    setUser(data.user);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "Admin",
      login,
      signup,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service";

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = "gharsaathi_auth_token";

function setAuthorizationHeader(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

export function getDashboardPath(role) {
  return role === "LANDLORD" ? "/landlord/dashboard" : "/tenant/dashboard";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );
  const [isLoading, setIsLoading] = useState(true);

  function clearSession() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthorizationHeader(null);
    setToken(null);
    setUser(null);
  }

  function saveSession(nextToken, nextUser) {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setAuthorizationHeader(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }

  useEffect(() => {
    let isActive = true;
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    async function restoreSession() {
      if (!storedToken) {
        if (isActive) {
          setIsLoading(false);
        }
        return;
      }

      setAuthorizationHeader(storedToken);

      try {
        const { user: currentUser } = await getCurrentUser(storedToken);

        if (isActive) {
          setToken(storedToken);
          setUser(currentUser);
        }
      } catch (error) {
        if (isActive) {
          clearSession();
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  async function login(credentials) {
    const { token: nextToken, user: nextUser } = await loginUser(credentials);
    saveSession(nextToken, nextUser);
    return nextUser;
  }

  async function register(registrationData) {
    await registerUser(registrationData);
    return login({
      email: registrationData.email,
      password: registrationData.password,
    });
  }

  function logout() {
    clearSession();
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

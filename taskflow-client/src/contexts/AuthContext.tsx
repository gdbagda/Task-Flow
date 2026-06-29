import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import axiosInstance from '../api/axios';
import type {
  AuthContextType,
  LoginFormData,
  RegisterFormData,
  User,
} from '../types';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ── Persist helpers ──────────────────────────────────────────────────────
  const persistAuth = (newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  // ── Verify token on mount ────────────────────────────────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await axiosInstance.get('/auth/me');
        if (data.success) {
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (formData: RegisterFormData) => {
    const { data } = await axiosInstance.post('/auth/register', formData);
    persistAuth(data.token, data.user);
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (formData: LoginFormData) => {
    const { data } = await axiosInstance.post('/auth/login', formData);
    persistAuth(data.token, data.user);
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    axiosInstance.post('/auth/logout').catch(() => {});
    clearAuth();
  }, []);

  // ── Update user in state ─────────────────────────────────────────────────
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
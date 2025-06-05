import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loadUserData = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user data', error);
      throw error;
    }
  }, []);

  const login = useCallback(
    async (token: string) => {
      localStorage.setItem('authToken', token);
      await loadUserData(token);
    },
    [loadUserData]
  );

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.warn('Logout failed silently', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const { token } = await response.json();
      localStorage.setItem('authToken', token);
      await loadUserData(token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  }, [loadUserData, logout]);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('authToken');
    if (token) {
      loadUserData(token).catch(() => {
        if (isMounted) {
          logout();
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [loadUserData, logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


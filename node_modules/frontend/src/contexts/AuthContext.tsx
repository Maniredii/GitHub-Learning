import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { verifyToken } from '../services/authApi';

interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      
      if (storedToken) {
        try {
          // Verify token with backend
          const response = await verifyToken(storedToken);
          
          if (response.valid && response.user) {
            setToken(storedToken);
            setUser(response.user);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userProgress');
          }
        } catch (error) {
          // Token verification failed, clear storage
          console.error('Token verification failed:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('userProgress');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Handle token expiration
  useEffect(() => {
    if (!token) return;

    // Check token validity every 5 minutes
    const intervalId = setInterval(async () => {
      try {
        const response = await verifyToken(token);
        
        if (!response.valid) {
          // Token expired, logout user
          logout();
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userId', newUser.id);
    localStorage.setItem('userProgress', JSON.stringify({
      level: newUser.level,
      xp: newUser.xp,
      username: newUser.username,
    }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userProgress');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('userProgress', JSON.stringify({
        level: updatedUser.level,
        xp: updatedUser.xp,
        username: updatedUser.username,
      }));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

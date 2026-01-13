import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Inicializa o estado de autenticação
  useEffect(() => {
    const storedUser = ticketAPI.getCurrentUser();
    if (storedUser && ticketAPI.isAuthenticated()) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await ticketAPI.login(email, password);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const data = await ticketAPI.register(name, email, password, role);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    ticketAPI.logout();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Helpers para verificar roles
  const isAdmin = user?.role === 'Admin';
  const isResolver = user?.role === 'UserResolve';
  const isReporter = user?.role === 'UserReport';
  const canChangeStatus = isAdmin || isResolver;

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isResolver,
    isReporter,
    canChangeStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

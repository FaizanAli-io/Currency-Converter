import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  guestId: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<{ email: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedGuestId = localStorage.getItem('guestId');

      if (token) {
        try {
          const response = await authService.getProfile();
          setUser(response.data);
        } catch {
          localStorage.removeItem('token');
          setShowAuthModal(true);
        }
      } else if (storedGuestId) {
        setGuestId(storedGuestId);
      } else {
        setShowAuthModal(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const { accessToken, user } = response.data;
    localStorage.setItem('token', accessToken);
    localStorage.removeItem('guestId');
    setUser(user);
    setGuestId(null);
    setShowAuthModal(false);
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await authService.register(email, password, name);
    return response.data;
  };

  const verifyOtp = async (email: string, otp: string) => {
    await authService.verifyOtp(email, otp);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setShowAuthModal(true);
  };

  const continueAsGuest = () => {
    const newGuestId = uuidv4();
    localStorage.setItem('guestId', newGuestId);
    setGuestId(newGuestId);
    setShowAuthModal(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        guestId,
        isAuthenticated: !!user,
        isGuest: !!guestId && !user,
        loading,
        login,
        register,
        verifyOtp,
        logout,
        continueAsGuest,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * =========================================================================================
 * CloudVault Workspace - Frontend Authentication & Identity Context Provider
 * =========================================================================================
 * Manages global authentication state, token persistence, user profile caching,
 * automated session rehydration, and OTP verification workflows.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingVerificationEmail: string | null;
  lastGeneratedOtp: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; otpCode?: string; message?: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; message?: string }>;
  resendOtp: () => Promise<{ success: boolean; otpCode?: string; message?: string }>;
  logout: () => void;
  updateProfile: (data: { name?: string; avatarUrl?: string }) => Promise<{ success: boolean; message?: string }>;
  refreshUserData: () => Promise<void>;
  setPendingVerificationEmail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<string | null>(null);

  const refreshUserData = useCallback(async () => {
    let currentToken = localStorage.getItem('auth_token');
    
    // If no token exists on first load, auto-login with default verified demo account
    if (!currentToken) {
      try {
        const res = await authApi.login({ email: 'adel.s.atwan@gmail.com', password: 'Password123!' });
        if (res.data.success && res.data.token) {
          localStorage.setItem('auth_token', res.data.token);
          setToken(res.data.token);
          setUser(res.data.user);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        // Silent catch for login fallback
      }
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getProfile();
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.warn('Failed to load user profile with current token, recovering session...');
      // If token is invalid or expired, recover by logging in default demo account
      localStorage.removeItem('auth_token');
      try {
        const res = await authApi.login({ email: 'adel.s.atwan@gmail.com', password: 'Password123!' });
        if (res.data.success && res.data.token) {
          localStorage.setItem('auth_token', res.data.token);
          setToken(res.data.token);
          setUser(res.data.user);
          setIsLoading(false);
          return;
        }
      } catch (e) {}
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.data.success) {
        localStorage.setItem('auth_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        if (!res.data.user.isVerified) {
          setPendingVerificationEmail(res.data.user.email);
        } else {
          setPendingVerificationEmail(null);
        }
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      return { success: false, message: msg };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await authApi.register({ name, email, password });
      if (res.data.success) {
        localStorage.setItem('auth_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setPendingVerificationEmail(email);
        if (res.data.otpCode) {
          setLastGeneratedOtp(res.data.otpCode);
        }
        return { success: true, otpCode: res.data.otpCode, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (code: string) => {
    const targetEmail = pendingVerificationEmail || user?.email;
    if (!targetEmail) {
      return { success: false, message: 'No target email found for verification.' };
    }
    try {
      const res = await authApi.verifyEmail({ email: targetEmail, code });
      if (res.data.success) {
        setUser(res.data.user);
        setPendingVerificationEmail(null);
        setLastGeneratedOtp(null);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Verification failed.' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Verification failed.';
      return { success: false, message: msg };
    }
  };

  const resendOtp = async () => {
    const targetEmail = pendingVerificationEmail || user?.email;
    if (!targetEmail) {
      return { success: false, message: 'No email found to resend verification.' };
    }
    try {
      const res = await authApi.resendCode({ email: targetEmail });
      if (res.data.success) {
        if (res.data.otpCode) {
          setLastGeneratedOtp(res.data.otpCode);
        }
        return { success: true, otpCode: res.data.otpCode, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to resend verification code.';
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (data: { name?: string; avatarUrl?: string }) => {
    try {
      const res = await authApi.updateProfile(data);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err: any) {
      return { success: false, message: 'Failed to update profile.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setPendingVerificationEmail(null);
    setLastGeneratedOtp(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        pendingVerificationEmail,
        lastGeneratedOtp,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        updateProfile,
        refreshUserData,
        setPendingVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

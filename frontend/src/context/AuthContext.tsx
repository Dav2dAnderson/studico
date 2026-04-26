"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '@/lib/axios';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  studying_in?: any[];
  my_courses?: any[];
  is_author: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access');
      if (token) {
        try {
          const res = await axiosInstance.get('/user_control/me/');
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (access: string, refresh: string) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    
    try {
      const res = await axiosInstance.get('/user_control/me/');
      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch user after login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    // Optionally call the logout endpoint if needed
    // axiosInstance.post('/user_control/logout/', { refresh: localStorage.getItem('refresh') });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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

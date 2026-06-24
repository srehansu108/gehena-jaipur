// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api, { login as apiLogin, signup as apiSignup, getCurrentUser, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // Set axios default header when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await getCurrentUser();
          if (response.success) {
            setUser(response.user);
          } else {
            localStorage.removeItem('authToken');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Login
  const login = async (credentials) => {
    try {
      console.log('🔍 AuthContext: Attempting login...');
      
      const response = await apiLogin(credentials);
      
      console.log('📥 AuthContext: Login response:', {
        success: response.success,
        hasToken: !!response.token,
        hasUser: !!response.user,
      });

      if (response.success && response.token) {
        localStorage.setItem('authToken', response.token);
        if (credentials.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        setToken(response.token);
        setUser(response.user);
        
        return { 
          success: true,
          user: response.user,
          token: response.token,
        };
      }
      
      return { 
        success: false, 
        message: response.message || 'Invalid credentials' 
      };
    } catch (error) {
      console.error('❌ AuthContext: Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please try again.';
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  // Signup
  const signup = async (userData) => {
    try {
      const response = await apiSignup(userData);
      
      if (response.success && response.token) {
        localStorage.setItem('authToken', response.token);
        setToken(response.token);
        setUser(response.user);
        
        return { 
          success: true, 
          message: response.message,
          user: response.user,
          token: response.token,
        };
      }
      
      return { 
        success: false, 
        message: response.message || 'Signup failed' 
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed. Please try again.'
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('rememberMe');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    }
  };

  // Update user
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    loading,
    token,
    signup,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
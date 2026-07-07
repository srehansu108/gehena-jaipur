// src/contexts/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import api, { 
  login as apiLogin, 
  signup as apiSignup, 
  getCurrentUser, 
  logout as apiLogout,
  adminLogin as apiAdminLogin,
  getAdminProfile,
  isAdminAuthenticated,
  getAdminUser
} from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken') || localStorage.getItem('adminToken'));
  const [isAdmin, setIsAdmin] = useState(false);

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
      // Check for admin token first
      const adminToken = localStorage.getItem('adminToken');
      const authToken = localStorage.getItem('authToken');
      
      if (adminToken) {
        // Admin authentication
        try {
          const adminUser = getAdminUser();
          if (adminUser) {
            setUser(adminUser);
            setToken(adminToken);
            setIsAdmin(true);
          } else {
            // Try to fetch admin profile
            const response = await getAdminProfile();
            if (response.success) {
              setUser(response.user);
              setIsAdmin(true);
            } else {
              localStorage.removeItem('adminToken');
              setToken(null);
            }
          }
        } catch (error) {
          console.error('Admin auth check failed:', error);
          localStorage.removeItem('adminToken');
          setToken(null);
        }
      } else if (authToken) {
        // Regular user authentication
        try {
          const response = await getCurrentUser();
          if (response.success) {
            setUser(response.user);
            setIsAdmin(false);
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
  }, []);

  // Admin Login
  const adminLogin = async (credentials) => {
    try {
      console.log('🔍 AuthContext: Attempting admin login...');
      
      const response = await apiAdminLogin(credentials);
      
      console.log('📥 AuthContext: Admin login response:', {
        success: response.success,
        hasToken: !!response.token,
        hasUser: !!response.user,
      });

      if (response.success && response.token) {
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        if (credentials.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        setToken(response.token);
        setUser(response.user);
        setIsAdmin(true);
        
        return { 
          success: true,
          user: response.user,
          token: response.token,
          isAdmin: true
        };
      }
      
      return { 
        success: false, 
        message: response.message || 'Invalid credentials' 
      };
    } catch (error) {
      console.error('❌ AuthContext: Admin login error:', {
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

  // Regular User Login
  const login = async (credentials) => {
    try {
      console.log('🔍 AuthContext: Attempting user login...');
      
      const response = await apiLogin(credentials);
      
      console.log('📥 AuthContext: User login response:', {
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
        setIsAdmin(false);
        
        return { 
          success: true,
          user: response.user,
          token: response.token,
          isAdmin: false
        };
      }
      
      return { 
        success: false, 
        message: response.message || 'Invalid credentials' 
      };
    } catch (error) {
      console.error('❌ AuthContext: User login error:', {
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
        setIsAdmin(false);
        
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
      // Try to logout from both admin and user endpoints
      if (localStorage.getItem('adminToken')) {
        try {
          await api.post('/admin/logout');
        } catch (e) {
          // Ignore admin logout errors
        }
      }
      if (localStorage.getItem('authToken')) {
        await apiLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('rememberMe');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      setIsAdmin(false);
    }
  };

  // Update user
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    // Update stored user data
    if (isAdmin) {
      const currentUser = getAdminUser();
      if (currentUser) {
        localStorage.setItem('adminUser', JSON.stringify({ ...currentUser, ...userData }));
      }
    }
  };

  const value = {
    user,
    loading,
    token,
    isAdmin,
    signup,
    login,
    adminLogin,
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
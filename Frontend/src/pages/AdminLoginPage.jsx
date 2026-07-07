// src/pages/admin/AdminLoginPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  KeyIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { isAdminAuthenticated } from '../services/api';

// Common admin credentials (fallback for demo)
const ADMIN_CREDENTIALS = {
  email: 'admin@adminportal.com',
  password: 'Admin@123',
};

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogin, isAuthenticated } = useAuth();
  
  // Get the attempted page for redirect
  const from = location.state?.from || '/admin/dashboard';
  
  // State management
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // Check if user is already logged in
  useEffect(() => {
    if (isAdminAuthenticated() || isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [navigate, from, isAuthenticated]);

  // Handle lock timer
  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  // Validate form
  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email address is required');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`Account locked. Please wait ${lockTimer} seconds.`);
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Try API login via AuthContext
      const result = await adminLogin({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (result.success) {
        setLoginAttempts(0);
        navigate(from, { replace: true });
      } else {
        // Check if it's the common credentials (fallback for demo)
        if (formData.email === ADMIN_CREDENTIALS.email && 
            formData.password === ADMIN_CREDENTIALS.password) {
          // Demo login - bypass API
          const demoToken = 'demo-jwt-token-' + Date.now();
          const demoUser = {
            id: '1',
            name: 'Super Admin',
            email: formData.email,
            role: 'super_admin',
            permissions: ['all'],
            isAdmin: true
          };

          localStorage.setItem('adminToken', demoToken);
          localStorage.setItem('adminUser', JSON.stringify(demoUser));
          
          if (formData.rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }

          setLoginAttempts(0);
          navigate(from, { replace: true });
          return;
        }

        // Failed login attempt
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockTimer(60);
          setError('Too many failed attempts. Account locked for 60 seconds.');
        } else {
          setError(`Invalid email or password. ${5 - newAttempts} attempts remaining.`);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login for demo purposes
  const handleQuickLogin = () => {
    setFormData({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      rememberMe: false
    });
    setTimeout(() => {
      const form = document.getElementById('login-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 px-4">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Logo & Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin<span className="text-indigo-600">Portal</span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Secure access for administrators only
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 font-medium">{error}</p>
                {isLocked && (
                  <p className="text-xs text-red-500 mt-1">
                    Please wait {lockTimer}s before trying again
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLocked}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="admin@adminportal.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLocked}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Demo: <span className="font-mono bg-slate-100 px-2 py-1 rounded">admin@adminportal.com / Admin@123</span>
              </div>
            </div>

            {/* Remember Me & Quick Login */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLocked}
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-slate-600">Remember me</span>
              </label>
              
              <button
                type="button"
                onClick={handleQuickLogin}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Quick Login
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              🔒 Secure connection • Encrypted data transfer
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Admin Portal v2.0.0 • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/pages/LoginPage.jsx - PINK THEME ✅
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Eye, EyeOff, Mail, Lock, User, 
  AlertCircle, ArrowLeft, Shield, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Username or email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔍 LoginPage: Sending login request...');
      
      const result = await login({
        identifier: formData.identifier,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
      
      console.log('🔍 LoginPage: Result:', result);
      
      if (result.success) {
        console.log('✅ Login successful! Navigating to home...');
        navigate('/');
      } else {
        console.log('❌ Login failed:', result.message);
        setServerError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('❌ LoginPage: Unexpected error:', error);
      setServerError(error.response?.data?.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/30 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-100/80 to-rose-100/80 px-5 py-2.5 rounded-full shadow-sm border border-pink-200">
            <Shield className="w-5 h-5 text-pink-600" />
            <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
            <span className="text-pink-700 font-semibold text-sm tracking-wider">Luxury Jewels</span>
            <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-pink-lg border border-pink-100/50 overflow-hidden hover:shadow-pink-xl transition-all duration-300">
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif text-white">Welcome Back</h1>
                <p className="text-pink-200 text-sm mt-1">Sign in to your account</p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="text-white/80 hover:text-white transition-colors hover:scale-110 transform duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-8">
            {/* Server Error */}
            {serverError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-rose-700 text-sm">{serverError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username or Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username or E-mail <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-pink-400" />
                      <span className="text-pink-200">|</span>
                      <Mail className="w-4 h-4 text-pink-400" />
                    </div>
                  </div>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className={`w-full pl-16 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                      errors.identifier 
                        ? 'border-rose-300 focus:ring-rose-500' 
                        : 'border-pink-200 focus:ring-pink-500'
                    }`}
                    placeholder="Enter username or email"
                    disabled={isLoading}
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-1 text-sm text-rose-600">{errors.identifier}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                      errors.password 
                        ? 'border-rose-300 focus:ring-rose-500' 
                        : 'border-pink-200 focus:ring-pink-500'
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-pink-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-rose-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-500 focus:ring-offset-0"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-600 group-hover:text-pink-600 transition-colors">Keep me signed in</span>
                </label>
                <Link 
                  to="/signup" 
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
                >
                  Register
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3.5 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-pink-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Register Link */}
              <p className="text-center text-sm text-gray-600 mt-2">
                Don't have an account?{' '}
                <Link to="/signup" className="text-pink-600 hover:text-pink-700 font-semibold transition-colors">
                  Create one now
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-2">
          <span className="w-4 h-0.5 bg-pink-200"></span>
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-pink-600 hover:text-pink-700 transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy-policy" className="text-pink-600 hover:text-pink-700 transition-colors">Privacy Policy</Link>
          <span className="w-4 h-0.5 bg-pink-200"></span>
        </p>
      </div>
    </div>
  );
}
// src/pages/SignupPage.jsx - PINK/ROSE PROFESSIONAL THEME ✅
// Removed: annualTurnover field completely

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Eye, EyeOff, User, Mail, Phone, Lock, 
  CheckCircle, AlertCircle, Shield, ArrowLeft, 
  Building2, BadgeCheck, Store, FileText, 
  CreditCard, UserCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [accountType, setAccountType] = useState('personal'); // 'personal' | 'business'
  
  const [formData, setFormData] = useState({
    // Personal fields
    username: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Business fields
    businessName: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    website: '',
    yearsInBusiness: '',
    // annualTurnover: '', // ❌ REMOVED
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Business types for dropdown
  const businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'Private Limited Company',
    'Public Limited Company',
    'Limited Liability Partnership (LLP)',
    'One Person Company (OPC)',
    'Section 8 Company (Non-Profit)',
    'Hindu Undivided Family (HUF)',
    'Other'
  ];

  // GST validation - Format: 22AAAAA0000A1Z5 (15 characters)
  const validateGST = (gst) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst.toUpperCase());
  };

  // PAN validation - Format: ABCDE1234F (10 characters)
  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  };

  const validateForm = () => {
    const newErrors = {};
    
    // --- Personal Information Validation ---
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscore';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character (@$!%*?&)';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // --- Business Validation (only if business account) ---
    if (accountType === 'business') {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      }

      if (!formData.businessType) {
        newErrors.businessType = 'Please select business type';
      }

      if (formData.gstNumber && !validateGST(formData.gstNumber)) {
        newErrors.gstNumber = 'Please enter a valid GST number (Format: 22AAAAA0000A1Z5)';
      }

      if (formData.panNumber && !validatePAN(formData.panNumber)) {
        newErrors.panNumber = 'Please enter a valid PAN number (Format: ABCDE1234F)';
      }

      if (!formData.businessAddress.trim()) {
        newErrors.businessAddress = 'Business address is required';
      }

      if (!formData.businessPhone.trim()) {
        newErrors.businessPhone = 'Business phone number is required';
      } else if (!/^[0-9]{10}$/.test(formData.businessPhone)) {
        newErrors.businessPhone = 'Please enter a valid 10-digit phone number';
      }

      if (!formData.businessEmail.trim()) {
        newErrors.businessEmail = 'Business email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
        newErrors.businessEmail = 'Please enter a valid business email address';
      }

      if (!formData.yearsInBusiness) {
        newErrors.yearsInBusiness = 'Please enter years in business';
      } else if (isNaN(formData.yearsInBusiness) || parseInt(formData.yearsInBusiness) < 0) {
        newErrors.yearsInBusiness = 'Please enter a valid number';
      }

      // ❌ REMOVED: annualTurnover validation
    }
    
    if (!agreeToPolicy) {
      newErrors.agreeToPolicy = 'You must agree to the privacy policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    // Clear business-specific errors when switching
    const businessErrors = ['businessName', 'businessType', 'gstNumber', 'panNumber', 
                           'businessAddress', 'businessPhone', 'businessEmail', 
                           'website', 'yearsInBusiness']; // ❌ REMOVED: 'annualTurnover'
    setErrors(prev => {
      const newErrors = { ...prev };
      businessErrors.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare signup data based on account type
      const signupData = {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        password: formData.password,
        accountType: accountType,
      };

      // Add business fields if business account
      if (accountType === 'business') {
        signupData.businessDetails = {
          businessName: formData.businessName,
          businessType: formData.businessType,
          gstNumber: formData.gstNumber || null,
          panNumber: formData.panNumber || null,
          businessAddress: formData.businessAddress,
          businessPhone: formData.businessPhone,
          businessEmail: formData.businessEmail,
          website: formData.website || null,
          yearsInBusiness: parseInt(formData.yearsInBusiness),
          // annualTurnover: formData.annualTurnover, // ❌ REMOVED
        };
      }
      
      const result = await signup(signupData);
      
      if (result.success) {
        setSuccessMessage(
          accountType === 'business' 
            ? 'Business account created successfully! Redirecting to dashboard...' 
            : 'Account created successfully! Redirecting to home...'
        );
        setTimeout(() => {
          navigate(accountType === 'business' ? '/business/dashboard' : '/');
        }, 2000);
      } else {
        setServerError(result.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setServerError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/30 to-pink-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-pink-lg border border-pink-100/50 overflow-hidden hover:shadow-pink-xl transition-all duration-300">
        {/* Header - PINK/ROSE THEME */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-white tracking-tight">Create Account</h1>
              <p className="text-pink-200 text-sm mt-1">
                {accountType === 'business' 
                  ? 'Register your business for corporate access' 
                  : 'Join our luxury jewelry family'}
              </p>
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
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}
          
          {serverError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-rose-700 text-sm">{serverError}</p>
            </div>
          )}

          {/* Account Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Account Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAccountTypeChange('personal')}
                className={`p-4 border-2 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  accountType === 'personal'
                    ? 'border-pink-500 bg-pink-50 shadow-md'
                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                }`}
              >
                <UserCircle className={`w-6 h-6 ${accountType === 'personal' ? 'text-pink-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className={`font-semibold ${accountType === 'personal' ? 'text-pink-700' : 'text-gray-700'}`}>
                    Personal Account
                  </p>
                  <p className="text-xs text-gray-500">For individual users</p>
                </div>
                {accountType === 'personal' && (
                  <BadgeCheck className="w-5 h-5 text-pink-600 ml-auto" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleAccountTypeChange('business')}
                className={`p-4 border-2 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  accountType === 'business'
                    ? 'border-rose-500 bg-rose-50 shadow-md'
                    : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                }`}
              >
                <Building2 className={`w-6 h-6 ${accountType === 'business' ? 'text-rose-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className={`font-semibold ${accountType === 'business' ? 'text-rose-700' : 'text-gray-700'}`}>
                    Business Account
                  </p>
                  <p className="text-xs text-gray-500">For companies & organizations</p>
                </div>
                {accountType === 'business' && (
                  <BadgeCheck className="w-5 h-5 text-rose-600 ml-auto" />
                )}
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information Section */}
            <div className="border-b border-pink-100 pb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-pink-600" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                        errors.username 
                          ? 'border-rose-300 focus:ring-rose-500' 
                          : 'border-pink-200 focus:ring-pink-500'
                      }`}
                      placeholder="Choose a unique username"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-xs text-rose-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                        errors.email 
                          ? 'border-rose-300 focus:ring-rose-500' 
                          : 'border-pink-200 focus:ring-pink-500'
                      }`}
                      placeholder="john@example.com"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                      errors.firstName 
                        ? 'border-rose-300 focus:ring-rose-500' 
                        : 'border-pink-200 focus:ring-pink-500'
                    }`}
                    placeholder="John"
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-rose-600">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                      errors.lastName 
                        ? 'border-rose-300 focus:ring-rose-500' 
                        : 'border-pink-200 focus:ring-pink-500'
                    }`}
                    placeholder="Doe"
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-rose-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                      errors.mobileNumber 
                        ? 'border-rose-300 focus:ring-rose-500' 
                        : 'border-pink-200 focus:ring-pink-500'
                    }`}
                    placeholder="9876543210"
                    maxLength="10"
                    disabled={isLoading}
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="mt-1 text-xs text-rose-600">{errors.mobileNumber}</p>
                )}
              </div>
            </div>

            {/* Password Section */}
            <div className="border-b border-pink-100 pb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-pink-600" />
                Security
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
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
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                      • 8+ chars
                    </span>
                    <span className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                      • Lowercase
                    </span>
                    <span className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                      • Uppercase
                    </span>
                    <span className={/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                      • Number
                    </span>
                    <span className={/[@$!%*?&]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                      • Special
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                        errors.confirmPassword 
                          ? 'border-rose-300 focus:ring-rose-500' 
                          : 'border-pink-200 focus:ring-pink-500'
                      }`}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-pink-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information Section - Conditional */}
            {accountType === 'business' && (
              <div className="border-b border-pink-100 pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-rose-600" />
                  Business Information
                  <span className="text-xs font-normal text-gray-500 ml-2">(Required for business accounts)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                          errors.businessName 
                            ? 'border-rose-300 focus:ring-rose-500' 
                            : 'border-pink-200 focus:ring-pink-500'
                        }`}
                        placeholder="Acme Corporation"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.businessName && (
                      <p className="mt-1 text-xs text-rose-600">{errors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                        errors.businessType 
                          ? 'border-rose-300 focus:ring-rose-500' 
                          : 'border-pink-200 focus:ring-pink-500'
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.businessType && (
                      <p className="mt-1 text-xs text-rose-600">{errors.businessType}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST Number 
                      <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 uppercase ${
                          errors.gstNumber 
                            ? 'border-rose-300 focus:ring-rose-500' 
                            : 'border-pink-200 focus:ring-pink-500'
                        }`}
                        placeholder="22AAAAA0000A1Z5"
                        maxLength="15"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.gstNumber && (
                      <p className="mt-1 text-xs text-rose-600">{errors.gstNumber}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">Format: 22AAAAA0000A1Z5 (15 characters)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number 
                      <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 uppercase ${
                          errors.panNumber 
                            ? 'border-rose-300 focus:ring-rose-500' 
                            : 'border-pink-200 focus:ring-pink-500'
                        }`}
                        placeholder="ABCDE1234F"
                        maxLength="10"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.panNumber && (
                      <p className="mt-1 text-xs text-rose-600">{errors.panNumber}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">Format: ABCDE1234F (10 characters)</p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    rows="2"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                      errors.businessAddress 
                        ? 'border-rose-300 focus:ring-rose-500' 
                        : 'border-pink-200 focus:ring-pink-500'
                    }`}
                    placeholder="123 Business Street, City, State, PIN Code"
                    disabled={isLoading}
                  />
                  {errors.businessAddress && (
                    <p className="mt-1 text-xs text-rose-600">{errors.businessAddress}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Phone <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                      <input
                        type="tel"
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                          errors.businessPhone 
                            ? 'border-rose-300 focus:ring-rose-500' 
                            : 'border-pink-200 focus:ring-pink-500'
                        }`}
                        placeholder="9876543210"
                        maxLength="10"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.businessPhone && (
                      <p className="mt-1 text-xs text-rose-600">{errors.businessPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                      <input
                        type="text"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                          errors.businessEmail 
                            ? 'border-rose-300 focus:ring-rose-500' 
                            : 'border-pink-200 focus:ring-pink-500'
                        }`}
                        placeholder="contact@acme.com"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.businessEmail && (
                      <p className="mt-1 text-xs text-rose-600">{errors.businessEmail}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website 
                      <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all bg-white/50"
                      placeholder="https://www.acme.com"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years in Business <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white/50 ${
                        errors.yearsInBusiness 
                          ? 'border-rose-300 focus:ring-rose-500' 
                          : 'border-pink-200 focus:ring-pink-500'
                      }`}
                      placeholder="5"
                      min="0"
                      disabled={isLoading}
                    />
                    {errors.yearsInBusiness && (
                      <p className="mt-1 text-xs text-rose-600">{errors.yearsInBusiness}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="pt-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeToPolicy"
                  checked={agreeToPolicy}
                  onChange={(e) => setAgreeToPolicy(e.target.checked)}
                  className="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  disabled={isLoading}
                />
                <label htmlFor="agreeToPolicy" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the{' '}
                  <Link to="/privacy-policy" className="text-pink-600 hover:text-pink-700 font-medium underline transition-colors">
                    Privacy Policy
                  </Link>
                  {' '}and{' '}
                  <Link to="/terms" className="text-pink-600 hover:text-pink-700 font-medium underline transition-colors">
                    Terms of Service
                  </Link>
                  <span className="text-rose-500"> *</span>
                </label>
              </div>
              {errors.agreeToPolicy && (
                <p className="mt-1 text-xs text-rose-600 ml-7">{errors.agreeToPolicy}</p>
              )}
            </div>

            {/* Submit Button - PINK/ROSE GRADIENT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3.5 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-pink-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {accountType === 'business' ? 'Creating Business Account...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {accountType === 'business' ? 'Register Business' : 'Create Account'}
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-600 hover:text-pink-700 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
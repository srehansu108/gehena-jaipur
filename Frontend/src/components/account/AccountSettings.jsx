// src/components/account/AccountSettings.jsx - PINK THEME ✅
import { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, Camera, Sparkles } from 'lucide-react';
import { updateProfile, changePassword } from '../../services/api';

export function AccountSettings({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    username: user?.username || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await updateProfile(formData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-pink-500" />
        <h2 className="text-xl font-serif text-gray-900">Account <span className="text-pink-gradient">Settings</span></h2>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Edit Form */}
      <div className="bg-gradient-to-br from-pink-50/50 to-rose-50/50 rounded-xl border border-pink-100 p-6 hover:border-pink-200 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed border-pink-100' : 'bg-white border-pink-200'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed border-pink-100' : 'bg-white border-pink-200'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed border-pink-100' : 'bg-white border-pink-200'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed border-pink-100' : 'bg-white border-pink-200'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed border-pink-100' : 'bg-white border-pink-200'
                }`}
              />
            </div>
          </div>

          {isEditing && (
            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2.5 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-pink-lg"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-gradient-to-br from-pink-50/50 to-rose-50/50 rounded-xl border border-pink-100 p-6 hover:border-pink-200 transition-all duration-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2.5 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2.5 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-pink-lg"
          >
            <Lock size={18} />
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
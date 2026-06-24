// src/components/account/ProfileSection.jsx - PINK THEME ✅
import { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Edit2, Save, X, Camera, Shield, Award,
  Clock, Package, Heart, Star, Sparkles
} from 'lucide-react';

export function ProfileSection({ user, onUpdate, loading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    username: user?.username || '',
    profilePicture: user?.profilePicture || null,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await onUpdate(formData);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsEditing(false);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to update profile' });
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
      username: user?.username || '',
      profilePicture: user?.profilePicture || null,
    });
    setErrors({});
    setIsEditing(false);
  };

  const getInitials = () => {
    const first = formData.firstName?.[0] || '';
    const last = formData.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  const getFullName = () => {
    return `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'User';
  };

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Recently';

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-pink-md border border-pink-100/50 overflow-hidden hover:shadow-pink-lg transition-all duration-300">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/80 shadow-lg">
              {formData.profilePicture ? (
                <img 
                  src={formData.profilePicture} 
                  alt={getFullName()}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl md:text-5xl font-bold text-white">
                  {getInitials()}
                </span>
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-pink-50 transition-colors border border-pink-200">
                <Camera size={18} className="text-pink-600" />
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="text-center md:text-left text-white flex-1">
            <h2 className="text-2xl md:text-3xl font-bold">{getFullName()}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
              <span className="flex items-center gap-1 text-pink-200">
                <User size={16} />
                @{formData.username || 'username'}
              </span>
              <span className="hidden md:inline text-pink-300">|</span>
              <span className="flex items-center gap-1 text-pink-200">
                <Shield size={16} />
                {user?.role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-pink-200">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Member since {memberSince}
              </span>
              {user?.lastLogin && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Last login: {new Date(user.lastLogin).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-white/20 hover:scale-105"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Body */}
      <div className="p-6">
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
            <Save size={16} />
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard 
            icon={<Package size={18} className="text-pink-500" />}
            label="Orders"
            value={user?.totalOrders || 0}
          />
          <StatCard 
            icon={<Heart size={18} className="text-rose-500" />}
            label="Wishlist"
            value={user?.wishlistCount || 0}
          />
          <StatCard 
            icon={<Star size={18} className="text-amber-500" />}
            label="Reviews"
            value={user?.reviewCount || 0}
          />
          <StatCard 
            icon={<Award size={18} className="text-purple-500" />}
            label="Points"
            value={user?.points || 0}
          />
        </div>

        {!isEditing ? (
          <ViewProfile user={user} />
        ) : (
          <EditProfile 
            formData={formData}
            errors={errors}
            loading={loading}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-gradient-to-br from-pink-50/50 to-rose-50/50 rounded-xl p-3 text-center hover:shadow-pink-md transition-all duration-300 border border-pink-100/50 hover:border-pink-200 group">
      <div className="flex justify-center group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <p className="text-lg font-bold text-gray-900 mt-1 group-hover:text-pink-600 transition-colors">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function ViewProfile({ user }) {
  const profileFields = [
    { icon: <User size={18} />, label: 'Username', value: user?.username },
    { icon: <Mail size={18} />, label: 'Email', value: user?.email },
    { icon: <Phone size={18} />, label: 'Mobile', value: user?.mobileNumber },
    { icon: <MapPin size={18} />, label: 'Address', value: user?.addresses?.length > 0 ? 'View addresses' : 'No address added' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-serif text-gray-900">Contact <span className="text-pink-gradient">Information</span></h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profileFields.map((field, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-br from-pink-50/30 to-rose-50/30 rounded-xl border border-pink-100/50">
            <span className="text-pink-400 mt-0.5">{field.icon}</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{field.label}</p>
              <p className="text-gray-900 font-medium">{field.value || 'Not set'}</p>
            </div>
          </div>
        ))}
      </div>

      {user?.addresses && user.addresses.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Saved Addresses</h4>
          <div className="space-y-2">
            {user.addresses.slice(0, 2).map((address, index) => (
              <div key={index} className="text-sm text-gray-600 bg-pink-50/30 p-3 rounded-xl border border-pink-100/50">
                {address.street}, {address.city}, {address.state} - {address.zipCode}
              </div>
            ))}
            {user.addresses.length > 2 && (
              <p className="text-sm text-pink-600">+{user.addresses.length - 2} more addresses</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EditProfile({ formData, errors, loading, handleChange, handleSubmit, handleCancel }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-serif text-gray-900">Edit <span className="text-pink-gradient">Profile</span></h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white ${
              errors.firstName ? 'border-rose-300' : 'border-pink-200'
            }`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-rose-600">{errors.firstName}</p>
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
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white ${
              errors.lastName ? 'border-rose-300' : 'border-pink-200'
            }`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-rose-600">{errors.lastName}</p>
          )}
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
            className="w-full px-4 py-2.5 border border-pink-200 rounded-xl bg-pink-50/30 cursor-not-allowed"
            disabled
          />
          <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white ${
              errors.email ? 'border-rose-300' : 'border-pink-200'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-rose-600">{errors.email}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white ${
              errors.mobileNumber ? 'border-rose-300' : 'border-pink-200'
            }`}
            maxLength="10"
          />
          {errors.mobileNumber && (
            <p className="mt-1 text-sm text-rose-600">{errors.mobileNumber}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-pink-100">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2.5 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-pink-lg disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-300 transition-all duration-300 flex items-center gap-2"
        >
          <X size={18} />
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ProfileSection;
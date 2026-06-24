// src/pages/AccountPage.jsx - PINK THEME ✅
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, ShoppingBag, Heart, Star, Settings, 
  LogOut, Package, Calendar, ShoppingCart,
  ChevronRight, Edit2, CreditCard, Gift,
  Award, Clock, MapPin, Phone, Mail,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAccountData, getOrderHistory, getReviewStats } from '../services/api';

// Import components
import ProfileSection from '../components/account/ProfileSection';
import { OrderHistory } from '../components/account/OrderHistory';
import { ReviewStats } from '../components/account/ReviewStats';
import { CartSummary } from '../components/account/CartSummary';
import { WishlistSection } from '../components/account/WishlistSection';
import { AccountSettings } from '../components/account/AccountSettings';

export function AccountPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch account data
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAccountData();
    }
  }, [isAuthenticated, user]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [accountRes, ordersRes, reviewsRes] = await Promise.all([
        getAccountData(),
        getOrderHistory(),
        getReviewStats()
      ]);

      setAccountData(accountRes.data);
      setOrders(ordersRes.orders || []);
      setReviewStats(reviewsRes.data);
      
    } catch (error) {
      console.error('Error fetching account data:', error);
      setError('Failed to load account data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User size={20} /> },
    { id: 'orders', label: 'Orders', icon: <Package size={20} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto"></div>
            <User className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-pink-400 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your account...</p>
          <p className="text-sm text-gray-400 mt-1">🌸 Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 via-white to-pink-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="relative">
              <User className="w-8 h-8 text-pink-500" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-pink-400 animate-pulse" />
            </div>
            <h1 className="text-3xl font-serif text-gray-900">
              My <span className="text-pink-gradient">Account</span>
            </h1>
          </div>
          <p className="text-gray-500 mt-1 ml-11">Manage your profile, orders, and preferences</p>
        </div>

        {/* Stats Cards - Only on Overview */}
        {activeTab === 'overview' && accountData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard 
              icon={<ShoppingBag className="text-pink-600" size={24} />}
              label="Total Orders"
              value={accountData.totalOrders || 0}
              color="pink"
            />
            <StatsCard 
              icon={<ShoppingCart className="text-rose-600" size={24} />}
              label="Cart Items"
              value={accountData.cartCount || 0}
              color="rose"
            />
            <StatsCard 
              icon={<Heart className="text-red-500" size={24} />}
              label="Wishlist"
              value={accountData.wishlistCount || 0}
              color="red"
            />
            <StatsCard 
              icon={<Star className="text-amber-500" size={24} />}
              label="Reviews Given"
              value={reviewStats?.totalReviews || 0}
              color="amber"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-pink-md border border-pink-100/50 p-4 sticky top-8 hover:shadow-pink-lg transition-all duration-300">
              {/* User Avatar & Name */}
              <div className="text-center pb-6 border-b border-pink-100 mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-3 shadow-md hover:shadow-pink-lg transition-all duration-300">
                  <span className="text-3xl font-bold text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 font-medium shadow-inner'
                        : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    <span className={activeTab === tab.id ? 'text-pink-600' : 'text-gray-400'}>
                      {tab.icon}
                    </span>
                    <span className="flex-1 text-left">{tab.label}</span>
                    <ChevronRight size={16} className={`transition-all ${
                      activeTab === tab.id ? 'text-pink-600 translate-x-0.5' : 'text-gray-400'
                    }`} />
                  </button>
                ))}
                
                <hr className="my-4 border-pink-100" />
                
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all duration-300 group"
                >
                  <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-pink-md border border-pink-100/50 p-6 hover:shadow-pink-lg transition-all duration-300">
              {activeTab === 'overview' && (
                <OverviewTab 
                  user={user} 
                  accountData={accountData}
                  orders={orders}
                  reviewStats={reviewStats}
                />
              )}
              
              {activeTab === 'orders' && (
                <OrderHistory orders={orders} />
              )}
              
              {activeTab === 'wishlist' && (
                <WishlistSection />
              )}
              
              {activeTab === 'reviews' && (
                <ReviewStats data={reviewStats} />
              )}
              
              {activeTab === 'settings' && (
                <AccountSettings user={user} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon, label, value, color }) {
  const colors = {
    pink: 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200',
    rose: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200',
    red: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200',
    amber: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200',
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
    green: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
  };

  const iconColors = {
    pink: 'text-pink-600',
    rose: 'text-rose-600',
    red: 'text-red-500',
    amber: 'text-amber-500',
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
  };

  return (
    <div className={`${colors[color]} border rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-pink-lg cursor-default group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-pink-600 transition-colors">{value}</p>
        </div>
        <div className={`bg-white rounded-full p-3 shadow-sm ${iconColors[color]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ user, accountData, orders, reviewStats }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-pink-500" />
        <h2 className="text-xl font-serif text-gray-900">Dashboard <span className="text-pink-gradient">Overview</span></h2>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <QuickActionCard 
          icon={<ShoppingBag />}
          label="Shop Now"
          onClick={() => navigate('/products')}
          color="pink"
        />
        <QuickActionCard 
          icon={<Heart />}
          label="View Wishlist"
          onClick={() => navigate('/wishlist')}
          color="rose"
        />
        <QuickActionCard 
          icon={<ShoppingCart />}
          label="View Cart"
          onClick={() => navigate('/cart')}
          color="purple"
        />
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <button 
            onClick={() => window.location.href = '/orders'}
            className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors flex items-center gap-1"
          >
            View All
            <ChevronRight size={16} />
          </button>
        </div>
        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-pink-50/50 rounded-xl border border-pink-100">
            <ShoppingBag className="w-12 h-12 text-pink-300 mx-auto mb-2" />
            <p className="text-gray-500">No orders yet. Start shopping!</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
        <div className="text-center group">
          <p className="text-sm text-gray-600">Member Since</p>
          <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
            {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="text-center group">
          <p className="text-sm text-gray-600">Total Spent</p>
          <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
            ₹{accountData?.totalSpent?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="text-center group">
          <p className="text-sm text-gray-600">Reviews</p>
          <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">{reviewStats?.totalReviews || 0}</p>
        </div>
      </div>
    </div>
  );
}

// Quick Action Card
function QuickActionCard({ icon, label, onClick, color }) {
  const colors = {
    pink: 'hover:border-pink-300 hover:shadow-pink-md',
    rose: 'hover:border-rose-300 hover:shadow-rose-md',
    purple: 'hover:border-purple-300 hover:shadow-purple-md',
  };

  const iconColors = {
    pink: 'text-pink-600',
    rose: 'text-rose-600',
    purple: 'text-purple-600',
  };

  return (
    <button
      onClick={onClick}
      className={`bg-white border border-pink-100 rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 ${colors[color]} group`}
    >
      <div className={`${iconColors[color]} flex justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">{label}</p>
    </button>
  );
}

// Order Card Component
function OrderCard({ order }) {
  const statusColors = {
    'pending': 'bg-amber-100 text-amber-700',
    'processing': 'bg-blue-100 text-blue-700',
    'shipped': 'bg-purple-100 text-purple-700',
    'delivered': 'bg-green-100 text-green-700',
    'cancelled': 'bg-red-100 text-red-700',
  };

  return (
    <div className="border border-pink-100 rounded-xl p-4 hover:shadow-pink-md transition-all duration-300 hover:border-pink-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
          <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={14} className="text-pink-400" />
              {new Date(order.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
              {order.status || 'Pending'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-900">₹{order.total.toFixed(2)}</span>
          <button className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors flex items-center gap-1">
            View Details
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
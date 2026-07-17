// src/pages/AccountPage.jsx - COMPLETE WITH NAVIGATION STATE HANDLING ✅
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, ShoppingBag, Heart, Star, Settings, 
  LogOut, Package, Calendar, ShoppingCart,
  ChevronRight, Edit2, CreditCard, Gift,
  Award, Clock, MapPin, Phone, Mail,
  Sparkles, Eye, X, Loader, XCircle,
  Truck, CheckCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import checkoutService from '../services/checkoutService';
import { toast } from 'react-hot-toast';

// Status Configuration
const statusConfig = {
  Pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  Processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: RefreshCw },
  Shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
  Delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  Cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  Returned: { label: 'Returned', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: XCircle }
};

export function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Handle navigation state from OrderSuccessModal
  useEffect(() => {
    // Check if we have navigation state from OrderSuccessModal
    const state = location.state;
    if (state) {
      // Set active tab to orders if specified
      if (state.activeTab) {
        setActiveTab(state.activeTab);
      }
      
      // If there's a selected order ID, fetch and show it
      if (state.selectedOrderId) {
        // Small delay to ensure orders are loaded first
        setTimeout(() => {
          viewOrderDetails(state.selectedOrderId);
        }, 500);
      }
      
      // Clear the location state to prevent re-triggering on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch account data
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAccountData();
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  // Fetch orders with pagination
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      checkoutService.setToken(token);
      const response = await checkoutService.getMyOrders(page);
      
      if (response.success) {
        setOrders(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountData = async () => {
    try {
      setError('');
      
      // Calculate account data from orders
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      setAccountData({
        totalOrders: totalOrders,
        cartCount: 0,
        wishlistCount: 0,
        totalSpent: totalSpent
      });
      
      setReviewStats({
        totalReviews: 0,
        averageRating: 0
      });
      
    } catch (error) {
      console.error('Error fetching account data:', error);
      setError('Failed to load account data. Please try again.');
    }
  };

  // View order details
  const viewOrderDetails = async (orderId) => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      checkoutService.setToken(token);
      const response = await checkoutService.getOrderById(orderId);
      
      if (response.success) {
        setSelectedOrder(response.data);
        setShowOrderDetails(true);
      } else {
        toast.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setCancelling(true);
      checkoutService.setToken(token);
      const response = await checkoutService.cancelOrder(orderId, 'Cancelled by user');
      
      if (response.success) {
        toast.success('Order cancelled successfully');
        await fetchOrders(pagination.currentPage);
        if (showOrderDetails) {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User size={20} /> },
    { id: 'orders', label: 'Orders', icon: <Package size={20} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  if (loading && orders.length === 0) {
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
                  navigate={navigate}
                />
              )}
              
              {activeTab === 'orders' && (
                <OrdersTab 
                  orders={orders}
                  loading={loading}
                  pagination={pagination}
                  onViewOrder={viewOrderDetails}
                  onCancelOrder={cancelOrder}
                  onPageChange={fetchOrders}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  cancelling={cancelling}
                />
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

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          onCancel={cancelOrder}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          statusConfig={statusConfig}
          cancelling={cancelling}
        />
      )}
    </div>
  );
}

// ============================================
// STATS CARD COMPONENT
// ============================================

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

// ============================================
// OVERVIEW TAB COMPONENT
// ============================================

function OverviewTab({ user, accountData, orders, reviewStats, navigate }) {
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
            onClick={() => window.location.href = '/account'}
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

// ============================================
// QUICK ACTION CARD
// ============================================

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

// ============================================
// ORDER CARD
// ============================================

function OrderCard({ order }) {
  const statusColors = {
    'Pending': 'bg-amber-100 text-amber-700',
    'Processing': 'bg-blue-100 text-blue-700',
    'Shipped': 'bg-purple-100 text-purple-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Returned': 'bg-orange-100 text-orange-700',
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
          <span className="font-bold text-gray-900">₹{order.total?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ORDERS TAB COMPONENT - FULL ORDER MANAGEMENT
// ============================================

function OrdersTab({ 
  orders, 
  loading, 
  pagination, 
  onViewOrder, 
  onCancelOrder,
  onPageChange,
  formatCurrency,
  formatDate,
  cancelling
}) {
  if (loading && orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Loader className="w-12 h-12 animate-spin text-pink-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛍️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
        <button
          onClick={() => window.location.href = '/products'}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-pink-600" />
          <h2 className="text-xl font-serif text-gray-900">My Orders</h2>
        </div>
        <span className="text-sm text-gray-500">
          {pagination.totalItems} orders total
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = statusConfig[order.status]?.icon || Clock;
          const statusColor = statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800';
          
          return (
            <div 
              key={order._id}
              className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-bold text-pink-600">
                      {order.orderNumber}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  
                  <div className="mt-1 flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-600">
                      {order.items?.length || 0} item{order.items?.length > 1 ? 's' : ''}
                    </span>
                    <span className="font-bold text-pink-600">
                      {formatCurrency(order.total)}
                    </span>
                    <span className="text-gray-500">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewOrder(order._id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  {(order.status === 'Pending' || order.status === 'Processing') && (
                    <button
                      onClick={() => onCancelOrder(order._id)}
                      disabled={cancelling}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {cancelling ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              
              {/* Items Preview */}
              {order.items && order.items.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-xs bg-pink-50 px-2 py-1 rounded-full text-gray-600">
                      {item.productName} × {item.quantity}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs bg-pink-50 px-2 py-1 rounded-full text-gray-400">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            let pageNum;
            if (pagination.totalPages <= 5) {
              pageNum = i + 1;
            } else if (pagination.currentPage <= 3) {
              pageNum = i + 1;
            } else if (pagination.currentPage >= pagination.totalPages - 2) {
              pageNum = pagination.totalPages - 4 + i;
            } else {
              pageNum = pagination.currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 rounded-lg ${
                  pagination.currentPage === pageNum
                    ? 'bg-pink-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// ORDER DETAILS MODAL
// ============================================

function OrderDetailsModal({ 
  order, 
  onClose, 
  onCancel, 
  formatCurrency, 
  formatDate, 
  statusConfig,
  cancelling 
}) {
  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Order Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-xl font-bold text-pink-600">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[order.status]?.color || 'bg-gray-100'}`}>
                <StatusIcon className="w-4 h-4" />
                {statusConfig[order.status]?.label || order.status}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{order.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.shippingAddress?.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-600" />
                Shipping Address
              </h3>
              <p className="text-gray-600">
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && <><br />{order.shippingAddress.addressLine2}</>}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.productName}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan="3" className="px-4 py-2 text-right font-medium">Subtotal</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(order.subtotal)}</td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-right text-sm text-green-600">Discount</td>
                      <td className="px-4 py-2 text-right text-sm text-green-600">-{formatCurrency(order.discount)}</td>
                    </tr>
                  )}
                  {order.shippingCharges > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-right text-sm text-gray-600">Shipping</td>
                      <td className="px-4 py-2 text-right text-sm text-gray-600">{formatCurrency(order.shippingCharges)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan="3" className="px-4 py-3 text-right text-base font-bold">Total</td>
                    <td className="px-4 py-3 text-right text-base font-bold text-pink-600">{formatCurrency(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Order Timeline</h3>
              <div className="space-y-2">
                {order.statusHistory.slice().reverse().map((history, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-pink-500 shrink-0"></div>
                    <div>
                      <p className="font-medium">{history.status}</p>
                      <p className="text-gray-500 text-xs">{formatDate(history.date)}</p>
                      {history.note && <p className="text-gray-400 text-xs">{history.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {(order.status === 'Pending' || order.status === 'Processing') && (
              <button
                onClick={() => onCancel(order._id)}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PLACEHOLDER COMPONENTS
// ============================================

function WishlistSection() {
  return (
    <div className="text-center py-12">
      <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Wishlist</h3>
      <p className="text-gray-500">Items you've saved will appear here</p>
    </div>
  );
}

function ReviewStats({ data }) {
  return (
    <div className="text-center py-12">
      <Star className="w-16 h-16 text-amber-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Reviews</h3>
      <p className="text-gray-500">Reviews you've written will appear here</p>
      {data && (
        <div className="mt-4">
          <p className="text-2xl font-bold text-amber-500">{data.averageRating || 0} ★</p>
          <p className="text-sm text-gray-500">{data.totalReviews || 0} reviews</p>
        </div>
      )}
    </div>
  );
}

function AccountSettings({ user }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-serif text-gray-900">Account Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <p className="font-medium text-gray-900">Name</p>
            <p className="text-sm text-gray-500">{user?.firstName} {user?.lastName}</p>
          </div>
          <button className="text-pink-600 hover:text-pink-700 text-sm">Edit</button>
        </div>
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <p className="font-medium text-gray-900">Email</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <button className="text-pink-600 hover:text-pink-700 text-sm">Edit</button>
        </div>
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <p className="font-medium text-gray-900">Phone</p>
            <p className="text-sm text-gray-500">{user?.mobileNumber || 'Not set'}</p>
          </div>
          <button className="text-pink-600 hover:text-pink-700 text-sm">Edit</button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900">Password</p>
            <p className="text-sm text-gray-500">••••••••</p>
          </div>
          <button className="text-pink-600 hover:text-pink-700 text-sm">Change</button>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
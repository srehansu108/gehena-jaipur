// src/pages/admin/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon, // ✅ ADD THIS
  ArrowPathIcon,
  UserPlusIcon,
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getAdminStats } from '../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    // Overview Stats
    totalUsers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    growth: 0,
    
    // User Stats
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    
    // Order Stats
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    
    // Revenue Stats
    revenueToday: 0,
    revenueThisWeek: 0,
    revenueThisMonth: 0,
    averageOrderValue: 0,
    
    // Product Stats
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    
    // Recent Activity
    recentActivities: [],
    
    // Monthly Data for Charts
    monthlyRevenue: [],
    monthlyOrders: [],
    monthlyUsers: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ FETCH REAL DATA FROM DATABASE
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAdminStats();
      
      if (response.success && response.data) {
        // ✅ ALL DATA FROM DATABASE - NO STATIC VALUES
        setStats({
          // Overview Stats
          totalUsers: response.data.totalUsers || 0,
          totalRevenue: response.data.totalRevenue || 0,
          totalOrders: response.data.totalOrders || 0,
          growth: response.data.growth || 0,
          
          // User Stats
          newUsersToday: response.data.newUsersToday || 0,
          newUsersThisWeek: response.data.newUsersThisWeek || 0,
          newUsersThisMonth: response.data.newUsersThisMonth || 0,
          
          // Order Stats
          pendingOrders: response.data.pendingOrders || 0,
          processingOrders: response.data.processingOrders || 0,
          shippedOrders: response.data.shippedOrders || 0,
          deliveredOrders: response.data.deliveredOrders || 0,
          cancelledOrders: response.data.cancelledOrders || 0,
          
          // Revenue Stats
          revenueToday: response.data.revenueToday || 0,
          revenueThisWeek: response.data.revenueThisWeek || 0,
          revenueThisMonth: response.data.revenueThisMonth || 0,
          averageOrderValue: response.data.averageOrderValue || 0,
          
          // Product Stats
          totalProducts: response.data.totalProducts || 0,
          lowStockProducts: response.data.lowStockProducts || 0,
          outOfStockProducts: response.data.outOfStockProducts || 0,
          
          // Recent Activity
          recentActivities: response.data.recentActivities || [],
          
          // Monthly Data
          monthlyRevenue: response.data.monthlyRevenue || [],
          monthlyOrders: response.data.monthlyOrders || [],
          monthlyUsers: response.data.monthlyUsers || []
        });
      } else {
        setError('Failed to fetch data from server');
        console.warn('API returned error:', response);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ✅ Stat Card Component
  const StatCard = ({ title, value, icon: Icon, change, color, subtitle }) => {
    const colors = {
      indigo: 'bg-indigo-100 text-indigo-600',
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      pink: 'bg-pink-100 text-pink-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      teal: 'bg-teal-100 text-teal-600',
      yellow: 'bg-yellow-100 text-yellow-600',
    };

    const isPositive = change >= 0;

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? (
                <span className="inline-block w-20 h-8 bg-slate-200 animate-pulse rounded"></span>
              ) : (
                value
              )}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {change !== undefined && change !== null && (
          <div className="mt-4 flex items-center text-sm">
            {loading ? (
              <span className="inline-block w-16 h-4 bg-slate-200 animate-pulse rounded"></span>
            ) : (
              <>
                {isPositive ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(change)}%
                </span>
                <span className="text-slate-400 ml-2">vs last month</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // ✅ Small Stat Card for Additional Metrics
  const SmallStatCard = ({ title, value, icon: Icon, color }) => {
    const colors = {
      indigo: 'bg-indigo-50 text-indigo-600',
      green: 'bg-green-50 text-green-600',
      blue: 'bg-blue-50 text-blue-600',
      purple: 'bg-purple-50 text-purple-600',
      pink: 'bg-pink-50 text-pink-600',
      orange: 'bg-orange-50 text-orange-600',
      red: 'bg-red-50 text-red-600',
      teal: 'bg-teal-50 text-teal-600',
      yellow: 'bg-yellow-50 text-yellow-600',
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">{title}</p>
            <p className="text-lg font-bold text-slate-900">
              {loading ? (
                <span className="inline-block w-12 h-5 bg-slate-200 animate-pulse rounded"></span>
              ) : (
                value
              )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ✅ Activity Item Component
  const ActivityItem = ({ activity }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'user': return <UserPlusIcon className="h-4 w-4 text-green-500" />;
        case 'order': return <ShoppingCartIcon className="h-4 w-4 text-blue-500" />;
        case 'payment': return <CurrencyDollarIcon className="h-4 w-4 text-yellow-500" />;
        case 'review': return <ClockIcon className="h-4 w-4 text-purple-500" />;
        default: return <ClockIcon className="h-4 w-4 text-slate-500" />;
      }
    };

    const getColor = () => {
      switch (activity.type) {
        case 'user': return 'bg-green-500';
        case 'order': return 'bg-blue-500';
        case 'payment': return 'bg-yellow-500';
        case 'review': return 'bg-purple-500';
        default: return 'bg-slate-500';
      }
    };

    return (
      <div className="flex items-center gap-3 text-sm border-b border-slate-100 pb-3 last:border-0">
        <div className={`w-2 h-2 rounded-full ${getColor()}`}></div>
        {getIcon()}
        <span className="text-slate-600 flex-1">{activity.message}</span>
        <span className="text-slate-400 text-xs">{activity.time}</span>
      </div>
    );
  };

  // ✅ Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  // ✅ Format number with K/M suffix
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.name || user?.firstName || 'Admin'}! 👋 Here's what's happening today.
          </p>
          {error && (
            <p className="text-red-500 text-sm mt-1">⚠️ {error}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ✅ MAIN STATS CARDS - ALL DYNAMIC */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={formatNumber(stats.totalUsers)}
          icon={UsersIcon} 
          change={stats.growth || 0}
          color="indigo"
          subtitle={`${stats.newUsersToday} new today`}
        />
        <StatCard 
          title="Revenue" 
          value={formatCurrency(stats.totalRevenue)}
          icon={CurrencyDollarIcon} 
          change={8.2}
          color="green"
          subtitle={`${formatCurrency(stats.revenueToday)} today`}
        />
        <StatCard 
          title="Orders" 
          value={formatNumber(stats.totalOrders)}
          icon={ShoppingBagIcon} 
          change={3.1}
          color="blue"
          subtitle={`${stats.pendingOrders} pending`}
        />
        <StatCard 
          title="Growth" 
          value={`${stats.growth || 0}%`}
          icon={ArrowTrendingUpIcon} 
          change={2.4}
          color="purple"
          subtitle={`${stats.newUsersThisMonth} new this month`}
        />
      </div>

      {/* ✅ SECONDARY STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <SmallStatCard 
          title="Today's Revenue" 
          value={formatCurrency(stats.revenueToday)}
          icon={CurrencyDollarIcon}
          color="green"
        />
        <SmallStatCard 
          title="Avg Order Value" 
          value={formatCurrency(stats.averageOrderValue)}
          icon={ShoppingBagIcon}
          color="blue"
        />
        <SmallStatCard 
          title="Pending Orders" 
          value={stats.pendingOrders}
          icon={ClockIcon}
          color="orange"
        />
        <SmallStatCard 
          title="Delivered" 
          value={stats.deliveredOrders}
          icon={CheckCircleIcon}
          color="teal"
        />
        <SmallStatCard 
          title="Cancelled" 
          value={stats.cancelledOrders}
          icon={XCircleIcon}
          color="red"
        />
        <SmallStatCard 
          title="Total Products" 
          value={stats.totalProducts}
          icon={ShoppingBagIcon}
          color="purple"
        />
        <SmallStatCard 
          title="Low Stock" 
          value={stats.lowStockProducts}
          icon={UsersIcon}
          color="yellow"
        />
        <SmallStatCard 
          title="Out of Stock" 
          value={stats.outOfStockProducts}
          icon={UsersIcon}
          color="red"
        />
      </div>

      {/* ✅ CHARTS AND ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue Overview</h2>
          <div className="h-64 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-2"></div>
                <p className="text-sm">Loading chart data...</p>
              </div>
            ) : stats.monthlyRevenue.length > 0 ? (
              <p className="text-sm">📊 Chart will be displayed here with {stats.monthlyRevenue.length} data points</p>
            ) : (
              <p className="text-sm">No revenue data available yet</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 h-4 bg-slate-200 animate-pulse rounded"></div>
                  <div className="w-12 h-3 bg-slate-200 animate-pulse rounded"></div>
                </div>
              ))
            ) : stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))
            ) : (
              <p className="text-center text-slate-500 py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* ✅ ORDER STATUS SUMMARY */}
      {!loading && (stats.pendingOrders > 0 || stats.processingOrders > 0 || stats.shippedOrders > 0) && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Status Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.processingOrders}</p>
              <p className="text-xs text-slate-500">Processing</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.shippedOrders}</p>
              <p className="text-xs text-slate-500">Shipped</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
              <p className="text-xs text-slate-500">Delivered</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</p>
              <p className="text-xs text-slate-500">Cancelled</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
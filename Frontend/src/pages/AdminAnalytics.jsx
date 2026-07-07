// src/pages/admin/AdminAnalytics.jsx

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EyeIcon,
  StarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { getAnalyticsData } from '../services/api';

// Custom colors for charts
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6'];
const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  pink: '#ec4899',
  purple: '#8b5cf6',
};

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState({
    revenue: {
      total: 0,
      growth: 0,
      history: [],
      monthly: [],
      byCategory: []
    },
    orders: {
      total: 0,
      growth: 0,
      history: [],
      status: []
    },
    users: {
      total: 0,
      growth: 0,
      history: [],
      newUsers: 0,
      activeUsers: 0
    },
    products: {
      total: 0,
      topSelling: [],
      categories: [],
      lowStock: []
    },
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalProducts: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      growthRate: 0
    }
  });

  // ✅ FETCH ANALYTICS DATA FROM DATABASE
  const fetchAnalytics = async () => {
  setLoading(true);
  setError(null);
  
  try {
    console.log('📊 Fetching analytics data for range:', timeRange);
    const response = await getAnalyticsData({ range: timeRange });
    
    console.log('📥 Analytics response:', response);
    
    if (response.success && response.data) {
      setAnalytics({
        revenue: {
          total: response.data.revenue?.total || 0,
          growth: response.data.revenue?.growth || 0,
          history: response.data.revenue?.history || [],
          monthly: response.data.revenue?.monthly || [],
          byCategory: response.data.revenue?.byCategory || []
        },
        orders: {
          total: response.data.orders?.total || 0,
          growth: response.data.orders?.growth || 0,
          history: response.data.orders?.history || [],
          status: response.data.orders?.status || []
        },
        users: {
          total: response.data.users?.total || 0,
          growth: response.data.users?.growth || 0,
          history: response.data.users?.history || [],
          newUsers: response.data.users?.newUsers || 0,
          activeUsers: response.data.users?.activeUsers || 0
        },
        products: {
          total: response.data.products?.total || 0,
          topSelling: response.data.products?.topSelling || [],
          categories: response.data.products?.categories || [],
          lowStock: response.data.products?.lowStock || []
        },
        overview: {
          totalRevenue: response.data.overview?.totalRevenue || 0,
          totalOrders: response.data.overview?.totalOrders || 0,
          totalUsers: response.data.overview?.totalUsers || 0,
          totalProducts: response.data.overview?.totalProducts || 0,
          conversionRate: response.data.overview?.conversionRate || 0,
          averageOrderValue: response.data.overview?.averageOrderValue || 0,
          growthRate: response.data.overview?.growthRate || 0
        }
      });
    } else {
      setError('Failed to fetch analytics data');
      console.warn('API returned error:', response);
    }
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    setError(error.message || 'Network error occurred');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // ✅ STAT CARD COMPONENT
  const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => {
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
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
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
                <span className="text-slate-400 ml-2">vs previous period</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // ✅ RENDER LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // ✅ RENDER ERROR
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">⚠️ {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Track your store performance and growth metrics
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowTrendingUpIcon className="h-5 w-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview - ALL DYNAMIC */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${analytics.overview.totalRevenue.toLocaleString()}`}
          change={analytics.overview.growthRate || 0}
          icon={CurrencyDollarIcon}
          color="bg-green-600"
          subtitle={`${analytics.orders.total} orders`}
        />
        <StatCard
          title="Total Orders"
          value={analytics.overview.totalOrders.toLocaleString()}
          change={analytics.orders.growth || 0}
          icon={ShoppingBagIcon}
          color="bg-blue-600"
          subtitle={`Avg: $${analytics.overview.averageOrderValue.toFixed(0)}`}
        />
        <StatCard
          title="Total Users"
          value={analytics.overview.totalUsers.toLocaleString()}
          change={analytics.users.growth || 0}
          icon={UsersIcon}
          color="bg-purple-600"
          subtitle={`${analytics.users.newUsers} new this period`}
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics.overview.conversionRate.toFixed(1)}%`}
          change={0}
          icon={ChartBarIcon}
          color="bg-pink-600"
          subtitle={`${analytics.products.total} products`}
        />
      </div>

      {/* Revenue Chart - DYNAMIC DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue Overview</h2>
          <div className="h-80">
            {analytics.revenue.history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.revenue.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      try {
                        return format(new Date(value), 'dd MMM');
                      } catch {
                        return value;
                      }
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    labelFormatter={(label) => {
                      try {
                        return format(new Date(label), 'dd MMM yyyy');
                      } catch {
                        return label;
                      }
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={CHART_COLORS.primary}
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.2}
                    name="Revenue"
                  />
                  <Bar 
                    dataKey="orders" 
                    barSize={20} 
                    fill={CHART_COLORS.secondary}
                    name="Orders"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No revenue data available for this period
              </div>
            )}
          </div>
        </div>

        {/* Revenue by Category - DYNAMIC DATA */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Category</h2>
          <div className="h-80">
            {analytics.revenue.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.revenue.byCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.revenue.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders & Users Chart - DYNAMIC DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Orders Status</h2>
          <div className="h-64">
            {analytics.orders.status.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.orders.status}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.orders.status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No order data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">User Growth</h2>
          <div className="h-64">
            {analytics.users.history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.users.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      try {
                        return format(new Date(value), 'dd MMM');
                      } catch {
                        return value;
                      }
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(label) => {
                      try {
                        return format(new Date(label), 'dd MMM yyyy');
                      } catch {
                        return label;
                      }
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke={CHART_COLORS.success}
                    fill={CHART_COLORS.success}
                    fillOpacity={0.2}
                    name="New Users"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="active" 
                    stroke={CHART_COLORS.info}
                    fill={CHART_COLORS.info}
                    fillOpacity={0.2}
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No user data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Products & Low Stock - DYNAMIC DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <StarIcon className="h-5 w-5 text-yellow-500" />
            Top Selling Products
          </h2>
          <div className="space-y-4">
            {analytics.products.topSelling.length > 0 ? (
              analytics.products.topSelling.map((product, index) => (
                <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600">${product.revenue?.toLocaleString() || 0}</p>
                    <p className="text-sm text-slate-500">{product.sold || 0} sold</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-4">No products sold yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-red-500" />
            Low Stock Alert
          </h2>
          <div className="space-y-4">
            {analytics.products.lowStock.length > 0 ? (
              analytics.products.lowStock.map((product, index) => (
                <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      product.stockCount === 0 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      product.stockCount === 0 ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {product.stockCount || 0} left
                    </p>
                    <button className="text-xs text-indigo-600 hover:text-indigo-800">
                      Restock
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-green-500 py-4">
                ✅ All products are well stocked!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Overview - DYNAMIC DATA */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Month</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">Revenue</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">Orders</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">Users</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">Avg. Order</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">Growth</th>
              </tr>
            </thead>
            <tbody>
              {analytics.revenue.monthly.length > 0 ? (
                analytics.revenue.monthly.map((month, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {format(new Date(month.month), 'MMM yyyy')}
                    </td>
                    <td className="py-3 px-4 text-right">${month.revenue?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-right">{month.orders?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-right">{month.users?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-right">${month.avgOrderValue?.toFixed(0) || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={month.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {month.growth >= 0 ? '+' : ''}{month.growth?.toFixed(1) || 0}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    No monthly data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
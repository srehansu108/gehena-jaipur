// src/pages/admin/AdminOrderManagement.jsx - PRODUCTION READY ✅

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpDownIcon,
  ArrowPathIcon,
  XMarkIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { 
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============================================
// STATUS CONFIGURATION
// ============================================

const statusConfig = {
  Pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: ClockIcon,
    nextStatuses: ['Processing', 'Cancelled']
  },
  Processing: { 
    label: 'Processing', 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: ArrowPathIcon,
    nextStatuses: ['Shipped', 'Cancelled']
  },
  Shipped: { 
    label: 'Shipped', 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: TruckIcon,
    nextStatuses: ['Delivered', 'Cancelled']
  },
  Delivered: { 
    label: 'Delivered', 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircleIcon,
    nextStatuses: ['Returned']
  },
  Cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: XCircleIcon,
    nextStatuses: []
  },
  Returned: { 
    label: 'Returned', 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    icon: XCircleIcon,
    nextStatuses: []
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminOrderManagement() {
  const { token, user } = useAuth();
  
  // ===== STATE =====
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0,
    avgOrderValue: 0
  });
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [exporting, setExporting] = useState(false);

  // ============================================
  // DATA FETCHING - FROM BACKEND ✅
  // ============================================

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ ALWAYS fetch from backend API
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sort: sortConfig.key,
        order: sortConfig.direction,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm })
      });

      console.log('📡 Fetching orders from backend...', `${API_URL}/orders/admin/orders?${params}`);

      const response = await axios.get(
        `${API_URL}/orders/admin/orders?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('📦 Orders response:', response.data);

      if (response.data.success) {
        setOrders(response.data.data || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false
        });
        setStats(response.data.stats || {
          total: 0,
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          revenue: 0,
          avgOrderValue: 0
        });
      } else {
        setError(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      
      // ✅ Better error handling
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        toast.error('Please login again');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view orders.');
        toast.error('Access denied');
      } else if (err.response?.status === 404) {
        setError('Orders API not found. Please check your backend.');
        toast.error('Orders API not found');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch orders');
        toast.error('Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  }, [
    pagination.currentPage, 
    pagination.itemsPerPage, 
    sortConfig, 
    filterStatus, 
    searchTerm, 
    token
  ]);

  // ============================================
  // ORDER OPERATIONS - FROM BACKEND ✅
  // ============================================

  const updateOrderStatus = async (orderId, status, note) => {
    try {
      setUpdatingStatus(true);
      
      console.log('📡 Updating order status:', orderId, status);

      const response = await axios.put(
        `${API_URL}/orders/admin/${orderId}/status`,
        { status, note: note || `Order status updated to ${status}` },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(`Order status updated to ${status}`);
        setShowStatusModal(false);
        setStatusNote('');
        await fetchOrders();
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('❌ Error updating order status:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!orderId) return;
    
    try {
      console.log('📡 Deleting order:', orderId);

      const response = await axios.delete(
        `${API_URL}/orders/admin/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Order deleted successfully');
        setShowDeleteConfirm(false);
        setOrderToDelete(null);
        await fetchOrders();
      } else {
        toast.error(response.data.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error('❌ Error deleting order:', err);
      toast.error(err.response?.data?.message || 'Failed to delete order');
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      console.log('📡 Fetching order details:', orderId);

      const response = await axios.get(
        `${API_URL}/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setShowDetailsModal(true);
      } else {
        toast.error(response.data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error('❌ Error fetching order details:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch order details');
    }
  };

  // ============================================
  // HANDLER FUNCTIONS
  // ============================================

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusFilterChange = (value) => {
    setFilterStatus(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  const exportOrdersCSV = async () => {
    try {
      setExporting(true);
      const ordersToExport = orders;
      
      const headers = ['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date', 'Items'];
      const csvRows = [headers];
      
      ordersToExport.forEach(order => {
        const itemsList = order.items?.map(item => 
          `${item.productName} x${item.quantity}`
        ).join('; ') || '';
        
        csvRows.push([
          order.orderNumber || order._id,
          order.userName || order.shippingAddress?.fullName || 'N/A',
          order.userEmail || order.shippingAddress?.email || 'N/A',
          order.total || 0,
          order.status || 'Pending',
          new Date(order.createdAt).toLocaleDateString('en-IN'),
          itemsList
        ]);
      });

      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Orders exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export orders');
    } finally {
      setExporting(false);
    }
  };

  // ============================================
  // FORMATTING HELPERS
  // ============================================

  const formatCurrency = (amount) => {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================
  // EFFECTS
  // ============================================

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when filters change
  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [fetchOrders, token]);

  // ============================================
  // RENDER
  // ============================================

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ===== HEADER ===== */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />
              Order Management
              <span className="text-sm font-normal text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                {stats.total} Orders
              </span>
            </h1>
            <p className="text-gray-600 mt-1">Manage all jewellery orders from your store</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={exportOrdersCSV}
              disabled={exporting || orders.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {exporting ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <DocumentArrowDownIcon className="h-4 w-4" />
              )}
              Export CSV
            </button>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard 
          label="Total Orders" 
          value={stats.total} 
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          icon={ShoppingBagIcon}
        />
        <StatCard 
          label="Pending" 
          value={stats.pending} 
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
          icon={ClockIcon}
        />
        <StatCard 
          label="Processing" 
          value={stats.processing} 
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          icon={ArrowPathIcon}
        />
        <StatCard 
          label="Shipped" 
          value={stats.shipped} 
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          icon={TruckIcon}
        />
        <StatCard 
          label="Delivered" 
          value={stats.delivered} 
          color="bg-gradient-to-br from-green-500 to-green-600"
          icon={CheckCircleIcon}
        />
      </div>

      {/* ===== REVENUE STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Average Order Value</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgOrderValue || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Cancelled Orders</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled || 0}</p>
        </div>
      </div>

      {/* ===== FILTERS & SEARCH ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full sm:w-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
              <option value="all">All Status</option>
              {Object.keys(statusConfig).map((status) => (
                <option key={status} value={status}>{statusConfig[status].label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ===== ERROR STATE ===== */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchOrders}
            className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* ===== ORDERS TABLE ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('userName')}
                >
                  <div className="flex items-center gap-1">
                    Customer
                    <ChevronUpDownIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Items
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center gap-1">
                    Total
                    <ChevronUpDownIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <ChevronUpDownIcon className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div>
                      <p className="text-lg mb-2">📦 No orders found</p>
                      <p className="text-sm text-gray-400">
                        Orders will appear here once customers place orders
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const StatusIcon = statusConfig[order.status]?.icon || ClockIcon;
                  const statusLabel = statusConfig[order.status]?.label || order.status;
                  const statusColor = statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800 border-gray-200';
                  
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-indigo-600">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.userName || order.shippingAddress?.fullName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.userEmail || order.shippingAddress?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium text-gray-800">
                                {item.productName || 'Product'}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                {item.quantity}×
                              </span>
                              {item.metal && (
                                <span className="text-xs text-gray-400 ml-1">({item.metal})</span>
                              )}
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => viewOrderDetails(order._id)}
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowStatusModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Update Status"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => {
                              setOrderToDelete(order._id);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Order"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINATION ===== */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 flex-wrap gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{orders.length}</span> of{' '}
              <span className="font-medium">{pagination.totalItems}</span> orders
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      pagination.currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================= */}
      {/* MODALS */}
      {/* ============================================= */}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          statusConfig={statusConfig}
        />
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedOrder(null);
            setStatusNote('');
          }}
          onUpdate={updateOrderStatus}
          loading={updatingStatus}
          statusNote={statusNote}
          setStatusNote={setStatusNote}
          statusConfig={statusConfig}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onClose={() => {
            setShowDeleteConfirm(false);
            setOrderToDelete(null);
          }}
          onConfirm={() => deleteOrder(orderToDelete)}
          orderId={orderToDelete}
        />
      )}
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className={`${color} rounded-xl shadow-lg p-5 text-white transition-transform hover:scale-105 duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// ORDER DETAILS MODAL
// ============================================

function OrderDetailsModal({ order, onClose, formatCurrency, formatDate, statusConfig }) {
  const StatusIcon = statusConfig[order.status]?.icon || ClockIcon;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Order Header */}
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-lg font-bold text-indigo-600">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[order.status]?.color || 'bg-gray-100'}`}>
                <StatusIcon className="h-4 w-4" />
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
                <p className="font-medium">{order.userName || order.shippingAddress?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.userEmail || order.shippingAddress?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.shippingAddress?.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{order.paymentMethod || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
              <p className="text-gray-600 whitespace-pre-line">
                {order.shippingAddress.fullName}
                {order.shippingAddress.addressLine1 && `\n${order.shippingAddress.addressLine1}`}
                {order.shippingAddress.addressLine2 && `\n${order.shippingAddress.addressLine2}`}
                {order.shippingAddress.city && `\n${order.shippingAddress.city}, ${order.shippingAddress.state || ''} ${order.shippingAddress.postalCode || ''}`}
                {order.shippingAddress.country && `\n${order.shippingAddress.country}`}
              </p>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Order Items</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Metal</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm font-medium text-gray-800">{item.productName || 'Product'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{item.metal || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm text-center text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-2 text-sm text-right font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-right font-medium">Subtotal</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(order.subtotal)}</td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-right text-sm text-gray-600">Discount</td>
                      <td className="px-4 py-2 text-right text-sm text-green-600">-{formatCurrency(order.discount)}</td>
                    </tr>
                  )}
                  {order.tax > 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-right text-sm text-gray-600">Tax</td>
                      <td className="px-4 py-2 text-right text-sm text-gray-600">{formatCurrency(order.tax)}</td>
                    </tr>
                  )}
                  {order.shippingCharges > 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-right text-sm text-gray-600">Shipping</td>
                      <td className="px-4 py-2 text-right text-sm text-gray-600">{formatCurrency(order.shippingCharges)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan="4" className="px-4 py-3 text-right text-base font-bold">Total</td>
                    <td className="px-4 py-3 text-right text-base font-bold text-indigo-600">{formatCurrency(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Order Timeline</h3>
              <div className="space-y-2">
                {order.statusHistory.slice().reverse().map((history, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0"></div>
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

          {/* Customer Note */}
          {order.customerNote && (
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h3 className="font-semibold text-gray-700 mb-1">Customer Note</h3>
              <p className="text-sm text-gray-600">{order.customerNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STATUS UPDATE MODAL
// ============================================

function StatusUpdateModal({ 
  order, 
  onClose, 
  onUpdate, 
  loading, 
  statusNote, 
  setStatusNote,
  statusConfig 
}) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const availableStatuses = useMemo(() => {
    const current = statusConfig[order.status];
    if (!current) return Object.keys(statusConfig);
    return [order.status, ...(current.nextStatuses || [])];
  }, [order.status]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Order</p>
            <p className="font-semibold">{order.orderNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
            <div className="text-sm font-medium text-gray-900">
              {statusConfig[order.status]?.label || order.status}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusConfig[status]?.label || status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Add a note about this status update..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onUpdate(order._id, selectedStatus, statusNote)}
              disabled={loading || selectedStatus === order.status}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DELETE CONFIRMATION MODAL
// ============================================

function DeleteConfirmModal({ onClose, onConfirm, orderId }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Delete Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900">Are you sure?</h3>
            <p className="text-gray-600 mt-2">
              This action cannot be undone. This will permanently delete the order 
              <span className="font-medium text-gray-900"> {orderId}</span>.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
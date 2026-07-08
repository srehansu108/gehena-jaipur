// backend/controllers/orderController.js - COMPLETE FIXED ✅

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Generate unique order number
 */
async function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  const orderNumber = `JOR-${year}${month}${day}-${random}`;
  
  const existing = await Order.findOne({ orderNumber });
  if (existing) {
    return generateOrderNumber();
  }
  return orderNumber;
}

class OrderController {
  /**
   * Create a new order
   */
  async createOrder(req, res) {
    try {
      const {
        items,
        shippingAddress,
        paymentMethod,
        paymentDetails,
        couponCode,
        customerNote
      } = req.body;

      const userId = req.userId;

      console.log('📦 Creating order for user:', userId);

      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order must contain at least one item'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        let product = null;
        try {
          if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
            product = await Product.findById(item.productId);
          }
        } catch (e) {
          console.log('⚠️ Product lookup failed:', e.message);
        }

        const productName = product?.name || item.productName || 'Product';
        const productPrice = product?.price || item.price || 0;
        const productMetal = product?.metal || item.metal || '';
        const productCategory = product?.category || item.category || '';

        const itemTotal = productPrice * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: product?._id || item.productId || 'unknown',
          productName: productName,
          sku: product?.sku || `SKU-${Date.now()}`,
          quantity: item.quantity,
          price: productPrice,
          total: itemTotal,
          category: productCategory,
          metal: productMetal,
        });

        if (product) {
          product.stockCount = (product.stockCount || 0) - item.quantity;
          if (product.stockCount <= 0) {
            product.inStock = false;
          }
          await product.save();
        }
      }

      const discount = parseFloat(req.body.discount) || 0;
      const tax = parseFloat(req.body.tax) || 0;
      const shippingCharges = parseFloat(req.body.shippingCharges) || 0;
      const total = subtotal - discount + tax + shippingCharges;

      const orderNumber = await generateOrderNumber();

      const order = new Order({
        orderNumber,
        userId,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        items: orderItems,
        subtotal,
        discount,
        tax,
        shippingCharges,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'COD' : 'Paid',
        paymentDate: new Date(),
        transactionId: paymentDetails?.transactionId || `TXN-${Date.now()}`,
        shippingAddress: {
          fullName: shippingAddress.fullName || `${user.firstName} ${user.lastName}`,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country || 'India',
          phoneNumber: shippingAddress.phoneNumber || user.mobileNumber,
        },
        shippingMethod: req.body.shippingMethod || 'Standard',
        shippingStatus: 'Processing',
        status: 'Processing',
        couponCode: couponCode || '',
        couponDiscount: discount > 0 ? discount : 0,
        customerNote: customerNote || '',
        statusHistory: [{
          status: 'Processing',
          date: new Date(),
          note: 'Order placed and payment confirmed',
          updatedBy: 'System'
        }]
      });

      await order.save();

      console.log('✅ Order created successfully:', order.orderNumber);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
        orderNumber: order.orderNumber
      });

    } catch (error) {
      console.error('❌ Error creating order:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating order',
        error: error.message
      });
    }
  }

  /**
   * Get all orders with filters (Admin)
   */
  async getAdminOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        status,
        paymentStatus,
        startDate,
        endDate,
        search,
        minTotal,
        maxTotal,
      } = req.query;

      const query = {};

      if (status) {
        query.status = status;
      }

      if (paymentStatus) {
        query.paymentStatus = paymentStatus;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      if (minTotal || maxTotal) {
        query.total = {};
        if (minTotal) {
          query.total.$gte = parseFloat(minTotal);
        }
        if (maxTotal) {
          query.total.$lte = parseFloat(maxTotal);
        }
      }

      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { userEmail: { $regex: search, $options: 'i' } },
          { userName: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      const sortOrder = order === 'desc' ? -1 : 1;
      const sortObject = { [sort]: sortOrder };

      console.log('📊 Admin orders query:', JSON.stringify(query, null, 2));

      const [orders, totalCount] = await Promise.all([
        Order.find(query)
          .sort(sortObject)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('userId', 'firstName lastName email mobileNumber')
          .lean(),
        Order.countDocuments(query)
      ]);

      console.log('📊 Found orders:', orders.length);

      // ✅ Safe stats calculation with error handling
      let stats = {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        revenue: 0,
        avgOrderValue: 0
      };

      try {
        stats = await this.getOrderStats();
      } catch (statsError) {
        console.error('❌ Error calculating stats:', statsError);
        // Use fallback stats
        stats.total = totalCount;
      }

      res.json({
        success: true,
        data: orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit) || 1,
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + orders.length < totalCount,
          hasPrevPage: page > 1
        },
        stats
      });

    } catch (error) {
      console.error('❌ Error fetching admin orders:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching orders',
        error: error.message
      });
    }
  }

  /**
   * Get order stats with safe error handling
   */
  async getOrderStats() {
    try {
      const [totalOrders, statusDistribution, revenueData] = await Promise.all([
        Order.countDocuments(),
        Order.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        Order.aggregate([
          {
            $match: {
              status: { $in: ['Delivered', 'Processing', 'Shipped'] }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$total' },
              avgOrderValue: { $avg: '$total' },
              totalOrders: { $sum: 1 }
            }
          }
        ])
      ]);

      const pending = statusDistribution.find(s => s._id === 'Pending')?.count || 0;
      const processing = statusDistribution.find(s => s._id === 'Processing')?.count || 0;
      const shipped = statusDistribution.find(s => s._id === 'Shipped')?.count || 0;
      const delivered = statusDistribution.find(s => s._id === 'Delivered')?.count || 0;
      const cancelled = statusDistribution.find(s => s._id === 'Cancelled')?.count || 0;

      return {
        total: totalOrders,
        pending,
        processing,
        shipped,
        delivered,
        cancelled,
        revenue: revenueData[0]?.totalRevenue || 0,
        avgOrderValue: revenueData[0]?.avgOrderValue || 0,
        totalCompletedOrders: revenueData[0]?.totalOrders || 0
      };
    } catch (error) {
      console.error('❌ Error in getOrderStats:', error);
      return {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        revenue: 0,
        avgOrderValue: 0,
        totalCompletedOrders: 0
      };
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const isAdmin = req.user?.role === 'admin';

      const order = await Order.findById(id)
        .populate('userId', 'firstName lastName email mobileNumber')
        .populate('items.productId', 'name images metal category');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (!isAdmin && order.userId._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this order'
        });
      }

      res.json({
        success: true,
        data: order
      });

    } catch (error) {
      console.error('❌ Error fetching order:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching order',
        error: error.message
      });
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      order.status = status;
      order.shippingStatus = status;
      order.statusHistory.push({
        status,
        date: new Date(),
        note: note || `Order status updated to ${status}`,
        updatedBy: req.user?.email || 'Admin'
      });

      if (status === 'Delivered') {
        order.deliveredAt = new Date();
      }

      if (status === 'Cancelled') {
        order.cancelledAt = new Date();
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stockCount: item.quantity }
          });
        }
      }

      await order.save();

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: order
      });

    } catch (error) {
      console.error('❌ Error updating order status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating order status',
        error: error.message
      });
    }
  }

  /**
   * Get user's orders
   */
  async getMyOrders(req, res) {
    try {
      const userId = req.userId;
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;

      const [orders, totalCount] = await Promise.all([
        Order.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Order.countDocuments({ userId })
      ]);

      res.json({
        success: true,
        data: orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + orders.length < totalCount,
          hasPrevPage: page > 1
        }
      });

    } catch (error) {
      console.error('❌ Error fetching user orders:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching your orders',
        error: error.message
      });
    }
  }

  /**
   * Get order stats for dashboard
   */
  async getOrderStatsRoute(req, res) {
    try {
      const stats = await this.getOrderStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error getting order stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching order stats',
        error: error.message
      });
    }
  }

  /**
   * Cancel order (User)
   */
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.userId;

      const order = await Order.findOne({ _id: id, userId });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or you are not authorized'
        });
      }

      if (!['Pending', 'Processing'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Order cannot be cancelled in ${order.status} status`
        });
      }

      order.status = 'Cancelled';
      order.cancelledAt = new Date();
      order.statusHistory.push({
        status: 'Cancelled',
        date: new Date(),
        note: reason || 'Cancelled by user',
        updatedBy: 'User'
      });
      await order.save();

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
      });

    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelling order',
        error: error.message
      });
    }
  }

  /**
   * Delete order (Admin)
   */
  async deleteOrder(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findByIdAndDelete(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        message: 'Order deleted successfully'
      });

    } catch (error) {
      console.error('❌ Error deleting order:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting order',
        error: error.message
      });
    }
  }

  /**
   * Add tracking to order
   */
  async addTracking(req, res) {
    try {
      const { id } = req.params;
      const { trackingNumber } = req.body;

      if (!trackingNumber) {
        return res.status(400).json({
          success: false,
          message: 'Tracking number is required'
        });
      }

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      order.trackingNumber = trackingNumber;
      order.shippingStatus = 'Shipped';
      order.status = 'Shipped';
      order.statusHistory.push({
        status: 'Shipped',
        date: new Date(),
        note: `Shipped with tracking: ${trackingNumber}`,
        updatedBy: 'Admin'
      });
      await order.save();

      res.json({
        success: true,
        message: 'Tracking added successfully',
        data: order
      });

    } catch (error) {
      console.error('❌ Error adding tracking:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding tracking',
        error: error.message
      });
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(req, res) {
    try {
      const { period = 'monthly', startDate, endDate } = req.query;

      let dateMatch = {};
      if (startDate || endDate) {
        dateMatch.createdAt = {};
        if (startDate) {
          dateMatch.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          dateMatch.createdAt.$lte = new Date(endDate);
        }
      }

      let groupFormat = {};
      if (period === 'daily') {
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      } else if (period === 'monthly') {
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      } else {
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      }

      const revenueData = await Order.aggregate([
        {
          $match: {
            ...dateMatch,
            status: { $in: ['Delivered', 'Processing', 'Shipped'] }
          }
        },
        {
          $group: {
            _id: groupFormat,
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const categoryRevenue = await Order.aggregate([
        {
          $match: {
            status: { $in: ['Delivered', 'Processing', 'Shipped'] }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.category',
            revenue: { $sum: '$items.total' },
            quantity: { $sum: '$items.quantity' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          timeline: revenueData,
          categoryBreakdown: categoryRevenue,
          summary: {
            totalRevenue: revenueData.reduce((sum, d) => sum + d.revenue, 0),
            totalOrders: revenueData.reduce((sum, d) => sum + d.orders, 0),
            averageOrderValue: revenueData.length > 0 
              ? revenueData.reduce((sum, d) => sum + d.avgOrderValue, 0) / revenueData.length 
              : 0
          }
        }
      });

    } catch (error) {
      console.error('❌ Error getting revenue analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching revenue analytics',
        error: error.message
      });
    }
  }
}

// ✅ Export a SINGLE instance
module.exports = new OrderController();
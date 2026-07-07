// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order ID
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  // Customer Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  
  // Order Items
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    category: String,
    metal: String,
  }],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  shippingCharges: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  
  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['COD', 'Card', 'UPI', 'NetBanking', 'Wallet', 'Razorpay', 'Stripe'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'COD'],
    default: 'Pending',
  },
  transactionId: String,
  paymentDate: Date,
  
  // Shipping Details
  shippingAddress: {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  shippingMethod: {
    type: String,
    enum: ['Standard', 'Express', 'Next Day'],
    default: 'Standard',
  },
  shippingStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending',
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  
  // Order Status
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending',
    index: true,
  },
  statusHistory: [{
    status: String,
    date: {
      type: Date,
      default: Date.now,
    },
    note: String,
    updatedBy: String,
  }],
  
  // Customer Notes
  customerNote: String,
  adminNote: String,
  
  // Coupon Information
  couponCode: String,
  couponDiscount: Number,
  
  // Metadata
  customerIP: String,
  userAgent: String,
  
  // Dates
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  cancelledAt: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ✅ Indexes for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'items.productId': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ total: -1 });

// ✅ Virtual: Item count
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ✅ Pre-save middleware
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update order status history
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      date: new Date(),
      note: `Order status changed to ${this.status}`,
    });
  }
  
  next();
});

// ✅ Static method: Get sales by date range
orderSchema.statics.getSalesByDateRange = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['Delivered', 'Processing', 'Shipped'] }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalRevenue: { $sum: '$total' },
        orderCount: { $sum: 1 },
        avgOrderValue: { $avg: '$total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// ✅ Static method: Get category revenue
orderSchema.statics.getCategoryRevenue = async function() {
  return this.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.category',
        totalRevenue: { $sum: '$items.total' },
        totalSold: { $sum: '$items.quantity' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);
};

// ✅ Static method: Get top selling products
orderSchema.statics.getTopSellingProducts = async function(limit = 5) {
  return this.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        name: { $first: '$items.productName' },
        category: { $first: '$items.category' },
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' },
        avgPrice: { $avg: '$items.price' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit }
  ]);
};

// ✅ Static method: Get order status distribution
orderSchema.statics.getStatusDistribution = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// ✅ Static method: Get monthly performance
orderSchema.statics.getMonthlyPerformance = async function(months = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['Delivered', 'Processing', 'Shipped'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalRevenue: { $sum: '$total' },
        orderCount: { $sum: 1 },
        avgOrderValue: { $avg: '$total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
};

// ✅ Static method: Get user growth
orderSchema.statics.getUserGrowth = async function(startDate) {
  const User = mongoose.model('User');
  return User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        newUsers: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// ✅ Method: Cancel order
orderSchema.methods.cancel = async function(reason) {
  this.status = 'Cancelled';
  this.cancelledAt = new Date();
  this.statusHistory.push({
    status: 'Cancelled',
    date: new Date(),
    note: reason || 'Order cancelled',
  });
  await this.save();
};

// ✅ Method: Mark as delivered
orderSchema.methods.markDelivered = async function() {
  this.status = 'Delivered';
  this.deliveredAt = new Date();
  this.statusHistory.push({
    status: 'Delivered',
    date: new Date(),
    note: 'Order delivered',
  });
  await this.save();
};

// ✅ Method: Add shipping tracking
orderSchema.methods.addTracking = async function(trackingNumber) {
  this.trackingNumber = trackingNumber;
  this.shippingStatus = 'Shipped';
  this.status = 'Shipped';
  this.statusHistory.push({
    status: 'Shipped',
    date: new Date(),
    note: `Shipped with tracking: ${trackingNumber}`,
  });
  await this.save();
};

// Generate order number
orderSchema.pre('validate', function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
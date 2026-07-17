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
  
  // ✅ Tax breakdown for detailed invoice
  taxBreakdown: {
    type: {
      type: String,
      enum: ['cgst_sgst', 'igst', 'none'],
      default: 'none',
    },
    cgst: {
      type: Number,
      min: 0,
      default: 0,
    },
    sgst: {
      type: Number,
      min: 0,
      default: 0,
    },
    igst: {
      type: Number,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      min: 0,
      default: 0,
    },
    rate: {
      type: Number,
      min: 0,
      default: 0,
    },
    label: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  
  shippingCharges: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  
  // ✅ Payment Details - UPDATED with all payment gateways
  paymentMethod: {
    type: String,
    enum: ['COD', 'Card', 'UPI', 'NetBanking', 'Wallet', 'Razorpay', 'Stripe', 'PhonePe', 'QR'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'COD', 'Initiated'],
    default: 'Pending',
  },
  transactionId: String,
  paymentDate: Date,
  
  // ✅ NEW: Payment gateway specific fields
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'phonepe', 'stripe', 'cod', 'qr', null],
    default: null,
  },
  gatewayOrderId: {
    type: String,
    index: true,
  },
  gatewayPaymentId: {
    type: String,
    index: true,
  },
  gatewaySignature: String,
  paymentAttempts: {
    type: Number,
    default: 0,
  },
  paymentMetadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  
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

// ========== INDEXES ==========
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'items.productId': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ total: -1 });
orderSchema.index({ gatewayOrderId: 1 });
orderSchema.index({ gatewayPaymentId: 1 });

// ========== VIRTUALS ==========
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

orderSchema.virtual('isPaymentCompleted').get(function() {
  return ['Paid', 'COD'].includes(this.paymentStatus);
});

orderSchema.virtual('isPaymentDue').get(function() {
  return ['Pending', 'Initiated', 'Failed'].includes(this.paymentStatus);
});

// ========== PRE-SAVE MIDDLEWARE ==========
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

// ========== STATIC METHODS ==========

// Get sales by date range
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

// Get category revenue
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

// Get top selling products
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

// Get order status distribution
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

// Get monthly performance
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

// Get user growth
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

// Get payment method distribution
orderSchema.statics.getPaymentMethodDistribution = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Get payment status distribution
orderSchema.statics.getPaymentStatusDistribution = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// ========== INSTANCE METHODS ==========

// Cancel order
orderSchema.methods.cancel = async function(reason) {
  this.status = 'Cancelled';
  this.cancelledAt = new Date();
  this.statusHistory.push({
    status: 'Cancelled',
    date: new Date(),
    note: reason || 'Order cancelled',
  });
  await this.save();
  return this;
};

// Mark as delivered
orderSchema.methods.markDelivered = async function() {
  this.status = 'Delivered';
  this.deliveredAt = new Date();
  this.statusHistory.push({
    status: 'Delivered',
    date: new Date(),
    note: 'Order delivered',
  });
  await this.save();
  return this;
};

// Add shipping tracking
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
  return this;
};

// Mark payment as paid
orderSchema.methods.markPaymentPaid = async function(paymentData) {
  this.paymentStatus = 'Paid';
  this.paymentDate = new Date();
  this.transactionId = paymentData.transactionId || this.transactionId;
  this.gatewayPaymentId = paymentData.gatewayPaymentId || this.gatewayPaymentId;
  this.gatewaySignature = paymentData.gatewaySignature || this.gatewaySignature;
  this.paymentMetadata = {
    ...this.paymentMetadata,
    ...paymentData.metadata,
    paidAt: new Date().toISOString()
  };
  this.status = 'Processing';
  this.shippingStatus = 'Processing';
  this.statusHistory.push({
    status: 'Processing',
    date: new Date(),
    note: `Payment confirmed (${paymentData.gateway || 'Unknown'})`,
    updatedBy: 'System'
  });
  await this.save();
  return this;
};

// Mark payment as failed
orderSchema.methods.markPaymentFailed = async function(reason) {
  this.paymentStatus = 'Failed';
  this.paymentAttempts += 1;
  this.paymentMetadata = {
    ...this.paymentMetadata,
    failedReason: reason,
    failedAt: new Date().toISOString()
  };
  await this.save();
  return this;
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
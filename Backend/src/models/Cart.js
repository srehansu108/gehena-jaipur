// backend/models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 99,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  couponCode: {
    type: String,
    default: null,
  },
  couponDiscount: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// ✅ Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.tax = this.subtotal * 0.10; // 10% tax
  this.total = this.subtotal + this.tax - this.couponDiscount;
  this.updatedAt = new Date();
  next();
});

// ✅ ADD THIS METHOD - It was missing!
cartSchema.methods.addItem = async function(productId, quantity = 1) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }

  // Check if item already exists
  const existingItem = this.items.find(
    item => item.productId.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.totalPrice = existingItem.quantity * existingItem.price;
  } else {
    this.items.push({
      productId: product._id,
      quantity,
      price: product.price,
      totalPrice: product.price * quantity,
    });
  }

  return this.save();
};

// ✅ ADD THIS METHOD
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.productId.toString() !== productId.toString()
  );
  return this.save();
};

// ✅ ADD THIS METHOD
cartSchema.methods.updateQuantity = function(productId, quantity) {
  const item = this.items.find(
    item => item.productId.toString() === productId.toString()
  );
  
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    return this.removeItem(productId);
  }

  item.quantity = quantity;
  item.totalPrice = item.price * quantity;
  return this.save();
};

// ✅ ADD THIS METHOD
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.couponCode = null;
  this.couponDiscount = 0;
  return this.save();
};

// ✅ ADD THIS METHOD
cartSchema.methods.applyCoupon = function(couponCode, discountAmount) {
  this.couponCode = couponCode;
  this.couponDiscount = discountAmount;
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
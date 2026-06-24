// backend/models/Wishlist.js
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure unique product in wishlist
wishlistSchema.index({ userId: 1, 'items.productId': 1 }, { unique: true });

// Method to add product to wishlist
wishlistSchema.methods.addItem = async function(productId) {
  // Check if product already exists
  const existingItem = this.items.find(
    item => item.productId.toString() === productId.toString()
  );

  if (existingItem) {
    // Remove if exists (toggle)
    this.items = this.items.filter(
      item => item.productId.toString() !== productId.toString()
    );
    return this.save();
  }

  // Add new item
  this.items.push({ productId });
  return this.save();
};

// Method to remove product from wishlist
wishlistSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.productId.toString() !== productId.toString()
  );
  return this.save();
};

// Method to check if product is in wishlist
wishlistSchema.methods.isInWishlist = function(productId) {
  return this.items.some(
    item => item.productId.toString() === productId.toString()
  );
};

// Static method to get wishlist with populated products
wishlistSchema.statics.getWishlistWithProducts = async function(userId) {
  const wishlist = await this.findOne({ userId })
    .populate({
      path: 'items.productId',
      select: '-__v',
    });

  if (!wishlist) {
    // Create empty wishlist
    const newWishlist = new this({
      userId,
      items: [],
    });
    await newWishlist.save();
    return newWishlist;
  }

  return wishlist;
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
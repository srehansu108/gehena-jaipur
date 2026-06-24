const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    sparse: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    index: true,
    enum: ['rings', 'necklaces', 'earrings', 'bangles', 'pendants', 'bracelets', 'sets', 'mangalsutra']
  },
  subcategory: {
    type: String,
    index: true,
  },
  // 🔥 NEW: For precise navbar mapping
  navbarCategory: {
    type: String,
    index: true,
    enum: [
      'silver-jewelry', 
      'gemstone-jewelry', 
      'fashion-jewelry', 
      'tribal-jewelry', 
      'jadau-jewelry', 
      'pachi-jewelry', 
      'cubic-zirconia'
    ]
  },
  // 🔥 NEW: For subcategory mapping
  navbarSubcategory: {
    type: String,
    index: true,
  },
  tags: [{
    type: String,
    index: true,
  }],
  price: {
    type: Number,
    required: true,
    index: true,
  },
  originalPrice: Number,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: Number,
  images: [String],
  metal: {
    type: String,
    index: true,
  },
  weight: String,
  diamondWeight: String,
  diamondClarity: String,
  diamondColor: String,
  inStock: {
    type: Boolean,
    default: true,
    index: true,
  },
  stockCount: {
    type: Number,
    default: 0,
  },
  badge: String,
  badgeType: {
    type: String,
    enum: ['bestseller', 'new', 'sale', 'limited', 'exclusive'],
  },
  description: String,
  longDescription: String,
  features: [String],
  specifications: mongoose.Schema.Types.Mixed,
  careInstructions: [String],
  shippingInfo: {
    free: { type: Boolean, default: true },
    estimatedDays: String,
    returnable: { type: Boolean, default: true },
    returnDays: { type: Number, default: 30 },
    cod: { type: Boolean, default: true },
  },
  warranty: String,
  brand: {
    type: String,
    index: true,
  },
  sku: {
    type: String,
    unique: true,
    index: true,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 🔥 CRITICAL: Compound Indexes for Fast Filtering
productSchema.index({ id: 1, category: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, rating: 1 });
productSchema.index({ metal: 1, price: 1 });
productSchema.index({ tags: 1, inStock: 1 });
productSchema.index({ name: 'text', description: 'text', 'tags': 'text' });

// 🔥 NEW: Index for navbar category filtering
productSchema.index({ navbarCategory: 1, navbarSubcategory: 1 });
productSchema.index({ navbarCategory: 1, category: 1 });

// Virtual field for computed discount
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.originalPrice && this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Static method for getting unique metals
productSchema.statics.getUniqueMetals = async function() {
  return this.distinct('metal');
};

// Static method for getting category counts
productSchema.statics.getCategoryCounts = async function() {
  return this.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
};

// 🔥 NEW: Static method for navbar category mapping
productSchema.statics.getNavbarCategoryMapping = async function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          navbarCategory: '$navbarCategory',
          navbarSubcategory: '$navbarSubcategory',
          category: '$category'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.navbarCategory',
        subcategories: {
          $push: {
            subcategory: '$_id.navbarSubcategory',
            dbCategory: '$_id.category',
            count: '$count'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Product', productSchema);
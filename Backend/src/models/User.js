// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[0-9]{10}$/,
    index: true,
  },
  // backend/models/User.js
email: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  // ✅ This is the cleanest approach
  set: function(email) {
    // Normalize: Trim, convert to lowercase, but preserve dots
    return email.trim().toLowerCase();
  },
  match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  index: true,
},
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  profilePicture: {
    type: String,
    default: null,
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  address: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  }],
  lastLogin: {
    type: Date,
    default: null,
  },
  resetPasswordCode: {
    type: String,
    default: null,
  },
  resetPasswordExpiry: {
    type: Date,
    default: null,
  },
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Hash password for findOneAndUpdate operations
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(update.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON response
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    delete ret.resetPasswordCode;
    delete ret.resetPasswordExpiry;
    return ret;
  }
});

// Add compound index for unique constraints
userSchema.index({ email: 1, username: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
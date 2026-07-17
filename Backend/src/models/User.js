// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ========== PERSONAL FIELDS ==========
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
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    set: function(email) {
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

  // ========== ACCOUNT TYPE ==========
  accountType: {
    type: String,
    enum: ['personal', 'business'],
    default: 'personal',
    required: true,
  },

  // ========== BUSINESS FIELDS (Only for business accounts) ==========
  businessDetails: {
    businessName: {
      type: String,
      trim: true,
      required: function() {
        return this.accountType === 'business';
      },
    },
    businessType: {
      type: String,
      trim: true,
      required: function() {
        return this.accountType === 'business';
      },
      enum: [
        'Sole Proprietorship',
        'Partnership',
        'Private Limited Company',
        'Public Limited Company',
        'Limited Liability Partnership (LLP)',
        'One Person Company (OPC)',
        'Section 8 Company (Non-Profit)',
        'Hindu Undivided Family (HUF)',
        'Other'
      ],
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true, // Allows multiple null values
      validate: {
        validator: function(v) {
          // GST Format: 22AAAAA0000A1Z5 (15 characters)
          if (!v) return true; // Optional field
          const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
          return gstRegex.test(v);
        },
        message: 'Please enter a valid GST number (Format: 22AAAAA0000A1Z5)',
      },
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true, // Allows multiple null values
      validate: {
        validator: function(v) {
          // PAN Format: ABCDE1234F (10 characters)
          if (!v) return true; // Optional field
          const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          return panRegex.test(v);
        },
        message: 'Please enter a valid PAN number (Format: ABCDE1234F)',
      },
    },
    businessAddress: {
      type: String,
      trim: true,
      required: function() {
        return this.accountType === 'business';
      },
    },
    businessPhone: {
      type: String,
      trim: true,
      required: function() {
        return this.accountType === 'business';
      },
      match: /^[0-9]{10}$/,
    },
    businessEmail: {
      type: String,
      trim: true,
      required: function() {
        return this.accountType === 'business';
      },
      set: function(email) {
        return email.trim().toLowerCase();
      },
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    website: {
      type: String,
      trim: true,
      default: null,
    },
    yearsInBusiness: {
      type: Number,
      min: 0,
      required: function() {
        return this.accountType === 'business';
      },
    },
    gstVerified: {
      type: Boolean,
      default: false,
    },
    panVerified: {
      type: Boolean,
      default: false,
    },
  },

  // ========== COMMON FIELDS ==========
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
}, {
  timestamps: true,
});

// ========== INDEXES ==========
userSchema.index({ email: 1, username: 1 });
userSchema.index({ 'businessDetails.gstNumber': 1 }, { unique: true, sparse: true });
userSchema.index({ 'businessDetails.panNumber': 1 }, { unique: true, sparse: true });

// ========== HASH PASSWORD BEFORE SAVING ==========
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

// ========== COMPARE PASSWORD METHOD ==========
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// ========== REMOVE SENSITIVE DATA FROM JSON ==========
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    delete ret.resetPasswordCode;
    delete ret.resetPasswordExpiry;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
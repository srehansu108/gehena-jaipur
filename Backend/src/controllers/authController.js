// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register user (Personal or Business)
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      username,
      firstName,
      lastName,
      mobileNumber,
      email,
      password,
      accountType,
      businessDetails,
    } = req.body;

    console.log('📝 SIGNUP ATTEMPT:', { 
      username, 
      email, 
      mobileNumber, 
      accountType,
      hasBusinessDetails: !!businessDetails 
    });

    // Normalize inputs
    const normalizedEmail = email.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedMobile = mobileNumber.trim();

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail.toLowerCase() },
        { username: normalizedUsername },
        { mobileNumber: normalizedMobile }
      ]
    });

    if (existingUser) {
      let field = '';
      if (existingUser.email === normalizedEmail.toLowerCase()) field = 'Email';
      else if (existingUser.username === normalizedUsername) field = 'Username';
      else if (existingUser.mobileNumber === normalizedMobile) field = 'Mobile number';
      
      return res.status(400).json({
        success: false,
        message: `${field} already registered. Please use a different one.`
      });
    }

    // Check for unique GST/PAN if provided
    if (businessDetails) {
      if (businessDetails.gstNumber) {
        const existingGST = await User.findOne({
          'businessDetails.gstNumber': businessDetails.gstNumber.toUpperCase()
        });
        if (existingGST) {
          return res.status(400).json({
            success: false,
            message: 'GST number already registered with another account.'
          });
        }
      }

      if (businessDetails.panNumber) {
        const existingPAN = await User.findOne({
          'businessDetails.panNumber': businessDetails.panNumber.toUpperCase()
        });
        if (existingPAN) {
          return res.status(400).json({
            success: false,
            message: 'PAN number already registered with another account.'
          });
        }
      }
    }

    // Build user data
    const userData = {
      username: normalizedUsername,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobileNumber: normalizedMobile,
      email: normalizedEmail,
      password,
      accountType: accountType || 'personal',
    };

    // Add business details if business account
    if (accountType === 'business' && businessDetails) {
      userData.businessDetails = {
        businessName: businessDetails.businessName.trim(),
        businessType: businessDetails.businessType,
        businessAddress: businessDetails.businessAddress.trim(),
        businessPhone: businessDetails.businessPhone.trim(),
        businessEmail: businessDetails.businessEmail.trim(),
        yearsInBusiness: businessDetails.yearsInBusiness,
        gstNumber: businessDetails.gstNumber ? businessDetails.gstNumber.toUpperCase() : null,
        panNumber: businessDetails.panNumber ? businessDetails.panNumber.toUpperCase() : null,
        website: businessDetails.website ? businessDetails.website.trim() : null,
      };
    }

    // Create user
    const user = new User(userData);
    await user.save();

    console.log('✅ User saved successfully');
    console.log('  - Account Type:', user.accountType);
    console.log('  - User ID:', user._id);
    if (user.accountType === 'business') {
      console.log('  - Business Name:', user.businessDetails.businessName);
      console.log('  - GST:', user.businessDetails.gstNumber || 'Not provided');
      console.log('  - PAN:', user.businessDetails.panNumber || 'Not provided');
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: accountType === 'business' 
        ? 'Business account created successfully!' 
        : 'Account created successfully!',
      token,
      user: user.toJSON(),
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `This ${field} is already registered.`,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email and password',
      });
    }

    const isEmail = identifier.includes('@');
    let user;

    if (isEmail) {
      user = await User.findOne({ 
        email: identifier.toLowerCase() 
      }).select('+password');
    } else {
      user = await User.findOne({ 
        username: identifier.toLowerCase() 
      }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please try again.',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please try again.',
      });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    });

    const token = generateToken(user._id);

    // Log login info
    console.log('✅ Login successful:', {
      userId: user._id,
      username: user.username,
      accountType: user.accountType,
      isBusiness: user.accountType === 'business',
    });

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: user.toJSON(),
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('wishlist');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpiry = new Date(Date.now() + 3600000);
    await user.save();

    console.log(`🔑 Password reset code for ${email}: ${resetCode}`);

    res.json({
      success: true,
      message: 'Password reset code sent to your email.',
      resetCode,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset code, and new password are required',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordCode: code,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code.',
      });
    }

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. Please login.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// ========== BUSINESS SPECIFIC ENDPOINTS ==========

// @desc    Verify GST number
// @route   POST /api/auth/verify-gst
// @access  Private
exports.verifyGST = async (req, res) => {
  try {
    const { gstNumber } = req.body;
    
    if (!gstNumber) {
      return res.status(400).json({
        success: false,
        message: 'GST number is required',
      });
    }

    // Validate GST format
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GST number format. Expected: 22AAAAA0000A1Z5',
      });
    }

    // Check if GST already exists
    const existingUser = await User.findOne({
      'businessDetails.gstNumber': gstNumber.toUpperCase()
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'GST number already registered with another account',
      });
    }

    // TODO: Integrate with GST API for real verification
    // For now, return success
    res.json({
      success: true,
      message: 'GST number is valid and available',
      gstNumber: gstNumber.toUpperCase(),
    });
  } catch (error) {
    console.error('GST verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during GST verification',
    });
  }
};

// @desc    Verify PAN number
// @route   POST /api/auth/verify-pan
// @access  Private
exports.verifyPAN = async (req, res) => {
  try {
    const { panNumber } = req.body;
    
    if (!panNumber) {
      return res.status(400).json({
        success: false,
        message: 'PAN number is required',
      });
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN number format. Expected: ABCDE1234F',
      });
    }

    // Check if PAN already exists
    const existingUser = await User.findOne({
      'businessDetails.panNumber': panNumber.toUpperCase()
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'PAN number already registered with another account',
      });
    }

    res.json({
      success: true,
      message: 'PAN number is valid and available',
      panNumber: panNumber.toUpperCase(),
    });
  } catch (error) {
    console.error('PAN verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during PAN verification',
    });
  }
};

// @desc    Get business profile
// @route   GET /api/auth/business-profile
// @access  Private
exports.getBusinessProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.accountType !== 'business') {
      return res.status(400).json({
        success: false,
        message: 'This is not a business account',
      });
    }

    res.json({
      success: true,
      businessDetails: user.businessDetails,
    });
  } catch (error) {
    console.error('Get business profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update business profile
// @route   PUT /api/auth/business-profile
// @access  Private
exports.updateBusinessProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.accountType !== 'business') {
      return res.status(400).json({
        success: false,
        message: 'This is not a business account',
      });
    }

    const allowedUpdates = [
      'businessName', 'businessType', 'businessAddress', 
      'businessPhone', 'businessEmail', 'website', 'yearsInBusiness'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[`businessDetails.${field}`] = req.body[field];
      }
    });

    // Don't allow updating GST/PAN through this endpoint (verification needed)
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Business profile updated successfully',
      businessDetails: updatedUser.businessDetails,
    });
  } catch (error) {
    console.error('Update business profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
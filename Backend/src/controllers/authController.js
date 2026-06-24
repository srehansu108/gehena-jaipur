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

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email and password',
      });
    }

    // ✅ FIX: Better search with case-insensitive matching
    const isEmail = identifier.includes('@');
    let searchQuery;

    if (isEmail) {
      // For emails: Find by email (Mongoose already stores lowercase)
      // But also handle case variations for login
      searchQuery = { 
        email: identifier.toLowerCase() // ← Convert to lowercase for matching
      };
      
      // Also try the original case just in case
      const userWithOriginalCase = await User.findOne({ 
        email: { $regex: new RegExp('^' + identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      }).select('+password');
      
      if (userWithOriginalCase) {
        // Verify password
        const isPasswordValid = await userWithOriginalCase.comparePassword(password);
        if (isPasswordValid) {
          // Update last login
          await User.findByIdAndUpdate(userWithOriginalCase._id, {
            lastLogin: new Date()
          });
          
          const token = generateToken(userWithOriginalCase._id);
          console.log('✅ Login successful!');
          return res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: userWithOriginalCase.toJSON(),
          });
        }
      }
      
      // If not found with regex, try simple lowercase
      const user = await User.findOne(searchQuery).select('+password');
      
      if (!user) {
        console.log('❌ User not found');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please try again.',
        });
      }
      
      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        console.log('❌ Password is INVALID');
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
      console.log('✅ Login successful!');
      return res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: user.toJSON(),
      });
      
    } else {
      // For usernames
      searchQuery = { username: identifier.toLowerCase() };
      const user = await User.findOne(searchQuery).select('+password');
      
      if (!user) {
        console.log('❌ User not found');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please try again.',
        });
      }
      
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        console.log('❌ Password is INVALID');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please try again.',
        });
      }
      
      await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date()
      });
      
      const token = generateToken(user._id);
      console.log('✅ Login successful!');
      return res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: user.toJSON(),
      });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('  - Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// @desc    Register user
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
    } = req.body;

    console.log('📝 SIGNUP ATTEMPT:', { username, email, mobileNumber });

    // ✅ FIX: Use the email as-is (Mongoose lowercase will handle it)
    const normalizedEmail = email.trim();
    const normalizedUsername = username.trim().toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail.toLowerCase() },
        { username: normalizedUsername },
        { mobileNumber }
      ]
    });

    if (existingUser) {
      let field = '';
      if (existingUser.email === normalizedEmail.toLowerCase()) field = 'Email';
      else if (existingUser.username === normalizedUsername) field = 'Username';
      else if (existingUser.mobileNumber === mobileNumber) field = 'Mobile number';
      
      return res.status(400).json({
        success: false,
        message: `${field} already registered. Please use a different one.`
      });
    }

    // ✅ FIX: Create user with email as-is, let Mongoose handle lowercase
    const user = new User({
      username: normalizedUsername,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: normalizedEmail, // ← Mongoose will apply lowercase
      password,
    });

    console.log('🔍 Saving user with email:', normalizedEmail);
    console.log('🔍 Saving user with password:', password);
    await user.save();
    console.log('✅ User saved successfully');
    console.log('  - Stored email:', user.email);
    console.log('  - Hashed password:', user.password.substring(0, 30) + '...');

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Signup error:', error);
    
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
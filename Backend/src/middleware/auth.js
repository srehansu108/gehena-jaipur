// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.',
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('❌ Token missing after Bearer');
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing.',
      });
    }

    console.log('🔑 Token received:', token.substring(0, 30) + '...');

    // ✅ CHECK FOR DEMO TOKEN (starts with 'demo-jwt-token-')
    if (token.startsWith('demo-jwt-token-')) {
      console.log('✅ Demo token detected - bypassing verification');
      
      // For demo, create a mock admin user
      const demoUser = {
        _id: 'demo-admin-id',
        username: 'admin',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@adminportal.com',
        role: 'admin',
        isAdmin: true
      };
      
      req.userId = 'demo-admin-id';
      req.user = demoUser;
      req.isDemo = true;
      
      console.log('✅ Demo user authenticated:', demoUser.email);
      return next();
    }

    // Regular JWT verification
    console.log('🔐 Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token verified for userId:', decoded.userId);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.',
      });
    }
    
    console.log('✅ User found:', user.email || user.username);
    req.userId = decoded.userId;
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Invalid JWT signature');
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      console.log('❌ JWT expired');
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }
    
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 Authorizing with roles:', roles);
    console.log('👤 User role:', req.user?.role);
    console.log('👤 User email:', req.user?.email);
    
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(403).json({
        success: false,
        message: 'User not authenticated.',
      });
    }
    
    // ✅ Check if user role matches any allowed role
    const userRole = req.user.role;
    const hasAccess = roles.includes(userRole);
    
    if (!hasAccess) {
      console.log(`❌ Access denied. User role: ${userRole}, Required: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
    }
    
    console.log('✅ Authorization successful');
    next();
  };
};
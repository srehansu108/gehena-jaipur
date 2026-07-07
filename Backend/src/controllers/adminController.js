// backend/controllers/adminController.js
const User = require('../models/User');
const Product = require('../models/Product');
// const Order = require('../models/Order'); // Uncomment when Order model exists
const { startOfDay, subDays, subWeeks, subMonths, startOfWeek, startOfMonth } = require('date-fns');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = async (req, res) => {
  try {
    console.log('📊 Fetching admin stats...');
    
    const now = new Date();
    const today = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    // Get user stats
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({ 
      createdAt: { $gte: today } 
    });
    const newUsersThisWeek = await User.countDocuments({ 
      createdAt: { $gte: weekStart } 
    });
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: monthStart } 
    });

    // Get product stats
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ 
      inStock: true, 
      stockCount: { $lte: 5, $gt: 0 } 
    });
    const outOfStockProducts = await Product.countDocuments({ 
      $or: [{ inStock: false }, { stockCount: 0 }] 
    });

    // Calculate growth rate
    const lastMonthStart = subMonths(now, 1);
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: lastMonthStart, $lt: monthStart }
    });
    const growth = lastMonthUsers > 0 
      ? ((newUsersThisMonth - lastMonthUsers) / lastMonthUsers * 100) 
      : 0;

    // Get recent activities (users and products)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username firstName lastName email createdAt role');

    const recentActivities = recentUsers.map(user => ({
      type: 'user',
      message: `New user registered: ${user.firstName || user.username || user.email}`,
      time: formatTimeAgo(user.createdAt)
    }));

    // Monthly revenue data (mock for now - will use Order model later)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      monthlyRevenue.push({
        month: date.toISOString(),
        revenue: Math.floor(Math.random() * 10000) + 5000, // Mock data
        orders: Math.floor(Math.random() * 100) + 20 // Mock data
      });
    }

    console.log('✅ Stats fetched successfully:', {
      totalUsers,
      totalProducts,
      newUsersToday,
      growth: parseFloat(growth.toFixed(1))
    });

    res.json({
      success: true,
      data: {
        // Overview
        totalUsers,
        totalRevenue: 0, // Will be updated when Order model exists
        totalOrders: 0, // Will be updated when Order model exists
        growth: parseFloat(growth.toFixed(1)),
        
        // User Stats
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        
        // Order Stats (temporary mock data)
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        
        // Revenue Stats (temporary mock data)
        revenueToday: 0,
        revenueThisWeek: 0,
        revenueThisMonth: 0,
        averageOrderValue: 0,
        
        // Product Stats
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        
        // Recent Activity
        recentActivities,
        
        // Monthly Data
        monthlyRevenue,
        monthlyOrders: monthlyRevenue.map(m => ({ month: m.month, orders: m.orders })),
        monthlyUsers: monthlyRevenue.map((m, i) => ({ 
          month: m.month, 
          users: Math.floor(Math.random() * 50) + 10 
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// @desc    Get all users with pagination and search
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const skip = (page - 1) * limit;

    // Build search query
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password -resetPasswordCode -resetPasswordExpiry')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordCode -resetPasswordExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordCode -resetPasswordExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// ============ HELPER FUNCTIONS ============

function formatTimeAgo(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (diff < 60) return diff + 's ago';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return Math.floor(diff / 604800) + 'w ago';
}
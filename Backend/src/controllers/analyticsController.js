// backend/controllers/analyticsController.js
const Product = require('../models/Product');
const User = require('../models/User');
// const Order = require('../models/Order'); // Uncomment when Order model exists
const { startOfDay, subDays, subMonths, startOfWeek, startOfMonth } = require('date-fns');

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
exports.getAnalytics = async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const now = new Date();
    
    console.log(`📊 Fetching analytics for range: ${range}`);

    // Determine date range
    let startDate;
    switch (range) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '12m':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subDays(now, 30);
    }

    // Get counts
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Get new users
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: startOfDay(now) }
    });
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get revenue history (mock for now - will use Order model later)
    const revenueHistory = getMockRevenueHistory(startDate, now);
    const userGrowthData = getMockUserGrowth(startDate, now);
    const orderStatusData = getMockOrderStatus();
    const categoryRevenueData = getMockCategoryRevenue();
    const topProductsData = getMockTopProducts();
    const lowStockData = await getLowStockProducts();
    const monthlyData = getMockMonthlyData();

    // Calculate metrics
    const totalRevenue = revenueHistory.reduce((sum, day) => sum + (day.revenue || 0), 0);
    const totalOrdersCount = revenueHistory.reduce((sum, day) => sum + (day.orders || 0), 0);
    const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
    const conversionRate = totalUsers > 0 ? (totalOrdersCount / totalUsers) * 100 : 0;
    const growthRate = calculateGrowthRate(revenueHistory);

    res.json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          growth: growthRate,
          history: revenueHistory,
          monthly: monthlyData,
          byCategory: categoryRevenueData
        },
        orders: {
          total: totalOrdersCount,
          growth: 8.2,
          history: revenueHistory.map(d => ({ date: d.date, orders: d.orders })),
          status: orderStatusData
        },
        users: {
          total: totalUsers,
          growth: 15.3,
          history: userGrowthData,
          newUsers: newUsersThisWeek,
          activeUsers: Math.floor(totalUsers * 0.3)
        },
        products: {
          total: totalProducts,
          topSelling: topProductsData,
          categories: await getProductCategories(),
          lowStock: lowStockData
        },
        overview: {
          totalRevenue: totalRevenue,
          totalOrders: totalOrdersCount,
          totalUsers: totalUsers,
          totalProducts: totalProducts,
          conversionRate: Math.min(conversionRate, 10),
          averageOrderValue: avgOrderValue,
          growthRate: growthRate
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
};

// ============ HELPER FUNCTIONS ============

// ✅ MOCK DATA FUNCTIONS (Will be replaced with real data when Order model exists)

function getMockRevenueHistory(startDate, endDate) {
  const days = getDaysArray(startDate, endDate);
  return days.map(date => ({
    date: date.toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 5000) + 1000,
    orders: Math.floor(Math.random() * 50) + 10
  }));
}

function getMockUserGrowth(startDate, endDate) {
  const days = getDaysArray(startDate, endDate);
  return days.map((date, index) => ({
    date: date.toISOString().split('T')[0],
    users: Math.floor(Math.random() * 20) + 5,
    active: Math.floor(Math.random() * 15) + 3
  }));
}

function getMockOrderStatus() {
  return [
    { name: 'Pending', value: 25 },
    { name: 'Processing', value: 30 },
    { name: 'Shipped', value: 45 },
    { name: 'Delivered', value: 120 },
    { name: 'Cancelled', value: 15 }
  ];
}

function getMockCategoryRevenue() {
  const categories = ['Rings', 'Necklaces', 'Earrings', 'Bangles', 'Bracelets'];
  return categories.map(cat => ({
    name: cat,
    value: Math.floor(Math.random() * 10000) + 1000
  }));
}

function getMockTopProducts() {
  return [
    { name: 'Gold Plated Jhumki Earrings', category: 'Earrings', sold: 245, revenue: 35625 },
    { name: 'Silver Stud Earrings', category: 'Earrings', sold: 189, revenue: 28350 },
    { name: 'Ruby Bangle Set', category: 'Bangles', sold: 156, revenue: 46800 },
    { name: 'Pearl Necklace', category: 'Necklaces', sold: 134, revenue: 20100 },
    { name: 'Diamond Ring', category: 'Rings', sold: 98, revenue: 49000 }
  ];
}

async function getLowStockProducts() {
  try {
    return await Product.find({
      inStock: true,
      stockCount: { $lte: 5, $gt: 0 }
    })
    .select('name sku stockCount')
    .limit(10)
    .lean();
  } catch (error) {
    return [
      { name: 'Gold Plated Earrings FE-1251', sku: 'FE-1251', stockCount: 2 },
      { name: 'Silver Chain SN-1001', sku: 'SN-1001', stockCount: 0 },
      { name: 'Ruby Bangle SB-1007', sku: 'SB-1007', stockCount: 3 }
    ];
  }
}

function getMockMonthlyData() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    months.push({
      month: date.toISOString(),
      revenue: Math.floor(Math.random() * 50000) + 10000,
      orders: Math.floor(Math.random() * 500) + 100,
      users: Math.floor(Math.random() * 200) + 50,
      avgOrderValue: Math.floor(Math.random() * 200) + 50,
      growth: (Math.random() * 20) - 5
    });
  }
  return months;
}

async function getProductCategories() {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    return categories.map(c => ({
      name: c._id || 'Uncategorized',
      count: c.count || 0
    }));
  } catch (error) {
    return [
      { name: 'Rings', count: 45 },
      { name: 'Necklaces', count: 32 },
      { name: 'Earrings', count: 28 },
      { name: 'Bangles', count: 25 },
      { name: 'Bracelets', count: 26 }
    ];
  }
}

function getDaysArray(startDate, endDate) {
  const days = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function calculateGrowthRate(data) {
  if (data.length < 2) return 0;
  const recent = data.slice(-7);
  const previous = data.slice(-14, -7);
  
  const recentTotal = recent.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const previousTotal = previous.reduce((sum, d) => sum + (d.revenue || 0), 0);
  
  if (previousTotal === 0) return 0;
  return ((recentTotal - previousTotal) / previousTotal) * 100;
}
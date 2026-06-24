// backend/controllers/wishlistController.js
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.getWishlistWithProducts(req.userId);
    
    // Extract products from populated items
    const products = wishlist.items.map(item => item.productId);
    
    // Get total count
    const count = products.length;

    res.json({
      success: true,
      data: {
        items: wishlist.items,
        products: products,
        count: count,
        wishlistId: wishlist._id,
      },
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message,
    });
  }
};

// @desc    Toggle product in wishlist (add/remove)
// @route   POST /api/wishlist/:productId
// @access  Private
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.userId,
        items: [],
      });
    }

    // Toggle item
    const existingItem = wishlist.items.find(
      item => item.productId.toString() === productId.toString()
    );

    let action = 'added';
    if (existingItem) {
      wishlist.items = wishlist.items.filter(
        item => item.productId.toString() !== productId.toString()
      );
      action = 'removed';
    } else {
      wishlist.items.push({ productId });
      action = 'added';
    }

    await wishlist.save();

    // Get updated wishlist with populated products
    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('items.productId');

    res.json({
      success: true,
      message: action === 'added' ? 'Added to wishlist' : 'Removed from wishlist',
      data: {
        wishlist: updatedWishlist,
        isInWishlist: action === 'added',
        action: action,
        productId: productId,
      },
    });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wishlist',
      error: error.message,
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    await wishlist.removeItem(productId);

    // Get updated wishlist with populated products
    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('items.productId');

    res.json({
      success: true,
      message: 'Removed from wishlist',
      data: updatedWishlist,
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message,
    });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: wishlist,
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message,
    });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      return res.json({
        success: true,
        data: {
          isInWishlist: false,
        },
      });
    }

    const isInWishlist = wishlist.isInWishlist(productId);

    res.json({
      success: true,
      data: {
        isInWishlist,
        productId,
      },
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
      error: error.message,
    });
  }
};
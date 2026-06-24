// backend/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({
        userId: req.userId,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      });
      await cart.save();
    }
    
    // Populate product details
    await cart.populate('items.productId');
    
    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available',
      });
    }

    let cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      cart = new Cart({
        userId: req.userId,
        items: [],
      });
    }

    await cart.addItem(productId, quantity);
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add item to cart',
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required',
      });
    }

    let cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Check stock if increasing quantity
    if (quantity > 0) {
      const item = cart.items.find(
        item => item.productId.toString() === productId
      );
      if (item) {
        const product = await Product.findById(productId);
        if (product && product.stock < quantity) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient stock available',
          });
        }
      }
    }

    await cart.updateQuantity(productId, quantity);
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: cart,
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update cart',
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    let cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    await cart.removeItem(productId);
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart,
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
    });
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    
    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    // In a real app, you'd validate the coupon from a Coupon model
    // This is a simplified example
    const validCoupons = {
      'WELCOME10': { discount: 10, type: 'percentage' },
      'SAVE20': { discount: 20, type: 'percentage' },
      'FREESHIP': { discount: 50, type: 'fixed' },
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    let cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (cart.subtotal * coupon.discount) / 100;
    } else {
      discountAmount = Math.min(coupon.discount, cart.subtotal);
    }

    await cart.applyCoupon(couponCode.toUpperCase(), discountAmount);
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: cart,
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply coupon',
    });
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.couponCode = null;
    cart.couponDiscount = 0;
    await cart.save();
    await cart.populate('items.productId');

    res.json({
      success: true,
      message: 'Coupon removed successfully',
      data: cart,
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove coupon',
    });
  }
};

// @desc    Get cart count
// @route   GET /api/cart/count
// @access  Private
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    
    const count = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    
    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart count',
    });
  }
};
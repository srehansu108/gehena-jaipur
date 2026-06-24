// backend/routes/metaRoutes.js
const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

// @desc    Get all unique metals
// @route   GET /api/meta/metals
// @access  Public
router.get('/metals', async (req, res) => {
  try {
    const metals = await productService.getMetals();
    res.json({
      success: true,
      data: metals,
    });
  } catch (error) {
    console.error('Error fetching metals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching metals',
      error: error.message,
    });
  }
});

// @desc    Get category counts
// @route   GET /api/meta/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const counts = await productService.getCategoryCounts();
    res.json({
      success: true,
      data: counts,
    });
  } catch (error) {
    console.error('Error fetching category counts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category counts',
      error: error.message,
    });
  }
});

module.exports = router;
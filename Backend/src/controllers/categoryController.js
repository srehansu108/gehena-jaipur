const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// 🧹 Sanitizer — same pattern as hero slides
const sanitize = (raw = {}) => {
  const p = {};

  // strings
  ['name', 'slug', 'count', 'color', 'hoverColor', 'imageAlt'].forEach((k) => {
    if (raw[k] !== undefined) {
      const v = String(raw[k]).trim();
      p[k] = v === '' ? null : v;
    }
  });

  // auto-slug if only name provided
  if (p.name && !p.slug) {
    p.slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // booleans
  ['isActive', 'showInGrid'].forEach((k) => {
    if (raw[k] !== undefined) {
      if (typeof raw[k] === 'boolean') p[k] = raw[k];
      else if (typeof raw[k] === 'string') p[k] = raw[k].toLowerCase() === 'true';
    }
  });

  // number
  if (raw.order !== undefined && raw.order !== null && raw.order !== '') {
    const n = Number(raw.order);
    if (!Number.isNaN(n)) p.order = n;
  }

  return p;
};

// ---------- PUBLIC ----------
const getActiveCategories = async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true, showInGrid: true })
      .sort({ order: 1 })
      .select('-__v')
      .lean();
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- ADMIN ----------
const getAllCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ order: 1 }).lean();
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const payload = sanitize(req.body);

    if (req.file) {
      const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'categories');
      payload.image = { url, publicId, alt: req.body.imageAlt || '' };
    }

    if (payload.order === undefined) {
      payload.order = await Category.countDocuments();
    }

    const cat = await Category.create(payload);
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Not found' });

    const payload = sanitize(req.body);

    if (req.file) {
      if (cat.image?.publicId) await deleteFromCloudinary(cat.image.publicId);
      const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'categories');
      payload.image = { url, publicId, alt: req.body.imageAlt || '' };
    }

    Object.assign(cat, payload);
    await cat.save();
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const toggleActive = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Not found' });
    cat.isActive = !cat.isActive;
    await cat.save();
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const reorderCategories = async (req, res) => {
  try {
    const list = Array.isArray(req.body.order) ? req.body.order : [];
    if (!list.length) return res.status(400).json({ success: false, message: 'order array required' });

    const bulk = list.map(({ id, order }) => ({
      updateOne: { filter: { _id: id }, update: { order: Number(order) || 0 } },
    }));
    await Category.bulkWrite(bulk);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Not found' });
    if (cat.image?.publicId) await deleteFromCloudinary(cat.image.publicId);
    await cat.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getActiveCategories,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  toggleActive,
  reorderCategories,
  deleteCategory,
};
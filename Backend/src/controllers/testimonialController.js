const Testimonial = require('../models/Testimonial');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// 🧹 Sanitizer
const sanitize = (raw = {}) => {
  const p = {};

  ['name', 'location', 'text', 'piece', 'date', 'imageAlt'].forEach((k) => {
    if (raw[k] !== undefined) {
      const v = String(raw[k]).trim();
      p[k] = v === '' ? null : v;
    }
  });

  // rating → number between 1 and 5
  if (raw.rating !== undefined && raw.rating !== '' && raw.rating !== null) {
    const n = Number(raw.rating);
    if (!Number.isNaN(n)) p.rating = Math.min(5, Math.max(1, n));
  }

  // booleans
  ['isActive', 'isFeatured'].forEach((k) => {
    if (raw[k] !== undefined) {
      if (typeof raw[k] === 'boolean') p[k] = raw[k];
      else if (typeof raw[k] === 'string') p[k] = raw[k].toLowerCase() === 'true';
    }
  });

  // order
  if (raw.order !== undefined && raw.order !== '' && raw.order !== null) {
    const n = Number(raw.order);
    if (!Number.isNaN(n)) p.order = n;
  }

  return p;
};

// ---------- PUBLIC ----------
const getActiveTestimonials = async (req, res) => {
  try {
    const list = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-__v')
      .lean();

    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- ADMIN ----------
const getAllTestimonials = async (req, res) => {
  try {
    const list = await Testimonial.find().sort({ order: 1 }).lean();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTestimonialById = async (req, res) => {
  try {
    const doc = await Testimonial.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createTestimonial = async (req, res) => {
  try {
    const payload = sanitize(req.body);

    if (req.file) {
      const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'testimonials');
      payload.image = { url, publicId, alt: req.body.imageAlt || '' };
    }

    if (payload.order === undefined) {
      payload.order = await Testimonial.countDocuments();
    }

    const doc = await Testimonial.create(payload);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const doc = await Testimonial.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    const payload = sanitize(req.body);

    if (req.file) {
      if (doc.image?.publicId) await deleteFromCloudinary(doc.image.publicId);
      const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'testimonials');
      payload.image = { url, publicId, alt: req.body.imageAlt || '' };
    }

    Object.assign(doc, payload);
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const toggleActive = async (req, res) => {
  try {
    const doc = await Testimonial.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    doc.isActive = !doc.isActive;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const reorderTestimonials = async (req, res) => {
  try {
    const list = Array.isArray(req.body.order) ? req.body.order : [];
    if (!list.length) {
      return res.status(400).json({ success: false, message: 'order array required' });
    }

    const bulk = list.map(({ id, order }) => ({
      updateOne: { filter: { _id: id }, update: { order: Number(order) || 0 } },
    }));

    await Testimonial.bulkWrite(bulk);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const doc = await Testimonial.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    if (doc.image?.publicId) await deleteFromCloudinary(doc.image.publicId);
    await doc.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getActiveTestimonials,
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  toggleActive,
  reorderTestimonials,
  deleteTestimonial,
};
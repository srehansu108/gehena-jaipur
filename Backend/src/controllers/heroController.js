const HeroSlide = require('../models/HeroSlide');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// ============================================================
// 🧹 Payload sanitizer — normalizes everything before Mongoose
// ============================================================
const sanitizeSlidePayload = (raw = {}) => {
  const p = {};

  // -------- String fields (trim; '' → null for optional) --------
  const requiredStrings = ['title', 'subtitle', 'cta', 'link'];
  const optionalStrings = ['description', 'bgColor', 'accentColor', 'imageAlt'];

  requiredStrings.forEach((k) => {
    if (raw[k] !== undefined) p[k] = String(raw[k]).trim();
  });

  optionalStrings.forEach((k) => {
    if (raw[k] !== undefined) {
      const v = String(raw[k]).trim();
      p[k] = v === '' ? null : v;
    }
  });

  // -------- Boolean: 'true' / 'false' / true / false / 1 / 0 --------
  if (raw.isActive !== undefined) {
    if (typeof raw.isActive === 'boolean') {
      p.isActive = raw.isActive;
    } else if (typeof raw.isActive === 'string') {
      p.isActive = raw.isActive.toLowerCase() === 'true';
    } else if (typeof raw.isActive === 'number') {
      p.isActive = raw.isActive === 1;
    }
  }

  // -------- Dates: '' / undefined / null → null; else Date --------
  ['startDate', 'endDate'].forEach((k) => {
    if (raw[k] === undefined || raw[k] === null || raw[k] === '') {
      p[k] = null;
    } else {
      const d = new Date(raw[k]);
      p[k] = isNaN(d.getTime()) ? null : d;
    }
  });

  // -------- Number: order --------
  if (raw.order !== undefined && raw.order !== null && raw.order !== '') {
    const n = Number(raw.order);
    if (!Number.isNaN(n)) p.order = n;
  }

  // -------- Nested image object (when provided) --------
  if (raw.image && typeof raw.image === 'object') {
    p.image = {
      url: raw.image.url,
      publicId: raw.image.publicId || null,
      alt: raw.image.alt || '',
    };
  }

  return p;
};

// ---------- PUBLIC ----------
const getActiveSlides = async (req, res) => {
  try {
    const now = new Date();
    const slides = await HeroSlide.find({
      isActive: true,
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ],
    })
      .sort({ order: 1 })
      .select('-createdBy -__v')
      .lean();

    if (slides.length) {
      HeroSlide.updateMany(
        { _id: { $in: slides.map((s) => s._id) } },
        { $inc: { impressions: 1 } }
      ).catch(() => {});
    }

    res.json({ success: true, data: slides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- ADMIN ----------
const getAllSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 }).lean();
    res.json({ success: true, data: slides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSlideById = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: slide });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createSlide = async (req, res) => {
  try {
    const payload = sanitizeSlidePayload(req.body);

    if (req.file) {
      const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'hero-slides');
      payload.image = { url, publicId, alt: req.body.imageAlt || '' };
    }

    // Auto-assign order if not provided
    if (payload.order === undefined) {
      const count = await HeroSlide.countDocuments();
      payload.order = count;
    }

    const slide = await HeroSlide.create(payload);
    res.status(201).json({ success: true, data: slide });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ success: false, message: 'Not found' });

    const payload = sanitizeSlidePayload(req.body);

    if (req.file) {
      if (slide.image?.publicId) await deleteFromCloudinary(slide.image.publicId);
      const { url, publicId } = await uploadToCloudinary(req.file.buffer, 'hero-slides');
      payload.image = { url, publicId, alt: req.body.imageAlt || '' };
    }

    Object.assign(slide, payload);
    await slide.save();
    res.json({ success: true, data: slide });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const toggleActive = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ success: false, message: 'Not found' });
    slide.isActive = !slide.isActive;
    await slide.save();
    res.json({ success: true, data: slide });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const reorderSlides = async (req, res) => {
  try {
    const list = Array.isArray(req.body.order) ? req.body.order : [];
    if (!list.length) {
      return res.status(400).json({ success: false, message: 'order array required' });
    }

    const bulk = list.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: Number(order) || 0 },
      },
    }));

    await HeroSlide.bulkWrite(bulk);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ success: false, message: 'Not found' });

    if (slide.image?.publicId) await deleteFromCloudinary(slide.image.publicId);
    await slide.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const trackClick = async (req, res) => {
  HeroSlide.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } }).catch(() => {});
  res.json({ success: true });
};

module.exports = {
  getActiveSlides,
  getAllSlides,
  getSlideById,
  createSlide,
  updateSlide,
  toggleActive,
  reorderSlides,
  deleteSlide,
  trackClick,
};
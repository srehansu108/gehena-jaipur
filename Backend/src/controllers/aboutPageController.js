const AboutPage = require('../models/AboutPage');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Default content — used if no document exists
const DEFAULTS = {
  slug: 'about',
  hero: {
    badge: 'Our Story',
    title: 'Crafting Timeless',
    highlight: 'Elegance',
    titleSuffix: 'Since 1994',
    description:
      'We are leading Manufacturer & Exporter of fine jewelry, committed to offering the best quality at competitive prices. Our journey is a testament to the enduring beauty of Indian craftsmanship.',
  },
  muse: {
    badge: 'Our Muse',
    title: 'The Spirit of',
    highlight: 'Gehna',
    paragraphs: [
      '"Gehna" - a word that resonates with the beauty of adornment. Our brand is inspired by the rich heritage of Indian jewelry and the timeless elegance it brings to every occasion. From the royal courts of ancient India to the modern woman of today, jewelry has always been a symbol of grace, tradition, and celebration.',
      'At Gehna Store, we believe that every piece of jewelry tells a story. Whether it\'s the intricate craftsmanship of a temple necklace or the delicate beauty of a diamond pendant, each creation is designed to make you feel special and unique.',
    ],
    image: { url: '', publicId: null, alt: 'Gehna Heritage' },
    statNumber: '30+',
    statLabel: 'Years of Excellence',
  },
  heritage: [
    { icon: 'Crown',    title: 'Heritage Chic',  description: 'Luxurious jewels from the house of Gehna shaped in elegant constituents personify the heritage of India with a modern eclectic twist.', order: 0 },
    { icon: 'Gem',      title: 'Art Revival',    description: "Led by the passion of our artisans, Gehna is the finest reflection of India's unmatched jewellery traditions and workmanship.", order: 1 },
    { icon: 'Sparkles', title: 'Craftsmanship',  description: 'Renowned for our signature magnificent pieces and rare craftsmanship, we harmonize classical tradition with modern interpretation.', order: 2 },
  ],
  values: [
    { icon: 'Gem',      title: 'Authenticity',       description: 'Every piece is crafted with genuine materials and carries a certificate of authenticity.', order: 0 },
    { icon: 'Shield',   title: 'Quality Assurance',  description: 'Rigorous quality checks at every stage ensure you receive nothing but the best.',           order: 1 },
    { icon: 'Heart',    title: 'Customer Trust',     description: 'We build lasting relationships through transparency and exceptional service.',              order: 2 },
    { icon: 'Sparkles', title: 'Innovation',         description: 'Blending traditional techniques with contemporary design for unique creations.',            order: 3 },
  ],
  milestones: [
    { year: '1994', title: 'The Beginning',            description: 'Gehna Store was founded with a vision to bring authentic Indian jewelry to the world.', order: 0 },
    { year: '2000', title: 'Global Expansion',         description: 'Started exporting to international markets across Europe and the Middle East.',         order: 1 },
    { year: '2010', title: 'Digital Revolution',       description: 'Launched our online store to reach customers worldwide.',                               order: 2 },
    { year: '2015', title: 'Craftsmanship Excellence', description: 'Recognized for exceptional design and quality standards globally.',                     order: 3 },
    { year: '2020', title: 'Sustainable Future',       description: 'Committed to ethical sourcing and sustainable practices.',                              order: 4 },
    { year: '2024', title: '30 Years of Legacy',       description: 'Celebrating three decades of timeless elegance and craftsmanship.',                     order: 5 },
  ],
  team: [],
  features: [
    { icon: 'Gem',      title: 'Authentic Materials', description: '925 Sterling Silver, 22K, 18K, 14K, 10K, 9K Gold', order: 0 },
    { icon: 'Sparkles', title: 'Design Excellence',   description: 'Beautifully fabricated to perfection with unique designs', order: 1 },
    { icon: 'Shield',   title: 'Quality Certified',   description: 'IGI Certified, Hallmarked, ISO 9001:2015', order: 2 },
    { icon: 'Truck',    title: 'Global Shipping',     description: 'Exporting worldwide with secure delivery', order: 3 },
  ],
  certifications: [
    { icon: 'BadgeCheck', label: 'IGI Certified',     order: 0 },
    { icon: 'BadgeCheck', label: 'Hallmarked Gold',   order: 1 },
    { icon: 'BadgeCheck', label: 'ISO 9001:2015',     order: 2 },
    { icon: 'BadgeCheck', label: 'Ethical Sourcing',  order: 3 },
  ],
  cta: {
    title: 'Experience the',
    highlight: 'Gehna',
    titleSuffix: 'Difference',
    description: 'Explore our exquisite collection and discover jewelry that tells your story.',
    primaryBtn: { label: 'Explore Collection', link: '/products' },
    secondaryBtn: { label: 'Contact Us', link: '/contact' },
  },
  isActive: true,
};

// ---------- Helper: get-or-create the singleton doc ----------
const getOrCreate = async () => {
  let doc = await AboutPage.findOne({ slug: 'about' });
  if (!doc) {
    doc = await AboutPage.create(DEFAULTS);
  }
  return doc;
};

// ---------- PUBLIC ----------
const getAboutPage = async (req, res) => {
  try {
    const doc = await getOrCreate();
    if (!doc.isActive) {
      return res.status(404).json({ success: false, message: 'Page not available' });
    }
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- ADMIN ----------
const getAboutPageAdmin = async (req, res) => {
  try {
    const doc = await getOrCreate();
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/pages/about  — full replace of known fields
const updateAboutPage = async (req, res) => {
  try {
    const doc = await getOrCreate();
    const body = req.body || {};

    // Whitelist — never trust arbitrary fields
    const allowed = [
      'hero',
      'muse',
      'heritage',
      'values',
      'milestones',
      'team',
      'features',
      'certifications',
      'cta',
      'isActive',
    ];

    allowed.forEach((key) => {
      if (body[key] !== undefined) doc[key] = body[key];
    });

    // Normalize ordering inside arrays
    ['heritage', 'values', 'milestones', 'team', 'features', 'certifications'].forEach((k) => {
      if (Array.isArray(doc[k])) {
        doc[k].forEach((item, i) => {
          if (item.order === undefined || item.order === null) item.order = i;
        });
      }
    });

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('❌ updateAboutPage error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/pages/about/upload — upload a single image, returns URL
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const folder = req.body.folder || 'about-page';
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, folder);
    res.json({ success: true, data: { url, publicId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/pages/about/reset — reset to defaults
const resetAboutPage = async (req, res) => {
  try {
    await AboutPage.deleteMany({ slug: 'about' });
    const doc = await AboutPage.create(DEFAULTS);
    res.json({ success: true, data: doc, message: 'Reset to defaults' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAboutPage,
  getAboutPageAdmin,
  updateAboutPage,
  uploadImage,
  resetAboutPage,
};
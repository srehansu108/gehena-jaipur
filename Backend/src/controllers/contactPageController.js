const ContactPage = require('../models/ContactPage');

const DEFAULTS = {
  slug: 'contact',
  hero: {
    badge: 'Get in Touch',
    title: "Let's",
    highlight: 'Connect',
    description:
      "We're here to help you find the perfect piece of jewelry. Reach out to us for any inquiries, custom orders, or assistance.",
  },
  contactCards: [
    {
      icon: 'MapPin',
      title: 'Visit Us',
      details: [
        '14-B, Kothari Bhawan,',
        'Mirza Ismail Rd, near Panch Batti,',
        'New Colony, Jaipur, Rajasthan 302001',
      ],
      action: 'Get Directions',
      actionLink: 'https://www.google.com/maps/place/Gehna+Jaipur/@26.9178204,75.8121204,17z',
      order: 0,
    },
    {
      icon: 'Phone',
      title: 'Call Us',
      details: ['+91 91458 42500', '+91 98765 43211', 'Mon-Sat: 10:00 AM - 6:00 PM'],
      action: 'Call Now',
      actionLink: 'tel:+919145842500',
      order: 1,
    },
    {
      icon: 'Mail',
      title: 'Email Us',
      details: ['info@gehnastore.com', 'support@gehnastore.com', 'We reply within 24 hours'],
      action: 'Send Email',
      actionLink: 'mailto:info@gehnastore.com',
      order: 2,
    },
    {
      icon: 'Clock',
      title: 'Working Hours',
      details: [
        'Monday - Saturday: 10:00 AM - 6:00 PM',
        'Sunday: Closed',
        'Special appointments available',
      ],
      action: 'Book Appointment',
      actionLink: '/appointments',
      order: 3,
    },
  ],
  quickAssistance: {
    title: 'Quick Assistance',
    phone: '+91 91458 42500',
    email: 'info@gehnastore.com',
    hours: 'Mon-Sat: 10 AM - 6 PM',
  },
  social: {
    title: 'Follow Us',
    links: [
      { icon: 'Instagram', label: 'Instagram', url: '#', order: 0 },
      { icon: 'Facebook', label: 'Facebook', url: '#', order: 1 },
      { icon: 'Twitter', label: 'Twitter', url: '#', order: 2 },
      { icon: 'Youtube', label: 'YouTube', url: '#', order: 3 },
    ],
  },
  trustBadges: {
    title: 'Why Trust Us',
    badges: [
      { icon: 'Shield', text: '100% Certified & Hallmarked', order: 0 },
      { icon: 'Truck', text: 'Free Shipping on ₹50,000+', order: 1 },
      { icon: 'Star', text: '4.8/5 Customer Rating', order: 2 },
    ],
  },
  map: {
    badge: 'Find Us',
    title: 'Visit Our',
    highlight: 'Flagship Store',
    address:
      '14-B, Kothari Bhawan, Mirza Ismail Rd, near Panch Batti, New Colony, Jaipur, Rajasthan 302001',
    phone: '+91 91458 42500',
    hours: 'Mon-Sat: 10 AM - 6 PM',
    iframeUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.9274!2d75.8095457!3d26.9178204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db6aaefffffd3%3A0xfd8bf47df9d8fe71!2sGehna%20Jaipur!5e0!3m2!1sen!2sin!4v1710000000000',
    externalLink: 'https://www.google.com/maps/place/Gehna+Jaipur/@26.9178204,75.8121204,17z',
    pinLabel: 'Gehna Jaipur',
  },
  storeLocations: [
    {
      name: 'Jaipur Flagship Store',
      address:
        '14-B, Kothari Bhawan, Mirza Ismail Rd, near Panch Batti, New Colony, Jaipur, Rajasthan 302001',
      phone: '+91 91458 42500',
      timings: 'Mon-Sat: 10:00 AM - 6:00 PM',
      mapLink: 'https://www.google.com/maps/place/Gehna+Jaipur/@26.9178204,75.8121204,17z',
      isMain: true,
      order: 0,
    },
    {
      name: 'Delhi Showroom',
      address: '456, Connaught Place, New Delhi 110001',
      phone: '+91 98765 43211',
      timings: 'Mon-Sat: 11:00 AM - 7:00 PM',
      mapLink: 'https://maps.google.com',
      isMain: false,
      order: 1,
    },
    {
      name: 'Mumbai Boutique',
      address: '789, Colaba Causeway, Mumbai 400001',
      phone: '+91 98765 43212',
      timings: 'Mon-Sat: 10:30 AM - 7:30 PM',
      mapLink: 'https://maps.google.com',
      isMain: false,
      order: 2,
    },
  ],
  faqs: [
    {
      question: 'What are your shipping policies?',
      answer:
        'We offer free shipping on orders above ₹50,000. Orders are typically processed within 2-3 business days and delivered in 3-5 business days within India.',
      order: 0,
    },
    {
      question: 'Do you provide international shipping?',
      answer:
        'Yes, we ship internationally to most countries. International shipping costs and delivery times vary by location. Contact us for a specific quote.',
      order: 1,
    },
    {
      question: 'What is your return and exchange policy?',
      answer:
        'We offer a 30-day return policy on most items. Products must be in original condition with all tags and packaging. Custom-made pieces are non-returnable.',
      order: 2,
    },
    {
      question: 'Do you provide certification for your jewelry?',
      answer:
        'All our diamond and gemstone jewelry comes with IGI or GIA certification. Gold jewelry is hallmarked with BIS certification.',
      order: 3,
    },
    {
      question: 'Can I place a custom order?',
      answer:
        'Absolutely! We specialize in custom-made jewelry. Contact our design team to bring your vision to life.',
      order: 4,
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit/debit cards, net banking, UPI, and cash on delivery for eligible orders.',
      order: 5,
    },
  ],
  cta: {
    title: 'Have a',
    highlight: 'Special',
    titleSuffix: 'Request?',
    description:
      "Whether it's a custom design, bulk order, or any other inquiry, we're here to help.",
    primaryBtn: { label: 'Send Inquiry', link: '#form' },
    secondaryBtn: { label: 'Explore Collection', link: '/products' },
  },
  isActive: true,
};

const getOrCreate = async () => {
  let doc = await ContactPage.findOne({ slug: 'contact' });
  if (!doc) doc = await ContactPage.create(DEFAULTS);
  return doc;
};

// ---------- PUBLIC ----------
const getContactPage = async (req, res) => {
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
const getContactPageAdmin = async (req, res) => {
  try {
    const doc = await getOrCreate();
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateContactPage = async (req, res) => {
  try {
    const doc = await getOrCreate();
    const body = req.body || {};

    const allowed = [
      'hero',
      'contactCards',
      'quickAssistance',
      'social',
      'trustBadges',
      'map',
      'storeLocations',
      'faqs',
      'cta',
      'isActive',
    ];

    allowed.forEach((key) => {
      if (body[key] !== undefined) doc[key] = body[key];
    });

    // Normalize ordering
    ['contactCards', 'storeLocations', 'faqs'].forEach((k) => {
      if (Array.isArray(doc[k])) {
        doc[k].forEach((item, i) => {
          if (item.order === undefined || item.order === null) item.order = i;
        });
      }
    });
    ['social', 'trustBadges'].forEach((group) => {
      if (Array.isArray(doc[group]?.links)) {
        doc[group].links.forEach((item, i) => {
          if (item.order === undefined || item.order === null) item.order = i;
        });
      }
      if (Array.isArray(doc[group]?.badges)) {
        doc[group].badges.forEach((item, i) => {
          if (item.order === undefined || item.order === null) item.order = i;
        });
      }
    });

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('❌ updateContactPage error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

const resetContactPage = async (req, res) => {
  try {
    await ContactPage.deleteMany({ slug: 'contact' });
    const doc = await ContactPage.create(DEFAULTS);
    res.json({ success: true, data: doc, message: 'Reset to defaults' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getContactPage,
  getContactPageAdmin,
  updateContactPage,
  resetContactPage,
};
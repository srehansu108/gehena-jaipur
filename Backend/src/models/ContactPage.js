const mongoose = require('mongoose');

const contactCardSchema = {
  icon: { type: String, default: 'MapPin' },
  title: { type: String, trim: true },
  details: [{ type: String, trim: true }],
  action: { type: String, trim: true, default: '' },
  actionLink: { type: String, trim: true, default: '' },
  order: { type: Number, default: 0 },
};

const socialLinkSchema = {
  icon: { type: String, default: 'Instagram' },
  label: { type: String, trim: true },
  url: { type: String, trim: true, default: '#' },
  order: { type: Number, default: 0 },
};

const trustBadgeSchema = {
  icon: { type: String, default: 'Shield' },
  text: { type: String, trim: true },
  order: { type: Number, default: 0 },
};

const storeLocationSchema = {
  name: { type: String, trim: true },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  timings: { type: String, trim: true },
  mapLink: { type: String, trim: true, default: '' },
  isMain: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
};

const faqSchema = {
  question: { type: String, trim: true },
  answer: { type: String, trim: true },
  order: { type: Number, default: 0 },
};

const contactPageSchema = new mongoose.Schema(
  {
    slug: { type: String, default: 'contact', unique: true, index: true },

    hero: {
      badge: { type: String, default: 'Get in Touch' },
      title: { type: String, default: "Let's" },
      highlight: { type: String, default: 'Connect' },
      description: { type: String, default: '' },
    },

    contactCards: [contactCardSchema],

    quickAssistance: {
      title: { type: String, default: 'Quick Assistance' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      hours: { type: String, default: '' },
    },

    social: {
      title: { type: String, default: 'Follow Us' },
      links: [socialLinkSchema],
    },

    trustBadges: {
      title: { type: String, default: 'Why Trust Us' },
      badges: [trustBadgeSchema],
    },

    map: {
      badge: { type: String, default: 'Find Us' },
      title: { type: String, default: 'Visit Our' },
      highlight: { type: String, default: 'Flagship Store' },
      address: { type: String, default: '' },
      phone: { type: String, default: '' },
      hours: { type: String, default: '' },
      iframeUrl: { type: String, default: '' },
      externalLink: { type: String, default: '' },
      pinLabel: { type: String, default: 'Flagship Store' },
    },

    storeLocations: [storeLocationSchema],

    faqs: [faqSchema],

    cta: {
      title: { type: String, default: 'Have a' },
      highlight: { type: String, default: 'Special' },
      titleSuffix: { type: String, default: 'Request?' },
      description: { type: String, default: '' },
      primaryBtn: {
        label: { type: String, default: 'Send Inquiry' },
        link: { type: String, default: '#form' },
      },
      secondaryBtn: {
        label: { type: String, default: 'Explore Collection' },
        link: { type: String, default: '/products' },
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactPage', contactPageSchema);
const mongoose = require('mongoose');

const iconTitleDesc = {
  icon: { type: String, default: 'Gem' },
  title: { type: String, trim: true },
  description: { type: String, trim: true },
  order: { type: Number, default: 0 },
};

const aboutPageSchema = new mongoose.Schema(
  {
    slug: { type: String, default: 'about', unique: true, index: true },

    // ---- Hero ----
    hero: {
      badge: { type: String, default: 'Our Story' },
      title: { type: String, default: 'Crafting Timeless' },
      highlight: { type: String, default: 'Elegance' },
      titleSuffix: { type: String, default: 'Since 1994' },
      description: { type: String, default: '' },
    },

    // ---- Muse ----
    muse: {
      badge: { type: String, default: 'Our Muse' },
      title: { type: String, default: 'The Spirit of' },
      highlight: { type: String, default: 'Gehna' },
      paragraphs: [{ type: String }],
      image: {
        url: { type: String, default: '' },
        publicId: { type: String, default: null },
        alt: { type: String, default: '' },
      },
      statNumber: { type: String, default: '30+' },
      statLabel: { type: String, default: 'Years of Excellence' },
    },

    // ---- Lists ----
    heritage: [iconTitleDesc],
    values: [iconTitleDesc],
    milestones: [
      {
        year: { type: String, trim: true },
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        order: { type: Number, default: 0 },
      },
    ],
    team: [
      {
        name: { type: String, trim: true },
        role: { type: String, trim: true },
        description: { type: String, trim: true },
        image: {
          url: { type: String, default: '' },
          publicId: { type: String, default: null },
        },
        order: { type: Number, default: 0 },
      },
    ],
    features: [iconTitleDesc],
    certifications: [
      {
        icon: { type: String, default: 'BadgeCheck' },
        label: { type: String, trim: true },
        order: { type: Number, default: 0 },
      },
    ],

    // ---- CTA ----
    cta: {
      title: { type: String, default: 'Experience the' },
      highlight: { type: String, default: 'Gehna' },
      titleSuffix: { type: String, default: 'Difference' },
      description: { type: String, default: '' },
      primaryBtn: {
        label: { type: String, default: 'Explore Collection' },
        link: { type: String, default: '/products' },
      },
      secondaryBtn: {
        label: { type: String, default: 'Contact Us' },
        link: { type: String, default: '/contact' },
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AboutPage', aboutPageSchema);
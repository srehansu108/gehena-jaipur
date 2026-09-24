const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    subtitle: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 300 },
    cta: { type: String, required: true, trim: true, maxlength: 40 },
    link: { type: String, required: true, trim: true },

    image: {
      url: { type: String, required: true },
      publicId: { type: String },
      alt: { type: String, default: '' },
    },

    bgColor: { type: String, default: 'from-pink-50/90 to-rose-50/90' },
    accentColor: {
      type: String,
      enum: ['pink', 'rose', 'blush', 'gold', 'emerald', 'indigo'],
      default: 'pink',
    },

    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },

    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

heroSlideSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    count: { type: String, trim: true, default: '' },      // e.g. "500+ Designs"
    image: {
      url: { type: String, required: true },
      publicId: { type: String },
      alt: { type: String, default: '' },
    },
    color: { type: String, default: 'from-pink-500' },     // tailwind gradient classes
    hoverColor: { type: String, default: 'hover:from-pink-600' },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    showInGrid: { type: Boolean, default: true },          // if you later have many cats
  },
  { timestamps: true }
);

categorySchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Category', categorySchema);
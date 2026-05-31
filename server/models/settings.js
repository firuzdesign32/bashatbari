const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  heroTitle: {
    type: String,
    required: true
  },
  heroSubtitle: {
    type: String,
    required: true
  },
  heroVideoUrl: {
    type: String,
    required: true
  },
  aboutTitle: {
    type: String,
    required: true
  },
  aboutText1: {
    type: String,
    required: true
  },
  aboutText2: {
    type: String,
    required: true
  },
  aboutImage: {
    type: String,
    required: true
  },
  mediaVideo1Url: {
    type: String,
    required: true
  },
  mediaVideo1Title: {
    type: String,
    required: true
  },
  mediaVideo2Url: {
    type: String,
    required: true
  },
  mediaVideo2Title: {
    type: String,
    required: true
  },
  contactAddress: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactHours: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Settings', settingsSchema);

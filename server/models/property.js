const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  titleEn: {
    type: String,
    required: true
  },
  block: {
    type: String,
    required: true
  },
  plotSize: {
    type: Number,
    required: true
  },
  facing: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Sold'],
    default: 'Available'
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Residential', 'Commercial'],
    default: 'Residential'
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Property', propertySchema);

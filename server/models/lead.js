const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Closed', 'Discarded'],
    default: 'New'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', leadSchema);

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dataStore = require('../config/dataStore');

// @route   GET api/properties
// @desc    Get all property listings (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.block) filters.block = req.query.block;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.featured !== undefined) filters.featured = req.query.featured;

    const properties = await dataStore.getAllProperties(filters);
    res.json(properties);
  } catch (err) {
    console.error('Error fetching properties:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await dataStore.getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    console.error(`Error fetching property ${req.params.id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/properties
// @desc    Create a property listing
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  const { title, titleEn, block, plotSize, facing, price, status, description, image, category, featured } = req.body;

  // Simple validation
  if (!title || !titleEn || !block || !plotSize || !facing || !image) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    const newProperty = await dataStore.createProperty({
      title,
      titleEn,
      block,
      plotSize: Number(plotSize),
      facing,
      price: price ? Number(price) : 0,
      status: status || 'Available',
      description: description || '',
      image,
      category: category || 'Residential',
      featured: featured === true || featured === 'true'
    });

    res.json(newProperty);
  } catch (err) {
    console.error('Error creating property:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/properties/:id
// @desc    Update a property listing
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedProperty = await dataStore.updateProperty(req.params.id, req.body);
    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(updatedProperty);
  } catch (err) {
    console.error(`Error updating property ${req.params.id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/properties/:id
// @desc    Delete a property listing
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedProperty = await dataStore.deleteProperty(req.params.id);
    if (!deletedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (err) {
    console.error(`Error deleting property ${req.params.id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

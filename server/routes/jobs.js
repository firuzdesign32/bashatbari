const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dataStore = require('../config/dataStore');

// @route   GET api/jobs
// @desc    Get job openings (with optional active filter)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const activeOnly = req.query.active === 'true';
    const jobs = await dataStore.getAllJobs(activeOnly);
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/jobs
// @desc    Create a job opening
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  const { title, department, location, description, requirements, deadline, active } = req.body;

  if (!title || !department || !description || !requirements || !deadline) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    const newJob = await dataStore.createJob({
      title,
      department,
      location: location || 'Nikunja, Dhaka',
      description,
      requirements,
      deadline,
      active: active !== false
    });
    res.json(newJob);
  } catch (err) {
    console.error('Error creating job:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/jobs/:id
// @desc    Update a job opening
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedJob = await dataStore.updateJob(req.params.id, req.body);
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(updatedJob);
  } catch (err) {
    console.error(`Error updating job ${req.params.id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/jobs/:id
// @desc    Delete a job opening
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedJob = await dataStore.deleteJob(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ success: true, message: 'Job opening deleted successfully' });
  } catch (err) {
    console.error(`Error deleting job ${req.params.id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

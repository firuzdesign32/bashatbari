const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dataStore = require('../config/dataStore');

// @route   GET api/team-members
// @desc    Get all team members
// @access  Public
router.get('/', async (req, res) => {
  try {
    const members = await dataStore.getAllTeamMembers();
    res.json(members);
  } catch (err) {
    console.error('Error fetching team members:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/team-members
// @desc    Create a team member
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  const { name, role, image, order } = req.body;

  if (!name || !role || !image) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    const newMember = await dataStore.createTeamMember({
      name,
      role,
      image,
      order: Number(order) || 0
    });
    res.json(newMember);
  } catch (err) {
    console.error('Error creating team member:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/team-members/:id
// @desc    Update a team member
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedMember = await dataStore.updateTeamMember(req.params.id, req.body);
    if (!updatedMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(updatedMember);
  } catch (err) {
    console.error(`Error updating team member ${req.params.id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/team-members/:id
// @desc    Delete a team member
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedMember = await dataStore.deleteTeamMember(req.params.id);
    if (!deletedMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (err) {
    console.error(`Error deleting team member ${req.params.id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dataStore = require('../config/dataStore');

// @route   GET api/blogs
// @desc    Get all blog posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const blogs = await dataStore.getAllBlogs();
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/blogs/:id
// @desc    Get blog post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const blog = await dataStore.getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(blog);
  } catch (err) {
    console.error(`Error fetching blog ${req.params.id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/blogs
// @desc    Create a blog post
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  const { title, content, image, author, tags } = req.body;

  if (!title || !content || !image) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    const newBlog = await dataStore.createBlog({
      title,
      content,
      image,
      author: author || 'Admin',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
    });
    res.json(newBlog);
  } catch (err) {
    console.error('Error creating blog post:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/blogs/:id
// @desc    Update a blog post
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedBlog = await dataStore.updateBlog(req.params.id, req.body);
    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(updatedBlog);
  } catch (err) {
    console.error(`Error updating blog ${req.params.id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/blogs/:id
// @desc    Delete a blog post
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedBlog = await dataStore.deleteBlog(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (err) {
    console.error(`Error deleting blog ${req.params.id}:`, err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

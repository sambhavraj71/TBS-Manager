const router = require('express').Router();
const Project = require('../models/Project');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('client');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('client');
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create project
// In POST route for creating project:
router.post('/', async (req, res) => {
  try {
    // Get user ID from token (you'll need to implement this)
    // For now, let's assume we pass createdBy in request body
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
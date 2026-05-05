const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const checkProjectAccess = require('../middleware/projectAccess');

const router = express.Router();

// Create project (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Please provide a project name' });
    }

    const project = new Project({
      name,
      description,
      admin: req.userId,
      members: [req.userId]
    });

    await project.save();
    await project.populate('admin members', 'name email');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { admin: req.userId },
        { members: req.userId }
      ]
    }).populate('admin members', 'name email');

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single project
router.get('/:projectId', auth, checkProjectAccess, async (req, res) => {
  try {
    await req.project.populate('admin members', 'name email');
    res.json(req.project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project (Admin only)
router.put('/:projectId', auth, checkProjectAccess, async (req, res) => {
  try {
    if (!req.isProjectAdmin) {
      return res.status(403).json({ error: 'Only project admin can update' });
    }

    const { name, description } = req.body;

    if (name) req.project.name = name;
    if (description) req.project.description = description;

    await req.project.save();
    await req.project.populate('admin members', 'name email');

    res.json({
      message: 'Project updated successfully',
      project: req.project
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add member to project (Admin only)
router.post('/:projectId/members', auth, checkProjectAccess, async (req, res) => {
  try {
    if (!req.isProjectAdmin) {
      return res.status(403).json({ error: 'Only project admin can add members' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Please provide user ID' });
    }

    if (req.project.members.includes(userId)) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    req.project.members.push(userId);
    await req.project.save();
    await req.project.populate('admin members', 'name email');

    res.json({
      message: 'Member added successfully',
      project: req.project
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member from project (Admin only)
router.delete('/:projectId/members/:userId', auth, checkProjectAccess, async (req, res) => {
  try {
    if (!req.isProjectAdmin) {
      return res.status(403).json({ error: 'Only project admin can remove members' });
    }

    req.project.members = req.project.members.filter(
      id => id.toString() !== req.params.userId
    );

    await req.project.save();
    await req.project.populate('admin members', 'name email');

    res.json({
      message: 'Member removed successfully',
      project: req.project
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project (Admin only)
router.delete('/:projectId', auth, checkProjectAccess, async (req, res) => {
  try {
    if (!req.isProjectAdmin) {
      return res.status(403).json({ error: 'Only project admin can delete' });
    }

    await Project.findByIdAndDelete(req.params.projectId);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

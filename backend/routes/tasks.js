const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const checkProjectAccess = require('../middleware/projectAccess');

const router = express.Router();

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, projectId, assignee, dueDate, priority } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: 'Please provide title and projectId' });
    }

    // Check if user has access to project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isAdmin = project.admin.toString() === req.userId;
    const isMember = project.members.includes(req.userId);

    if (!isAdmin && !isMember) {
      return res.status(403).json({ error: 'Not authorized to create tasks in this project' });
    }

    const task = new Task({
      title,
      description,
      project: projectId,
      assignee,
      dueDate,
      priority: priority || 'Medium',
      createdBy: req.userId
    });

    await task.save();
    await task.populate(['project', 'assignee', 'createdBy'], 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all tasks for a project
router.get('/project/:projectId', auth, checkProjectAccess, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single task
router.get('/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('project assignee createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check access
    const project = await Project.findById(task.project);
    const isAdmin = project.admin.toString() === req.userId;
    const isMember = project.members.includes(req.userId);

    if (!isAdmin && !isMember) {
      return res.status(403).json({ error: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task
router.put('/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check access
    const project = await Project.findById(task.project);
    const isAdmin = project.admin.toString() === req.userId;
    const isAssignee = task.assignee?.toString() === req.userId;

    if (!isAdmin && !isAssignee && task.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const { title, description, status, priority, assignee, dueDate } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignee) task.assignee = assignee;
    if (dueDate) task.dueDate = dueDate;

    task.updatedAt = Date.now();
    await task.save();
    await task.populate('assignee createdBy', 'name email');

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task (Only project admin or task creator)
router.delete('/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isAdmin = project.admin.toString() === req.userId;

    if (!isAdmin && task.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    // Get all projects for user
    const projects = await Project.find({
      $or: [
        { admin: req.userId },
        { members: req.userId }
      ]
    });

    const projectIds = projects.map(p => p._id);

    const allTasks = await Task.find({ project: { $in: projectIds } });
    const toDoTasks = allTasks.filter(t => t.status === 'To Do');
    const inProgressTasks = allTasks.filter(t => t.status === 'In Progress');
    const completedTasks = allTasks.filter(t => t.status === 'Completed');

    const now = new Date();
    const overdueTasks = allTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed'
    );

    const myTasks = allTasks.filter(t => t.assignee?.toString() === req.userId);

    res.json({
      totalProjects: projects.length,
      totalTasks: allTasks.length,
      toDoCount: toDoTasks.length,
      inProgressCount: inProgressTasks.length,
      completedCount: completedTasks.length,
      overdueCount: overdueTasks.length,
      myTasksCount: myTasks.length,
      overdueTasks: overdueTasks.map(t => ({
        id: t._id,
        title: t.title,
        dueDate: t.dueDate,
        project: t.project
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

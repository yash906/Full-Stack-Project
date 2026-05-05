const Project = require('../models/Project');

const checkProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is admin or member
    const isAdmin = project.admin.toString() === req.userId;
    const isMember = project.members.includes(req.userId);

    if (!isAdmin && !isMember) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }

    req.project = project;
    req.isProjectAdmin = isAdmin;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkProjectAccess;

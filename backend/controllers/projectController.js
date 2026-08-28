import Project from '../models/Project.js';
import mongoose from 'mongoose';

/**
 * GET /api/projects
 * Return all projects belonging to the current authenticated user.
 */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * POST /api/projects
 * Create a new project for the current user.
 */
export const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      problem,
      solution,
      technologies,
      repositoryUrl,
      liveDemoUrl,
      source,
      githubRepositoryId,
      primaryLanguage,
      isPrivate,
    } = req.body;

    const descOrProb = (problem || description || '').trim();
    if (!title?.trim() || !descOrProb || !technologies || !Array.isArray(technologies) || technologies.length === 0) {
      return res.status(400).json({ error: 'Title, description/problem, and at least one technology are required.' });
    }

    const project = await Project.create({
      userId: req.user._id,
      title: title.trim(),
      description: (description || problem || '').trim(),
      problem: (problem || description || '').trim(),
      solution: (solution || '').trim(),
      technologies: Array.isArray(technologies) ? technologies : [technologies],
      repositoryUrl: repositoryUrl?.trim() || '',
      liveDemoUrl: liveDemoUrl?.trim() || '',
      source: source === 'github' ? 'github' : 'custom',
      githubRepositoryId: githubRepositoryId ? Number(githubRepositoryId) : null,
      primaryLanguage: primaryLanguage?.trim() || '',
      isPrivate: Boolean(isPrivate),
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * PUT /api/projects/:id
 * Update a project. Only the owner can update.
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid project ID.' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden. You do not own this project.' });
    }

    const {
      title,
      description,
      problem,
      solution,
      technologies,
      repositoryUrl,
      liveDemoUrl,
      primaryLanguage,
      isPrivate,
    } = req.body;

    if (technologies !== undefined) {
      if (!Array.isArray(technologies) || technologies.length === 0) {
        return res.status(400).json({ error: 'At least one technology is required.' });
      }
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (problem !== undefined) updates.problem = problem.trim();
    if (solution !== undefined) updates.solution = solution.trim();
    if (technologies !== undefined) updates.technologies = technologies;
    if (repositoryUrl !== undefined) updates.repositoryUrl = repositoryUrl.trim();
    if (liveDemoUrl !== undefined) updates.liveDemoUrl = liveDemoUrl.trim();
    if (primaryLanguage !== undefined) updates.primaryLanguage = primaryLanguage.trim();
    if (isPrivate !== undefined) updates.isPrivate = Boolean(isPrivate);

    const updated = await Project.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    console.error('Update project error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * DELETE /api/projects/:id
 * Delete a project. Only the owner can delete.
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid project ID.' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden. You do not own this project.' });
    }

    await Project.findByIdAndDelete(id);
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

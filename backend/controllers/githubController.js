import User from '../models/User.js';
import Project from '../models/Project.js';
import logger from '../utils/logger.js';

/**
 * Helper to fetch from GitHub API using the authenticated user's OAuth access token.
 */
async function fetchGithubApi(endpoint, accessToken) {
  if (!accessToken) {
    throw new Error('GitHub access token is required.');
  }

  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'CareerOS-App',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('GitHub access token expired or revoked. Please reconnect your GitHub account.');
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please try again later.');
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `GitHub API error: ${response.status}`);
  }

  return response.json();
}

/**
 * GET /api/github/repositories
 * Retrieve the authenticated CareerOS user's repositories using their GitHub OAuth token.
 */
export const getRepositories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+auth.github.accessToken');
    const accessToken = user?.auth?.github?.accessToken;

    if (!accessToken) {
      return res.status(400).json({
        error: 'GitHub account is not connected. Please connect your GitHub account via OAuth.',
        connected: false,
      });
    }

    // Re-validate identity & fetch repositories using authenticated token
    const [githubUser, reposData] = await Promise.all([
      fetchGithubApi('/user', accessToken),
      fetchGithubApi('/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator', accessToken),
    ]);
    const githubUsername = githubUser.login || user.auth?.github?.username || '';
    const githubRepos = Array.isArray(reposData) ? reposData : [];

    // Update username if needed
    if (githubUser.login && user.auth.github.username !== githubUser.login) {
      user.auth.github.username = githubUser.login;
      user.connectedSources.github = githubUser.login;
      await user.save();
    }

    // Fetch user's existing imported GitHub projects to flag already imported repos
    const existingProjects = await Project.find({
      userId: req.user._id,
      source: 'github',
    }).select('githubRepositoryId');

    const importedSet = new Set(existingProjects.map((p) => p.githubRepositoryId).filter(Boolean));

    const normalizedRepos = githubRepos.map((repo) => ({
      githubId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || '',
      primaryLanguage: repo.language || '',
      repositoryUrl: repo.html_url,
      liveDemoUrl: repo.homepage || '',
      isPrivate: repo.private || false,
      stars: repo.stargazers_count || 0,
      updatedAt: repo.updated_at,
      alreadyImported: importedSet.has(repo.id),
    }));

    logger.info('GITHUB', `Fetching repositories for user: ${user.email || req.user._id} (account: @${githubUsername})`);

    res.json({
      username: githubUsername,
      repositories: normalizedRepos,
    });
  } catch (error) {
    logger.error('GITHUB', 'Fetch GitHub repositories failed', error);
    res.status(500).json({ error: error.message || 'Failed to fetch GitHub repositories.' });
  }
};

/**
 * POST /api/github/import
 * Import selected GitHub repositories into CareerOS Projects for the authenticated user.
 */
export const importRepositories = async (req, res) => {
  try {
    const { repoIds } = req.body;

    if (!Array.isArray(repoIds) || repoIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one repository to import.' });
    }

    const user = await User.findById(req.user._id).select('+auth.github.accessToken');
    const accessToken = user?.auth?.github?.accessToken;

    if (!accessToken) {
      return res.status(400).json({ error: 'GitHub account is not connected.' });
    }

    const importTask = logger.startTask('GITHUB', 'Batch Import Repositories', {
      user: user.email || user._id,
      selectedCount: repoIds.length,
    });

    // Fetch user's repos via authenticated token to ensure ownership/access
    const githubRepos = await fetchGithubApi('/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator', accessToken);
    const selectedRepos = githubRepos.filter((r) => repoIds.includes(r.id));

    if (selectedRepos.length === 0) {
      importTask.error(new Error('No matching repos found'), 'No matching repositories found to import');
      return res.status(404).json({ error: 'No matching repositories found to import.' });
    }

    const importedProjects = [];

    for (const repo of selectedRepos) {
      const technologies = repo.language ? [repo.language] : ['GitHub'];
      
      const projectData = {
        userId: req.user._id,
        source: 'github',
        githubRepositoryId: repo.id,
        title: repo.name,
        description: (repo.description || '').slice(0, 1000) || `Repository implementation for ${repo.name}.`,
        problem: (repo.description || '').slice(0, 1000) || `Repository codebase and implementation for ${repo.name}.`,
        solution: 'Engineered modular codebase architecture, dependency management, and technical delivery.',
        primaryLanguage: repo.language || '',
        technologies,
        repositoryUrl: repo.html_url || '',
        liveDemoUrl: repo.homepage || '',
        isPrivate: repo.private || false,
      };

      // Upsert to prevent duplicate imports for this user
      const updatedProject = await Project.findOneAndUpdate(
        { userId: req.user._id, githubRepositoryId: repo.id },
        { $set: projectData },
        { upsert: true, new: true, runValidators: true }
      );

      importedProjects.push(updatedProject);
    }

    importTask.success({
      importedCount: importedProjects.length,
      repos: importedProjects.map(p => p.title).join(', ')
    });

    res.status(200).json({
      message: `Successfully imported ${importedProjects.length} repository project(s).`,
      imported: importedProjects,
    });
  } catch (error) {
    logger.error('GITHUB', 'Import GitHub repositories failed', error);
    res.status(500).json({ error: error.message || 'Failed to import GitHub repositories.' });
  }
};

/**
 * DELETE /api/github/repositories/:githubRepositoryId
 * Remove an imported GitHub repository representation from CareerOS (does not delete GitHub repo).
 */
export const removeImportedRepository = async (req, res) => {
  try {
    const githubRepositoryId = Number(req.params.githubRepositoryId);

    if (!githubRepositoryId || isNaN(githubRepositoryId)) {
      return res.status(400).json({ error: 'Invalid GitHub repository ID.' });
    }

    const deleted = await Project.findOneAndDelete({
      userId: req.user._id,
      githubRepositoryId,
      source: 'github',
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Imported repository project not found.' });
    }

    res.json({ message: 'Project removed from CareerOS successfully.' });
  } catch (error) {
    console.error('Remove imported repository error:', error);
    res.status(500).json({ error: 'Failed to remove project.' });
  }
};

/**
 * POST /api/github/disconnect
 * Disconnect GitHub account while keeping previously imported projects intact.
 */
export const disconnectGithub = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.auth?.github) {
      user.auth.github.accessToken = undefined;
      user.auth.github.username = undefined;
      user.auth.github.id = undefined;
    }
    if (user.connectedSources) {
      user.connectedSources.github = '';
    }

    await user.save();

    res.json({ message: 'GitHub account disconnected successfully.' });
  } catch (error) {
    console.error('Disconnect GitHub error:', error);
    res.status(500).json({ error: 'Failed to disconnect GitHub.' });
  }
};

/**
 * GET /api/github/contributions
 * Fetch GitHub contribution calendar and commit count for a specific year.
 */
export const getContributionsByYear = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+auth.github.accessToken');
    const username = user?.connectedSources?.github || user?.auth?.github?.username;
    if (!username) {
      return res.status(400).json({ error: 'GitHub account is not connected.' });
    }

    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const token = user?.auth?.github?.accessToken || null;
    const { fetchContributionsGraphQL, fetchContributionsForYear } = await import('../services/githubService.js');
    
    let data = null;
    if (token) {
      const gqlData = await fetchContributionsGraphQL(username, token, [year]);
      if (gqlData && gqlData[year]) {
        data = gqlData[year];
      }
    }

    if (!data) {
      data = await fetchContributionsForYear(username, year);
    }

    if (!data) {
      return res.status(404).json({ error: 'Could not fetch contributions for year ' + year });
    }

    // Persist in Telemetry model so subsequent requests are instantaneous
    try {
      const Telemetry = (await import('../models/Telemetry.js')).default;
      const telemetryDoc = await Telemetry.findOne({ userId: req.user._id, source: 'github' });
      if (telemetryDoc && telemetryDoc.data) {
        if (!telemetryDoc.data.yearlyContributions) {
          telemetryDoc.data.yearlyContributions = {};
        }
        telemetryDoc.data.yearlyContributions[year] = data;
        telemetryDoc.markModified('data');
        await telemetryDoc.save();
      }
    } catch {
      // Telemetry cache update is non-blocking
    }

    res.json({
      year,
      totalContributions: data.totalContributions,
      submissionCalendar: data.submissionCalendar,
    });
  } catch (error) {
    console.error('Get GitHub contributions error:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub contributions.' });
  }
};


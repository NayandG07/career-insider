# GitHub Integration Documentation — CareerOS

## 1. Overview & Architecture

The GitHub integration in CareerOS provides developer identity verification, repository telemetry, commit statistics, language distribution, and a curated repository import mechanism for project showcase.

```
┌─────────────────────────┐
│     CareerOS Client     │
│   (React + Vite + UI)   │
└────────────┬────────────┘
             │ 1. Initiate OAuth / Import Repos
             ▼
┌─────────────────────────┐
│     Express Backend     │
│   (Controllers/Routes)  │
└──────┬───────────┬──────┘
       │           │
 2. OAuth Token    │ 3. Query Octokit / REST API
       │           ▼
       │    ┌─────────────────────────┐
       │    │     GitHub REST API     │
       │    │  (api.github.com/user)  │
       │    └─────────────────────────┘
       ▼
┌─────────────────────────┐
│      MongoDB Atlas      │
│  (Users & Telemetry DB) │
└─────────────────────────┘
```

---

## 2. Directory Structure & File Map

| File Path | Layer | Primary Responsibility |
|---|---|---|
| `backend/routes/githubRoutes.js` | Routing | Defines endpoints for OAuth initiation, callback, profile fetch, repo listing, repo import, and disconnect. |
| `backend/controllers/githubController.js` | Controller | Handles HTTP requests, OAuth code-for-token exchange, repository sync, and MongoDB persistence. |
| `backend/services/githubService.js` | Service / API Client | Interacts with GitHub REST API (`https://api.github.com`), normalizes commit history, languages, and repo statistics. |
| `backend/models/User.js` | Model | Stores `auth.github` (ID, username, encrypted/hidden `accessToken`) and `connectedSources.github`. |
| `backend/models/Telemetry.js` | Model | Stores aggregated GitHub metrics (total stars, commits, PRs, language breakdown). |
| `backend/models/Project.js` | Model | Stores imported GitHub repositories as showcase projects with commit counts and tech tags. |
| `frontend/src/services/githubService.js` | Client Service | Frontend Axios wrapper for `/api/github` endpoints. |
| `frontend/src/components/GithubRepoPickerModal.jsx` | Component | Modal allowing users to search, select, and import repositories into CareerOS projects. |
| `frontend/src/pages/Settings.jsx` | Page | Manages connect, repository picker trigger, and disconnect actions. |
| `frontend/src/pages/Projects.jsx` | Page | Displays imported GitHub projects and triggers the repo picker modal. |

---

## 3. Data Acquisition & Secrets Management

### Acquisition Protocol
- **Method**: GitHub OAuth 2.0 Web Application Flow.
- **Scopes Requested**: `read:user`, `repo` (or public repo access).
- **Security & Secret Handling**:
  - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are stored exclusively in backend `.env` variables.
  - The resulting `accessToken` is stored in MongoDB on `User.auth.github.accessToken` with `{ select: false }`, ensuring it is **never returned to client-side React code**.

---

## 4. Backend Implementation & Logic

### 4.1 GitHub REST Data Fetching (`backend/services/githubService.js`)

```javascript
import axios from 'axios';

const GITHUB_API = 'https://api.github.com';

export async function fetchGitHubData(username, accessToken = null) {
  const headers = {
    'User-Agent': 'CareerOS-App',
    Accept: 'application/vnd.github.v3+json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // 1. Fetch user public profile
  const userRes = await axios.get(`${GITHUB_API}/users/${username}`, { headers });
  const userData = userRes.data;

  // 2. Fetch public repositories
  const reposRes = await axios.get(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`, { headers });
  const repos = reposRes.data || [];

  // Calculate languages and stars
  const languages = {};
  let totalStars = 0;
  let totalForks = 0;

  for (const repo of repos) {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  }

  return {
    username: userData.login,
    name: userData.name,
    avatar: userData.avatar_url,
    bio: userData.bio,
    publicRepos: userData.public_repos,
    followers: userData.followers,
    following: userData.following,
    totalStars,
    totalForks,
    topLanguages: Object.entries(languages)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    repos: repos.slice(0, 10).map(r => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      language: r.language,
      updatedAt: r.updated_at,
    })),
    lastSyncedAt: new Date().toISOString(),
  };
}
```

### 4.2 Repository Import Flow (`backend/controllers/githubController.js`)

When a user selects repositories in the frontend modal, `importRepositories` transforms and persists them into the `Project` collection:

```javascript
export const importRepositories = async (req, res) => {
  try {
    const { repositories } = req.body; // Array of repo objects
    const userId = req.user._id;

    const importedProjects = [];
    for (const repo of repositories) {
      const existing = await Project.findOne({ userId, githubUrl: repo.html_url });
      if (!existing) {
        const newProj = await Project.create({
          userId,
          title: repo.name,
          description: repo.description || 'Imported from GitHub',
          githubUrl: repo.html_url,
          liveUrl: repo.homepage || '',
          technologies: repo.language ? [repo.language] : [],
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          isImported: true,
        });
        importedProjects.push(newProj);
      }
    }

    res.json({ message: 'Repositories imported successfully', projects: importedProjects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## 5. Frontend UI & Interaction

### Repository Picker Modal (`GithubRepoPickerModal.jsx`)
- Fetches all user repositories from `/api/github/repos`.
- Provides instant search/filter by repository name or language.
- Multi-select checkbox interface with commit and star indicators.
- Submits selected repositories to `/api/github/import-repos` and refreshes the project list.

### Universal Sync Integration
- Included in `syncOrchestrator.js` to refresh star counts, followers, and language statistics during one-click dashboard syncs.

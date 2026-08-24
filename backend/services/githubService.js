import axios from 'axios';

/**
 * Fetch GitHub user data using their personal access token (from OAuth).
 * Retrieves: repos, languages, recent commits, contribution stats.
 *
 * @param {string} username - GitHub username
 * @param {string} accessToken - GitHub OAuth access token
 * @returns {object} Aggregated GitHub data
 */
export async function fetchGitHubData(username, accessToken) {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' }
    : { Accept: 'application/vnd.github.v3+json' };

  const baseUrl = 'https://api.github.com';

  try {
    // Fetch user profile
    const userRes = await axios.get(`${baseUrl}/users/${username}`, { headers });
    const profile = userRes.data;

    // Fetch repos (up to 100, sorted by recently updated)
    const reposRes = await axios.get(`${baseUrl}/users/${username}/repos`, {
      headers,
      params: { sort: 'updated', per_page: 100, type: 'owner' },
    });
    const repos = reposRes.data;

    // Aggregate language usage across repos
    const languageCounts = {};
    for (const repo of repos.slice(0, 30)) {
      // Limit to 30 repos to avoid rate limiting
      try {
        const langRes = await axios.get(repo.languages_url, { headers });
        for (const [lang, bytes] of Object.entries(langRes.data)) {
          languageCounts[lang] = (languageCounts[lang] || 0) + bytes;
        }
      } catch {
        // Skip if language fetch fails for a repo
      }
    }

    // Sort languages by usage
    const topLanguages = Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, bytes]) => ({ name, bytes }));

    // Fetch recent events (commits, PRs, etc.)
    const eventsRes = await axios.get(`${baseUrl}/users/${username}/events`, {
      headers,
      params: { per_page: 50 },
    });
    const pushEvents = eventsRes.data
      .filter((e) => e.type === 'PushEvent')
      .slice(0, 20)
      .map((e) => ({
        repo: e.repo.name,
        commits: e.payload.commits?.length || 0,
        date: e.created_at,
      }));

    const totalCommitsRecent = pushEvents.reduce((sum, e) => sum + e.commits, 0);

    return {
      username: profile.login,
      name: profile.name,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      totalRepos: repos.length,
      topLanguages,
      recentPushEvents: pushEvents,
      totalCommitsRecent,
      stargazersTotal: repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0),
      forksTotal: repos.reduce((sum, r) => sum + (r.forks_count || 0), 0),
    };
  } catch (error) {
    console.error(`GitHub fetch error for ${username}:`, error.message);
    throw new Error(`Failed to fetch GitHub data: ${error.message}`);
  }
}

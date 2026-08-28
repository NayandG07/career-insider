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
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'CareerOS-App',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const baseUrl = 'https://api.github.com';

  try {
    // Fetch user profile and repos concurrently
    const [userRes, reposRes] = await Promise.all([
      axios.get(`${baseUrl}/users/${username}`, { headers, timeout: 8000 }),
      axios.get(`${baseUrl}/users/${username}/repos`, {
        headers,
        params: { sort: 'updated', per_page: 100, type: 'owner' },
        timeout: 8000,
      }),
    ]);

    const profile = userRes.data;
    const repos = Array.isArray(reposRes.data) ? reposRes.data : [];

    // Aggregate language usage across top 15 recently updated repos in parallel
    const languageCounts = {};
    const topRepos = repos.slice(0, 15);
    const langResults = await Promise.allSettled(
      topRepos.map((repo) =>
        repo.languages_url
          ? axios.get(repo.languages_url, { headers, timeout: 5000 }).then((r) => r.data)
          : Promise.resolve({})
      )
    );

    for (const res of langResults) {
      if (res.status === 'fulfilled' && res.value && typeof res.value === 'object') {
        for (const [lang, bytes] of Object.entries(res.value)) {
          if (typeof bytes === 'number') {
            languageCounts[lang] = (languageCounts[lang] || 0) + bytes;
          }
        }
      }
    }

    // Calculate total bytes and percentage per language
    const totalBytes = Object.values(languageCounts).reduce((a, b) => a + b, 0);
    const topLanguages = Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, bytes]) => {
        const pct = totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0;
        return {
          name,
          bytes,
          percentage: pct,
          count: `${pct}%`,
        };
      });

    // Fetch recent events (commits, PRs, etc.)
    let pushEvents = [];
    let totalCommitsRecent = 0;
    try {
      const eventsRes = await axios.get(`${baseUrl}/users/${username}/events`, {
        headers,
        params: { per_page: 30 },
        timeout: 5000,
      });
      if (Array.isArray(eventsRes.data)) {
        pushEvents = eventsRes.data
          .filter((e) => e.type === 'PushEvent')
          .slice(0, 20)
          .map((e) => ({
            repo: e.repo?.name || '',
            commits: e.payload?.commits?.length || 0,
            date: e.created_at,
          }));
        totalCommitsRecent = pushEvents.reduce((sum, e) => sum + e.commits, 0);
      }
    } catch {
      // Events are optional, ignore if failed
    }

    const stargazersTotal = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const forksTotal = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    return {
      username: profile.login,
      name: profile.name || profile.login,
      publicRepos: profile.public_repos || repos.length,
      followers: profile.followers || 0,
      following: profile.following || 0,
      totalRepos: repos.length,
      topLanguages,
      recentPushEvents: pushEvents,
      totalCommitsRecent,
      stargazersTotal,
      totalStars: stargazersTotal,
      forksTotal,
    };
  } catch (error) {
    console.error(`GitHub fetch error for ${username}:`, error.message);
    throw new Error(`Failed to fetch GitHub data: ${error.message}`);
  }
}

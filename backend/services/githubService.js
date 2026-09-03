import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes the GitHub contribution calendar for a specific user and year.
 * Returns { totalContributions, submissionCalendar }
 */
export async function fetchContributionsForYear(username, year) {
  try {
    const url = year
      ? `https://github.com/users/${username}/contributions?from=${year}-01-01&to=${year}-12-31`
      : `https://github.com/users/${username}/contributions`;

    const res = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 8000,
    });

    const $ = cheerio.load(res.data);
    const calendar = {};
    let totalContributions = 0;

    const h2Text = $('h2.f4').text().trim() || $('h2').first().text().trim();
    const countMatch = h2Text.match(/([\d,]+)\s+contributions?/i);
    if (countMatch) {
      totalContributions = parseInt(countMatch[1].replace(/,/g, ''), 10);
    }

    $('td.ContributionCalendar-day, td[data-date]').each((_, el) => {
      const date = $(el).attr('data-date');
      const level = $(el).attr('data-level');
      if (date) {
        const id = $(el).attr('id');
        let count = 0;
        if (id) {
          const toolTip = $(`tool-tip[for="${id}"]`).text().trim();
          const match = toolTip.match(/(\d+)\s+contribution/i);
          if (match) {
            count = parseInt(match[1], 10);
          }
        }
        if (count === 0 && level && level !== '0') {
          count = parseInt(level, 10);
        }
        calendar[date] = count;
      }
    });

    // If total wasn't in h2, sum up days
    if (!totalContributions) {
      totalContributions = Object.values(calendar).reduce((a, b) => a + (Number(b) || 0), 0);
    }

    return {
      totalContributions,
      submissionCalendar: calendar,
    };
  } catch (err) {
    console.warn(`Failed to scrape contributions for ${username} (${year}):`, err.message);
    return null;
  }
}

/**
 * Fetches yearwise contribution calendars using GitHub's GraphQL API.
 * Requires OAuth access token with read:user scope.
 */
export async function fetchContributionsGraphQL(username, token, years = [2026, 2025, 2024]) {
  if (!token) return null;
  try {
    const fields = years
      .map(
        (y) => `
      y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }`
      )
      .join('\n');

    const query = `
      query($username: String!) {
        user(login: $username) {
          ${fields}
        }
      }
    `;

    const res = await axios.post(
      'https://api.github.com/graphql',
      { query, variables: { username } },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'CareerOS-App',
        },
        timeout: 8000,
      }
    );

    if (res.data?.data?.user) {
      const result = {};
      const userData = res.data.data.user;
      years.forEach((y) => {
        const collection = userData[`y${y}`];
        if (collection?.contributionCalendar) {
          const cal = collection.contributionCalendar;
          const submissionCalendar = {};
          if (Array.isArray(cal.weeks)) {
            cal.weeks.forEach((w) => {
              if (Array.isArray(w.contributionDays)) {
                w.contributionDays.forEach((day) => {
                  if (day.date) {
                    submissionCalendar[day.date] = day.contributionCount || 0;
                  }
                });
              }
            });
          }
          result[y] = {
            totalContributions: cal.totalContributions || 0,
            submissionCalendar,
          };
        }
      });
      return result;
    }
  } catch (err) {
    console.warn('GitHub GraphQL contributions notice (will fallback to scraping):', err.message);
  }
  return null;
}

/**
 * Fetch GitHub user data using their personal access token (from OAuth) or public handle.
 * Retrieves: repos, languages, yearwise contributions, accurate stars, impact repos.
 *
 * @param {string} username - GitHub username
 * @param {string} accessToken - GitHub OAuth access token (optional)
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
        params: { sort: 'pushed', per_page: 100, type: 'all' },
        timeout: 8000,
      }),
    ]);

    const profile = userRes.data;
    const repos = Array.isArray(reposRes.data) ? reposRes.data : [];

    // Filter user's authored/owned repositories for accurate star calculation
    const ownedRepos = repos.filter((r) => !r.fork && r.owner?.login?.toLowerCase() === username.toLowerCase());
    const validRepos = ownedRepos.length > 0 ? ownedRepos : repos.filter((r) => !r.fork);
    
    // Accurate total stars across all user's authored non-fork repos
    const stargazersTotal = (validRepos.length > 0 ? validRepos : repos).reduce(
      (sum, r) => sum + (r.stargazers_count || 0),
      0
    );
    const forksTotal = (validRepos.length > 0 ? validRepos : repos).reduce(
      (sum, r) => sum + (r.forks_count || 0),
      0
    );

    // Aggregate language usage across top 15 recently updated repos in parallel
    const languageCounts = {};
    const topReposForLangs = (validRepos.length > 0 ? validRepos : repos).slice(0, 15);
    const langResults = await Promise.allSettled(
      topReposForLangs.map((repo) =>
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

    // Determine available contribution years (current year, current-1, current-2)
    const currentYear = new Date().getFullYear();
    const contributionYears = [currentYear, currentYear - 1, currentYear - 2];

    // Fetch yearwise contribution calendars via GraphQL when token exists, or scraping fallback
    let yearlyContributions = {};
    if (token) {
      const gqlData = await fetchContributionsGraphQL(username, token, contributionYears);
      if (gqlData && Object.keys(gqlData).length > 0) {
        yearlyContributions = gqlData;
      }
    }

    // Fallback to per-year scraping if GraphQL didn't populate all years
    if (Object.keys(yearlyContributions).length === 0) {
      const contribResults = await Promise.allSettled(
        contributionYears.map((year) => fetchContributionsForYear(username, year))
      );

      contribResults.forEach((res, idx) => {
        const yr = contributionYears[idx];
        if (res.status === 'fulfilled' && res.value) {
          yearlyContributions[yr] = res.value;
        }
      });
    }

    const currentYearData = yearlyContributions[currentYear] || { totalContributions: 0, submissionCalendar: {} };

    // Format top starred repos and recent active repos
    const topStarredRepos = [...(validRepos.length > 0 ? validRepos : repos)]
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 6)
      .map((r) => ({
        name: r.name,
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        url: r.html_url,
        language: r.language || 'Code',
        description: r.description || '',
        updatedAt: r.pushed_at || r.updated_at,
      }));

    const recentRepos = [...repos]
      .sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at))
      .slice(0, 6)
      .map((r) => ({
        name: r.name,
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        url: r.html_url,
        language: r.language || 'Code',
        description: r.description || '',
        updatedAt: r.pushed_at || r.updated_at,
      }));

    // Fetch recent commit history for the user
    let recentCommits = [];
    try {
      const commitSearchRes = await axios.get(
        `${baseUrl}/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=15`,
        {
          headers: {
            ...headers,
            Accept: 'application/vnd.github.cloak-preview+json',
          },
          timeout: 6000,
        }
      );
      if (commitSearchRes.data?.items && Array.isArray(commitSearchRes.data.items) && commitSearchRes.data.items.length > 0) {
        recentCommits = commitSearchRes.data.items.slice(0, 12).map((item) => ({
          repo: item.repository?.name || (item.repository?.full_name || '').split('/')[1] || '',
          fullRepo: item.repository?.full_name || '',
          message: (item.commit?.message || '').split('\n')[0],
          date: item.commit?.author?.date || item.commit?.committer?.date,
          sha: (item.sha || '').slice(0, 7),
          url: item.html_url,
        }));
      }
    } catch {}

    // If search returned empty or failed, fetch latest commit from each of user's active repos
    if (recentCommits.length === 0 && Array.isArray(repos) && repos.length > 0) {
      try {
        const top10Repos = repos.slice(0, 10);
        const repoCommitResults = await Promise.allSettled(
          top10Repos.map((r) =>
            axios.get(`${baseUrl}/repos/${r.full_name || `${username}/${r.name}`}/commits?per_page=1`, {
              headers,
              timeout: 4000,
            })
          )
        );
        for (let i = 0; i < repoCommitResults.length; i++) {
          const res = repoCommitResults[i];
          const r = top5Repos[i];
          if (res.status === 'fulfilled' && Array.isArray(res.value?.data) && res.value.data.length > 0) {
            const c = res.value.data[0];
            recentCommits.push({
              repo: r.name,
              fullRepo: r.full_name || `${username}/${r.name}`,
              message: (c.commit?.message || '').split('\n')[0],
              date: c.commit?.author?.date || c.commit?.committer?.date,
              sha: (c.sha || '').slice(0, 7),
              url: c.html_url || `https://github.com/${r.full_name || `${username}/${r.name}`}/commit/${c.sha}`,
            });
          }
        }
      } catch {}
    }

    return {
      username: profile.login,
      name: profile.name || profile.login,
      avatarUrl: profile.avatar_url,
      bio: profile.bio || '',
      publicRepos: profile.public_repos || repos.length,
      followers: profile.followers || 0,
      following: profile.following || 0,
      totalRepos: repos.length,
      topLanguages,
      topStarredRepos,
      recentRepos,
      recentCommits,
      contributionYears,
      yearlyContributions,
      submissionCalendar: currentYearData.submissionCalendar,
      totalCommitsRecent: currentYearData.totalContributions,
      totalContributions: currentYearData.totalContributions,
      stargazersTotal,
      totalStars: stargazersTotal,
      forksTotal,
    };
  } catch (error) {
    console.error(`GitHub fetch error for ${username}:`, error.message);
    throw new Error(`Failed to fetch GitHub data: ${error.message}`);
  }
}

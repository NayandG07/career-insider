import dns from 'node:dns';

// Ensure Node prioritizes reachable IPv4 addresses over hanging IPv6 routes on Windows/ISPs
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BASE_URLS = [
  'https://codeforces.com/api',
  'https://mirror.codeforces.com/api',
];

/**
 * Perform a resilient GET request to Codeforces API with mirror fallback.
 */
async function fetchCodeforcesAPI(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  let lastError = null;

  for (const base of BASE_URLS) {
    const url = `${base}/${endpoint}${queryString ? `?${queryString}` : ''}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CareerOS/1.0 (Student Internship Project)',
        },
        signal: AbortSignal.timeout(8000),
      });

      const data = await response.json();

      if (data.status === 'OK') {
        return data.result;
      }

      if (data.status === 'FAILED') {
        const comment = data.comment || 'Codeforces API error';
        if (comment.toLowerCase().includes('not found')) {
          throw new Error(`NOT_FOUND: ${comment}`);
        }
        throw new Error(`API_FAILED: ${comment}`);
      }
    } catch (err) {
      if (err.message.startsWith('NOT_FOUND:')) {
        throw err; // Do not retry mirror if user is genuinely not found
      }
      lastError = err;
      console.warn(`Codeforces request failed on ${base}/${endpoint}:`, err.message);
    }
  }

  throw lastError || new Error('Unable to reach Codeforces API.');
}

/**
 * Fetch and normalize Codeforces public profile data.
 *
 * @param {string} rawHandle - Codeforces handle
 * @returns {object} Normalized Codeforces profile data
 */
export async function fetchCodeforcesData(rawHandle) {
  const handle = rawHandle.trim().replace(/^@/, '');

  if (!handle) {
    throw new Error('Codeforces handle is required.');
  }

  // 1. Mandatory Step: Fetch user.info
  let users;
  try {
    users = await fetchCodeforcesAPI('user.info', { handles: handle });
  } catch (err) {
    if (err.message.includes('NOT_FOUND') || err.message.toLowerCase().includes('not found')) {
      throw new Error(`Codeforces user '${handle}' not found.`);
    }
    if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
      throw new Error('Codeforces request timed out. Please check your network connection.');
    }
    throw new Error(err.message || 'Unable to connect to Codeforces right now.');
  }

  if (!users || !users.length) {
    throw new Error(`Codeforces user '${handle}' not found.`);
  }

  const user = users[0];

  // Respect rate limits with a small sequential delay
  await delay(250);

  // 2. Optional Step: Fetch rating history (gracefully handled if unavailable)
  let ratingHistory = [];
  try {
    const rawRatings = await fetchCodeforcesAPI('user.rating', { handle });
    if (Array.isArray(rawRatings)) {
      ratingHistory = rawRatings.map((r) => ({
        contestId: r.contestId,
        contestName: r.contestName,
        oldRating: r.oldRating,
        newRating: r.newRating,
        rank: r.rank,
        timestamp: r.ratingUpdateTimeSeconds * 1000,
      }));
    }
  } catch (err) {
    console.warn(`Codeforces rating history skipped for ${handle}:`, err.message);
  }

  // Respect rate limits with a small sequential delay
  await delay(250);

  // 3. Optional Step: Fetch recent submissions (last 50)
  let recentSubmissions = [];
  let uniqueProblemsSolved = 0;
  const topTagsMap = {};

  try {
    const rawSubs = await fetchCodeforcesAPI('user.status', { handle, from: 1, count: 50 });
    if (Array.isArray(rawSubs)) {
      const acceptedSet = new Set();

      recentSubmissions = rawSubs.slice(0, 15).map((s) => ({
        id: s.id,
        problemName: s.problem?.name || 'Problem',
        contestId: s.problem?.contestId,
        index: s.problem?.index,
        verdict: s.verdict || 'UNKNOWN',
        programmingLanguage: s.programmingLanguage || '',
        passedTestCount: s.passedTestCount || 0,
        timestamp: s.creationTimeSeconds * 1000,
      }));

      for (const sub of rawSubs) {
        if (sub.verdict === 'OK' && sub.problem) {
          const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
          acceptedSet.add(problemKey);
          for (const tag of sub.problem.tags || []) {
            topTagsMap[tag] = (topTagsMap[tag] || 0) + 1;
          }
        }
      }

      uniqueProblemsSolved = acceptedSet.size;
    }
  } catch (err) {
    console.warn(`Codeforces submissions skipped for ${handle}:`, err.message);
  }

  const topTags = Object.entries(topTagsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  return {
    handle: user.handle,
    rating: user.rating ?? null,
    maxRating: user.maxRating ?? null,
    rank: user.rank ?? 'unrated',
    maxRank: user.maxRank ?? 'unrated',
    country: user.country ?? null,
    city: user.city ?? null,
    organization: user.organization ?? null,
    avatar: user.titlePhoto || user.avatar || null,
    contestCount: ratingHistory.length,
    solvedCount: uniqueProblemsSolved,
    ratingHistory: ratingHistory.slice(-15),
    recentSubmissions,
    topTags,
    lastSyncedAt: new Date().toISOString(),
  };
}

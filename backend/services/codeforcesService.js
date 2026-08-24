import axios from 'axios';

/**
 * Fetch Codeforces user data via their public REST API.
 * No API key required.
 *
 * @param {string} handle - Codeforces handle
 * @returns {object} Aggregated Codeforces data
 */
export async function fetchCodeforcesData(handle) {
  const BASE = 'https://codeforces.com/api';

  try {
    // Fetch user info
    const infoRes = await axios.get(`${BASE}/user.info`, {
      params: { handles: handle },
    });

    if (infoRes.data.status !== 'OK' || !infoRes.data.result?.length) {
      throw new Error(`Codeforces user '${handle}' not found.`);
    }

    const user = infoRes.data.result[0];

    // Fetch rating history
    const ratingRes = await axios.get(`${BASE}/user.rating`, {
      params: { handle },
    });

    const ratingHistory = (ratingRes.data.result || []).map((r) => ({
      contestId: r.contestId,
      contestName: r.contestName,
      oldRating: r.oldRating,
      newRating: r.newRating,
      rank: r.rank,
      date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString(),
    }));

    // Fetch recent submissions (last 50)
    const subsRes = await axios.get(`${BASE}/user.status`, {
      params: { handle, from: 1, count: 50 },
    });

    const submissions = subsRes.data.result || [];
    const acceptedProblems = new Set();
    const tagCounts = {};

    for (const sub of submissions) {
      if (sub.verdict === 'OK') {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        acceptedProblems.add(key);
        for (const tag of sub.problem.tags || []) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
    }

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      handle: user.handle,
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'unrated',
      maxRank: user.maxRank || 'unrated',
      contestsParticipated: ratingHistory.length,
      recentRatingHistory: ratingHistory.slice(-10),
      uniqueProblemsSolvedRecent: acceptedProblems.size,
      topTags,
    };
  } catch (error) {
    console.error(`Codeforces fetch error for ${handle}:`, error.message);
    throw new Error(`Failed to fetch Codeforces data: ${error.message}`);
  }
}

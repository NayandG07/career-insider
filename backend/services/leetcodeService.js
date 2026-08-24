import axios from 'axios';

/**
 * Fetch LeetCode user data via their unofficial GraphQL API.
 * No API key required — public endpoint.
 *
 * @param {string} username - LeetCode username
 * @returns {object} Aggregated LeetCode data
 */
export async function fetchLeetCodeData(username) {
  const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
          starRating
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        tagProblemCounts {
          advanced {
            tagName
            problemsSolved
          }
          intermediate {
            tagName
            problemsSolved
          }
          fundamental {
            tagName
            problemsSolved
          }
        }
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        topPercentage
      }
      recentAcSubmissionList(username: $username, limit: 10) {
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const res = await axios.post(
      LEETCODE_GRAPHQL,
      { query, variables: { username } },
      {
        headers: {
          'Content-Type': 'application/json',
          Referer: `https://leetcode.com/${username}/`,
        },
      }
    );

    const data = res.data?.data;
    if (!data?.matchedUser) {
      throw new Error(`LeetCode user '${username}' not found.`);
    }

    const user = data.matchedUser;
    const contest = data.userContestRanking;
    const recentSubs = data.recentAcSubmissionList || [];

    // Parse solved counts by difficulty
    const solvedByDifficulty = {};
    for (const item of user.submitStatsGlobal?.acSubmissionNum || []) {
      solvedByDifficulty[item.difficulty] = item.count;
    }

    // Parse top topic tags
    const topicTags = [];
    for (const level of ['fundamental', 'intermediate', 'advanced']) {
      for (const tag of user.tagProblemCounts?.[level] || []) {
        topicTags.push({ tag: tag.tagName, solved: tag.problemsSolved, level });
      }
    }
    topicTags.sort((a, b) => b.solved - a.solved);

    return {
      username: user.username,
      ranking: user.profile?.ranking || null,
      reputation: user.profile?.reputation || 0,
      totalSolved: solvedByDifficulty['All'] || 0,
      easySolved: solvedByDifficulty['Easy'] || 0,
      mediumSolved: solvedByDifficulty['Medium'] || 0,
      hardSolved: solvedByDifficulty['Hard'] || 0,
      contestRating: contest?.rating ? Math.round(contest.rating) : null,
      contestsAttended: contest?.attendedContestsCount || 0,
      contestGlobalRanking: contest?.globalRanking || null,
      contestTopPercentage: contest?.topPercentage || null,
      topTopicTags: topicTags.slice(0, 15),
      recentSubmissions: recentSubs.map((s) => ({
        title: s.title,
        slug: s.titleSlug,
        timestamp: s.timestamp,
      })),
    };
  } catch (error) {
    console.error(`LeetCode fetch error for ${username}:`, error.message);
    throw new Error(`Failed to fetch LeetCode data: ${error.message}`);
  }
}

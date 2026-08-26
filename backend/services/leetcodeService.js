import axios from 'axios';

/**
 * Fetch rich LeetCode user data via public GraphQL API.
 * No API key or authentication required for public profile metrics.
 *
 * @param {string} rawUsername - LeetCode username
 * @returns {object} Normalized comprehensive LeetCode profile data
 */
export async function fetchLeetCodeData(rawUsername) {
  const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';
  const username = rawUsername.trim().replace(/^@/, '');

  if (!username) {
    throw new Error('LeetCode username is required.');
  }

  const query = `
    query getUserFullProfile($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
          starRating
          userAvatar
          aboutMe
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        languageProblemCount {
          languageName
          problemsSolved
        }
        badges {
          id
          displayName
          icon
          creationDate
        }
        submissionCalendar
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
      userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        contest {
          title
          startTime
        }
      }
      recentAcSubmissionList(username: $username, limit: 15) {
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: `https://leetcode.com/${username}/`,
        },
        timeout: 10000,
      }
    );

    const data = res.data?.data;
    if (!data?.matchedUser) {
      throw new Error(`LeetCode user '${username}' not found.`);
    }

    const user = data.matchedUser;
    const contest = data.userContestRanking;
    const contestHistory = (data.userContestRankingHistory || []).filter((h) => h.attended);
    const recentSubs = data.recentAcSubmissionList || [];

    // Total question counts across platform
    const totalQuestionsByDifficulty = { All: 0, Easy: 0, Medium: 0, Hard: 0 };
    for (const q of data.allQuestionsCount || []) {
      if (q.difficulty in totalQuestionsByDifficulty) {
        totalQuestionsByDifficulty[q.difficulty] = q.count || 0;
      }
    }

    // 1. Parse solved counts by difficulty
    const solvedByDifficulty = { All: 0, Easy: 0, Medium: 0, Hard: 0 };
    const submissionsByDifficulty = { All: 0, Easy: 0, Medium: 0, Hard: 0 };

    for (const item of user.submitStatsGlobal?.acSubmissionNum || []) {
      if (item.difficulty in solvedByDifficulty) {
        solvedByDifficulty[item.difficulty] = item.count || 0;
        submissionsByDifficulty[item.difficulty] = item.submissions || 0;
      }
    }

    // Acceptance rate
    const acceptanceRate = submissionsByDifficulty.All > 0
      ? ((solvedByDifficulty.All / submissionsByDifficulty.All) * 100).toFixed(1)
      : null;

    // 2. Language Statistics
    const languageStats = (user.languageProblemCount || [])
      .sort((a, b) => b.problemsSolved - a.problemsSolved);

    // 3. Topic Tags & Skills (Grouped by Level)
    const skillsByLevel = {
      advanced: (user.tagProblemCounts?.advanced || []).sort((a, b) => b.problemsSolved - a.problemsSolved),
      intermediate: (user.tagProblemCounts?.intermediate || []).sort((a, b) => b.problemsSolved - a.problemsSolved),
      fundamental: (user.tagProblemCounts?.fundamental || []).sort((a, b) => b.problemsSolved - a.problemsSolved),
    };

    const topicTags = [];
    for (const level of ['fundamental', 'intermediate', 'advanced']) {
      for (const tag of user.tagProblemCounts?.[level] || []) {
        topicTags.push({ tag: tag.tagName, solved: tag.problemsSolved, level });
      }
    }
    topicTags.sort((a, b) => b.solved - a.solved);

    // 4. Badges
    const badges = (user.badges || []).map((b) => ({
      id: b.id,
      displayName: b.displayName,
      icon: b.icon?.startsWith('http') ? b.icon : `https://leetcode.com${b.icon || ''}`,
      creationDate: b.creationDate,
    }));

    // 5. Submission Calendar / Heatmap (parsed JSON map of timestamp -> count)
    let submissionCalendar = {};
    let totalPastYearSubmissions = 0;
    let totalActiveDays = 0;

    if (user.submissionCalendar) {
      try {
        submissionCalendar = JSON.parse(user.submissionCalendar);
        const counts = Object.values(submissionCalendar);
        totalPastYearSubmissions = counts.reduce((sum, c) => sum + (Number(c) || 0), 0);
        totalActiveDays = counts.filter((c) => Number(c) > 0).length;
      } catch {
        submissionCalendar = {};
      }
    }

    return {
      username: user.username,
      avatar: user.profile?.userAvatar || null,
      ranking: user.profile?.ranking || null,
      reputation: user.profile?.reputation || 0,
      starRating: user.profile?.starRating || 0,
      
      // Problems solved breakdown
      totalSolved: solvedByDifficulty.All,
      easySolved: solvedByDifficulty.Easy,
      mediumSolved: solvedByDifficulty.Medium,
      hardSolved: solvedByDifficulty.Hard,
      
      // Total available questions
      totalQuestions: totalQuestionsByDifficulty.All || 0,
      easyTotalQuestions: totalQuestionsByDifficulty.Easy || 0,
      mediumTotalQuestions: totalQuestionsByDifficulty.Medium || 0,
      hardTotalQuestions: totalQuestionsByDifficulty.Hard || 0,

      acceptanceRate,

      // Activity metrics
      totalPastYearSubmissions,
      totalActiveDays,

      // Contest rating & ranking
      contestRating: contest?.rating ? Math.round(contest.rating) : null,
      contestsAttended: contest?.attendedContestsCount || 0,
      contestGlobalRanking: contest?.globalRanking || null,
      contestTopPercentage: contest?.topPercentage ? Number(contest.topPercentage.toFixed(2)) : null,
      contestHistory: contestHistory.slice(-10).map((c) => ({
        title: c.contest?.title || 'Contest',
        rating: Math.round(c.rating || 0),
        ranking: c.ranking || 0,
        timestamp: (c.contest?.startTime || 0) * 1000,
      })),

      // Languages & Topics
      languageStats: languageStats.slice(0, 8),
      skillsByLevel,
      topTopicTags: topicTags.slice(0, 15),
      badges,
      submissionCalendar,

      // Recent Submissions
      recentSubmissions: recentSubs.map((s) => ({
        title: s.title,
        slug: s.titleSlug,
        timestamp: Number(s.timestamp) * 1000,
      })),
      
      lastSyncedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('not found') || error.message.includes('not found')) {
      throw new Error(`LeetCode user '${username}' not found.`);
    }
    console.error(`LeetCode fetch error for ${username}:`, error.message);
    throw new Error(error.message || 'Failed to fetch LeetCode data.');
  }
}

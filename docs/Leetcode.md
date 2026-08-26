# LeetCode Integration Documentation — CareerOS

## 1. Overview & Architecture

The LeetCode integration connects a developer's algorithmic problem-solving profile into CareerOS. It retrieves verified total solves (Easy, Medium, Hard), global rankings, language distributions, earned badges, topic skill tags, and the past-year submission calendar heatmap.

```
┌──────────────────────────────────────────────────────────┐
│                   CareerOS Client                        │
│  (Profile Showcase • Dashboard • LeetCodeHeatmap.jsx)   │
└────────────────────────────┬─────────────────────────────┘
                             │ 1. Connect @handle / Sync
                             ▼
┌──────────────────────────────────────────────────────────┐
│                 Express Backend Service                  │
│       (/api/leetcode • leetcodeService.js)               │
└────────────────────────────┬─────────────────────────────┘
                             │ 2. Single Anonymous POST Request
                             ▼
┌──────────────────────────────────────────────────────────┐
│              LeetCode Public GraphQL API                 │
│              (https://leetcode.com/graphql)              │
└────────────────────────────┬─────────────────────────────┘
                             │ 3. Normalized Telemetry
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   MongoDB Database                       │
│    (Telemetry Collection: { source: 'leetcode' })        │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure & File Map

| File Path | Layer | Primary Responsibility |
|---|---|---|
| `backend/routes/leetcodeRoutes.js` | Routing | Exposes `/api/leetcode` (GET profile, POST connect, POST sync, DELETE disconnect). |
| `backend/controllers/leetcodeController.js` | Controller | Validates user session, invokes service, persists to `Telemetry` and updates `User.connectedSources.leetcode`. |
| `backend/services/leetcodeService.js` | Service / GraphQL Engine | Executes the unified GraphQL query against LeetCode, parses difficulties, languages, badges, submission calendars, and topic tags. |
| `backend/models/Telemetry.js` | Model | Stores normalized LeetCode metrics and the `submissionCalendar` map. |
| `frontend/src/services/leetcodeService.js` | Client Service | Frontend Axios wrapper for `/api/leetcode`. |
| `frontend/src/components/LeetCodeHeatmap.jsx` | Component | Renders the 52-week activity calendar grid, streak counters, active days, and hover tooltips. |
| `frontend/src/pages/Settings.jsx` | Page | Connection card with real-time solve counts, rank display, and disconnect actions. |
| `frontend/src/pages/Profile.jsx` | Page | Full algorithmic showcase: Easy/Med/Hard progress bars, badge icons, skill tags, recent AC list, and heatmap. |

---

## 3. Data Acquisition & Terms Compliance

### Acquisition Protocol
- **Endpoint**: `https://leetcode.com/graphql`
- **HTTP Method**: Anonymous `POST` with JSON payload.
- **Authentication / Secrets**: **None required**. LeetCode's public GraphQL endpoint allows anonymous queries for public profile telemetry.
- **No Scraping**: No HTML parsing, headless browsers, or cookie spoofing.

---

## 4. GraphQL Query & Data Extraction Logic

### 4.1 The Unified GraphQL Query (`backend/services/leetcodeService.js`)

A single request extracts all necessary platform telemetry:

```graphql
query getUserProfile($username: String!) {
  allQuestionsCount {
    difficulty
    count
  }
  matchedUser(username: $username) {
    username
    profile {
      ranking
      userAvatar
      realName
      aboutMe
      reputation
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
        tagSlug
        problemsSolved
      }
      intermediate {
        tagName
        tagSlug
        problemsSolved
      }
      fundamental {
        tagName
        tagSlug
        problemsSolved
      }
    }
  }
  recentAcSubmissionList(username: $username, limit: 10) {
    id
    title
    titleSlug
    timestamp
  }
}
```

### 4.2 Normalization Pipeline

```javascript
export async function fetchLeetCodeData(username) {
  const cleanUsername = username.trim().replace(/^@/, '');
  const response = await axios.post(
    'https://leetcode.com/graphql',
    {
      query: LEETCODE_GRAPHQL_QUERY,
      variables: { username: cleanUsername },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://leetcode.com',
      },
      timeout: 12000,
    }
  );

  const data = response.data?.data;
  const user = data?.matchedUser;
  if (!user) throw new Error(`LeetCode user "${cleanUsername}" not found.`);

  // Parse total platform questions
  let totalQuestions = 0, easyTotalQuestions = 0, mediumTotalQuestions = 0, hardTotalQuestions = 0;
  if (Array.isArray(data.allQuestionsCount)) {
    for (const q of data.allQuestionsCount) {
      if (q.difficulty === 'All') totalQuestions = q.count;
      if (q.difficulty === 'Easy') easyTotalQuestions = q.count;
      if (q.difficulty === 'Medium') mediumTotalQuestions = q.count;
      if (q.difficulty === 'Hard') hardTotalQuestions = q.count;
    }
  }

  // Parse solved counts
  let totalSolved = 0, easySolved = 0, mediumSolved = 0, hardSolved = 0;
  const acList = user.submitStatsGlobal?.acSubmissionNum || [];
  for (const ac of acList) {
    if (ac.difficulty === 'All') totalSolved = ac.count;
    if (ac.difficulty === 'Easy') easySolved = ac.count;
    if (ac.difficulty === 'Medium') mediumSolved = ac.count;
    if (ac.difficulty === 'Hard') hardSolved = ac.count;
  }

  // Parse submission calendar JSON
  let submissionCalendar = {};
  let totalPastYearSubmissions = 0;
  let totalActiveDays = 0;
  if (user.submissionCalendar) {
    try {
      submissionCalendar = typeof user.submissionCalendar === 'string'
        ? JSON.parse(user.submissionCalendar)
        : user.submissionCalendar;
      const counts = Object.values(submissionCalendar);
      totalPastYearSubmissions = counts.reduce((sum, c) => sum + (Number(c) || 0), 0);
      totalActiveDays = counts.filter(c => Number(c) > 0).length;
    } catch {
      submissionCalendar = {};
    }
  }

  return {
    username: user.username,
    ranking: user.profile?.ranking || 0,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    totalQuestions,
    easyTotalQuestions,
    mediumTotalQuestions,
    hardTotalQuestions,
    submissionCalendar,
    totalPastYearSubmissions,
    totalActiveDays,
    badges: user.badges || [],
    languageStats: user.languageProblemCount || [],
    skillsByLevel: user.tagProblemCounts || { advanced: [], intermediate: [], fundamental: [] },
    recentSubmissions: (data.recentAcSubmissionList || []).map(s => ({
      id: s.id,
      title: s.title,
      slug: s.titleSlug,
      timestamp: s.timestamp,
    })),
    lastSyncedAt: new Date().toISOString(),
  };
}
```

---

## 5. Heatmap Generation Algorithm (`LeetCodeHeatmap.jsx`)

1. **UTC Day Key Normalization**:
   LeetCode stores activity timestamps in UTC seconds (`"1760572800": 3`). The frontend transforms this into `YYYY-MM-DD` maps using `d.getUTCFullYear()`, `d.getUTCMonth()`, `d.getUTCDate()` to prevent local browser timezone drift.
2. **52-Week Contribution Matrix**:
   Calculates a 52×7 grid starting 364 days ago and ending on the current week's alignment.
3. **Dynamic Streaks Calculation**:
   - Scans backward from today to compute the **Current Active Streak**.
   - Scans forward through all 364 days to determine the **Max Consecutive Day Streak**.
4. **Color Intensity Thresholds**:
   - `0 submissions`: `#F3F4F6` (Slate 100)
   - `1-2 submissions`: Emerald 200
   - `3-4 submissions`: Emerald 400
   - `5+ submissions`: Emerald 600

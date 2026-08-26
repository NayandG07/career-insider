# Codeforces Integration Documentation — CareerOS

## 1. Overview & Architecture

The Codeforces integration imports competitive programming telemetry from Codeforces into CareerOS. It tracks current contest rating, maximum all-time rating, tier rank, total contests participated, and recent accepted contest submissions.

```
┌──────────────────────────────────────────────────────────┐
│                   CareerOS Client                        │
│           (Settings • Profile • Dashboard)               │
└────────────────────────────┬─────────────────────────────┘
                             │ 1. Connect Handle / Sync
                             ▼
┌──────────────────────────────────────────────────────────┐
│                 Express Backend Service                  │
│       (/api/codeforces • codeforcesService.js)           │
└────────────────────────────┬─────────────────────────────┘
                             │ 2. Anonymous REST Queries
                             ▼
┌──────────────────────────────────────────────────────────┐
│                 Codeforces Public API                    │
│     (user.info • user.rating • user.status)              │
└────────────────────────────┬─────────────────────────────┘
                             │ 3. Normalized Telemetry
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   MongoDB Database                       │
│   (Telemetry Collection: { source: 'codeforces' })       │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure & File Map

| File Path | Layer | Primary Responsibility |
|---|---|---|
| `backend/routes/codeforcesRoutes.js` | Routing | Exposes `/api/codeforces` (GET profile, POST connect, POST sync, DELETE disconnect). |
| `backend/controllers/codeforcesController.js` | Controller | Validates user authorization, coordinates fetch with service, saves to `Telemetry` and updates `User.connectedSources.codeforces`. |
| `backend/services/codeforcesService.js` | Service / API Client | Communicates with Codeforces endpoints (`https://codeforces.com/api`), filters accepted submissions, and aggregates contest history. |
| `backend/models/Telemetry.js` | Model | Stores normalized rating, ranks, contest counts, and recent solved problems. |
| `frontend/src/services/codeforcesService.js` | Client Service | Frontend Axios wrapper for `/api/codeforces`. |
| `frontend/src/pages/Settings.jsx` | Page | Codeforces connect dialog with instant rating preview and disconnect confirmation modal. |
| `frontend/src/pages/Profile.jsx` | Page | Renders the Codeforces Competitive Profile card with rating badges and solved problem pills. |
| `frontend/src/pages/Dashboard.jsx` | Page | Grouped source status card displaying live rating and contest metrics. |

---

## 3. Data Acquisition & Protocol

### Acquisition Protocol
- **Base URL**: `https://codeforces.com/api`
- **Method**: Public REST API (Anonymous `GET` requests).
- **Authentication**: **None required**. Codeforces provides public access to user statistics without OAuth or API keys.
- **Endpoints Used**:
  1. `GET /api/user.info?handles={handle}`: Current rating, max rating, rank, avatar, and registration date.
  2. `GET /api/user.rating?handle={handle}`: History of all official contests participated and rank changes.
  3. `GET /api/user.status?handle={handle}&from=1&count=20`: Recent submissions to extract verified accepted (`OK` verdict) solutions.

---

## 4. Backend Implementation & Logic

### 4.1 Codeforces API Service (`backend/services/codeforcesService.js`)

```javascript
import axios from 'axios';

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

export async function fetchCodeforcesData(handle) {
  const cleanHandle = handle.trim().replace(/^@/, '');

  // 1. Fetch user general information
  const infoRes = await axios.get(`${CODEFORCES_API_BASE}/user.info`, {
    params: { handles: cleanHandle },
    timeout: 10000,
  });

  if (infoRes.data.status !== 'OK' || !infoRes.data.result?.length) {
    throw new Error(`Codeforces handle "${cleanHandle}" not found.`);
  }

  const userInfo = infoRes.data.result[0];

  // 2. Fetch contest rating history
  let ratingHistory = [];
  try {
    const ratingRes = await axios.get(`${CODEFORCES_API_BASE}/user.rating`, {
      params: { handle: cleanHandle },
      timeout: 10000,
    });
    if (ratingRes.data.status === 'OK') {
      ratingHistory = ratingRes.data.result || [];
    }
  } catch (err) {
    console.warn(`Could not fetch rating history for ${cleanHandle}:`, err.message);
  }

  // 3. Fetch recent submissions to identify accepted solves
  let recentSubmissions = [];
  try {
    const statusRes = await axios.get(`${CODEFORCES_API_BASE}/user.status`, {
      params: { handle: cleanHandle, from: 1, count: 20 },
      timeout: 10000,
    });
    if (statusRes.data.status === 'OK' && Array.isArray(statusRes.data.result)) {
      recentSubmissions = statusRes.data.result
        .filter((sub) => sub.verdict === 'OK')
        .map((sub) => ({
          id: sub.id,
          problemName: sub.problem?.name || `Problem ${sub.problem?.index}`,
          contestId: sub.contestId,
          index: sub.problem?.index,
          rating: sub.problem?.rating || null,
          tags: sub.problem?.tags || [],
          programmingLanguage: sub.programmingLanguage,
          creationTimeSeconds: sub.creationTimeSeconds,
        }));
    }
  } catch (err) {
    console.warn(`Could not fetch submissions for ${cleanHandle}:`, err.message);
  }

  return {
    handle: userInfo.handle,
    rating: userInfo.rating || 0,
    maxRating: userInfo.maxRating || 0,
    rank: userInfo.rank || 'unrated',
    maxRank: userInfo.maxRank || 'unrated',
    avatar: userInfo.titlePhoto || userInfo.avatar || '',
    contribution: userInfo.contribution || 0,
    friendOfCount: userInfo.friendOfCount || 0,
    contestCount: ratingHistory.length,
    recentSubmissions: recentSubmissions.slice(0, 10),
    ratingHistory: ratingHistory.slice(-10),
    lastSyncedAt: new Date().toISOString(),
  };
}
```

### 4.2 Controller Logic (`backend/controllers/codeforcesController.js`)

```javascript
export const connectCodeforces = async (req, res) => {
  try {
    const { handle } = req.body;
    if (!handle) return res.status(400).json({ error: 'Codeforces handle is required.' });

    const cleanHandle = handle.trim().replace(/^@/, '');
    const data = await fetchCodeforcesData(cleanHandle);

    const telemetry = await Telemetry.findOneAndUpdate(
      { userId: req.user._id, source: 'codeforces' },
      { data, fetchedAt: new Date() },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(req.user._id, {
      'connectedSources.codeforces': cleanHandle,
      lastSyncedAt: new Date(),
    });

    res.json({
      message: 'Codeforces connected successfully.',
      connected: true,
      data: telemetry.data,
      lastSyncedAt: telemetry.fetchedAt,
    });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to connect Codeforces handle.' });
  }
};
```

---

## 5. Multi-User Isolation & Security

- **Isolation Guarantee**: All Codeforces telemetry records are queried with `{ userId: req.user._id, source: 'codeforces' }`. User A and User B cannot read or overwrite each other's competitive programming profiles.
- **Safety**: No sensitive credentials or passwords are ever stored or requested from users.
- **Universal Sync**: Integrated into `backend/services/syncOrchestrator.js` for one-click background synchronization.

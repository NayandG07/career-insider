# CareerOS — Full-Stack Backend & AI Architecture Plan (v2)

> All user feedback from v1 has been resolved and incorporated below.

---

## 🔒 Immutable Design Constraint

> [!CAUTION]
> **The existing frontend design — including all colors, typography, card styles, spacing, and the Tailwind/MUI configuration — must NOT be changed.** The only frontend work permitted in this phase is:
> 1. **Responsiveness optimization** across screen sizes (mobile, tablet, desktop, ultrawide) — preventing elements from appearing "overly gigantic" on large screens.
> 2. Wiring up static data to live API responses.
> 3. Adding an **Admin Panel** page (new page, consistent design language).

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────┐
│                    React Frontend (existing)               │
│      (Design preserved. Responsiveness optimized.)         │
└───────────────┬───────────────────────────────────────────┘
                │ HTTP/REST
┌───────────────▼───────────────────────────────────────────┐
│          Node.js / Express — Primary Backend               │
│  Auth │ User CRUD │ File Uploads │ Data Sync Jobs          │
│  Admin API │ AI Proxy Gateway                              │
└───────┬──────────────────────────────────┬────────────────┘
        │ Mongoose                          │ HTTP (internal)
┌───────▼──────────┐            ┌──────────▼────────────────┐
│   MongoDB Atlas  │            │  Python FastAPI — AI/ML   │
│                  │            │  LLM Manager + Workflows   │
└──────────────────┘            └───────────────────────────┘
```

**Two-service split confirmed:** Node.js handles auth, DB, file I/O, and external platform polling. Python FastAPI handles all LLM inference, AI workflows, and model routing. They communicate internally via HTTP.

---

## Part 1: Directory Structure

```
CareerOS/
├── src/                    ← existing React frontend (untouched design)
├── public/
├── backend/                ← NEW: Node.js Express server
│   ├── server.js
│   ├── package.json
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   └── utils/
├── ai_service/             ← NEW: Python FastAPI AI microservice
│   ├── main.py
│   ├── requirements.txt
│   ├── llm_manager.py
│   ├── workflows/
│   └── utils/
├── index.html
├── vite.config.js
└── ...
```

---

## Part 2: Node.js Backend (`/backend`)

### 2.1 Authentication

Three auth strategies, all unified to the same `Users` collection:

| Method | Provider | Library |
|---|---|---|
| Email / Password | Standard | `bcrypt` + `jsonwebtoken` |
| OAuth — Google | Google Identity | `passport-google-oauth20` |
| OAuth — GitHub | GitHub OAuth App | `passport-github2` |

- On successful GitHub OAuth, we immediately store the `github_access_token` on the user record so the data fetcher can call the GitHub API on their behalf with elevated limits.
- All three methods issue the same JWT response to the client.
- Refresh tokens stored in MongoDB with TTL index.

### 2.2 External Data Sources

Five platforms will be polled/fetched and stored in the `Telemetry` collection:

| Platform | Method | Data Points |
|---|---|---|
| **GitHub** | REST API v3 (user token from OAuth) | Commits, repos, languages, contribution graph |
| **LeetCode** | GraphQL API (unofficial, no key needed) | Problems solved by difficulty, contest rating, recent submissions |
| **Codeforces** | Public REST API | Rating history, problems solved, contest participation |
| **CodeChef** | Web scraping (no official public API) | Current rating, star level, problems solved |
| **Kaggle** | Kaggle Public API (user provides API key) | Notebook scores, competition ranks, datasets |

- A **cron job** (`node-cron`) runs every 6 hours per user to refresh all connected sources.
- Users can also manually trigger a "Sync Now" from the frontend.
- Each source's raw data is stored; a separate AI workflow then re-computes the skill profile.

### 2.3 Resume Upload & Parsing Strategy

> **Recommendation (for now):** A two-step approach is best:
> 1. **Step 1 — PDF → Text (Node.js):** Use `pdf-parse` (lightweight, no external calls) on the Node backend to extract raw text from the uploaded PDF.
> 2. **Step 2 — Text → Structured JSON (Python AI):** Pass the raw text to the Python AI service which uses an LLM to extract structured skills, experience, and education into a schema.
>
> This avoids paying for a specialized resume parsing SaaS, keeps data private, and makes the extraction quality improvable simply by changing the prompt or model.

- File upload handled by `Multer` (Node.js).
- Files temporarily stored, text extracted, then the file is deleted (or optionally archived to a storage bucket).

### 2.4 API Routes Summary

```
/api/auth
  POST   /register
  POST   /login
  GET    /google         ← OAuth redirect
  GET    /google/callback
  GET    /github         ← OAuth redirect
  GET    /github/callback
  POST   /logout
  POST   /refresh-token

/api/users
  GET    /me             ← current user profile
  PUT    /me             ← update profile (username, handles)
  DELETE /me

/api/telemetry
  GET    /               ← all aggregated stats for current user
  POST   /sync           ← trigger a manual data sync

/api/resume
  POST   /upload         ← upload PDF, returns extracted skill JSON

/api/ai
  POST   /roadmap        ← proxy to Python: generate roadmap
  POST   /companies      ← proxy to Python: run company matcher
  POST   /mentor/chat    ← proxy to Python: AI mentor conversational response
  POST   /skills/analyze ← proxy to Python: re-analyze skill profile

/api/admin              ← protected by admin role middleware
  (see Part 4 below)
```

### 2.5 MongoDB Collections (Atlas)

#### `users`
```js
{
  _id, name, email, passwordHash,
  avatar, role: "user" | "admin",
  auth: {
    github: { id, username, accessToken },
    google: { id }
  },
  connectedSources: {
    github: String,      // username
    leetcode: String,    // username
    codeforces: String,
    codechef: String,
    kaggle: { username, apiKey_encrypted }
  },
  readinessScore: Number,
  lastSyncedAt: Date,
  createdAt, updatedAt
}
```

#### `telemetry`
```js
{
  userId, source: "github"|"leetcode"|"codeforces"|"codechef"|"kaggle",
  data: { /* raw parsed object per source */ },
  fetchedAt: Date
}
```

#### `skillProfiles`
```js
{
  userId,
  categories: [{ name, score, tags }],
  masteryItems: [{ title, level, score, trend }],
  gapAnalysis: [{ name, delta, priority }],
  trendingSkills: [{ name, demand }],
  lastComputedAt: Date
}
```

#### `roadmaps`
```js
{
  userId, targetRoles: [String],
  milestones: [{ id, title, desc, tags, status, progress, subtasks }],
  readiness: Number,
  generatedAt: Date
}
```

#### `chatHistory`
```js
{
  userId, sessionId,
  messages: [{ sender, text, timestamp }],
  createdAt
}
```

---

## Part 3: Python AI/ML Microservice (`/ai_service`)

### 3.1 LLM Manager — The Core Engine

`llm_manager.py` is the heart of the AI service. It is responsible for:

1. **Task-to-Model Routing:** Reading the `aiConfigs` collection from MongoDB (via a Node.js internal API endpoint or direct DB connection) to determine which provider and model to use for a given task.
2. **API Key Pool Rotation:**
   - Maintains an ordered list of active keys per provider.
   - On `429 (Rate Limited)` or `503 (Service Unavailable)`: rotates to the next key in the pool and retries.
   - On complete key pool exhaustion for a provider: triggers **provider fallback**.
3. **Provider Fallback Chain:**
   - Each task has a configured fallback chain, e.g., `Gemini → OpenAI → HuggingFace`.
   - If the primary provider fails entirely, the manager moves to the next in the chain.

```python
# Conceptual flow in llm_manager.py
class LLMManager:
    def invoke(self, task: str, prompt: str) -> str:
        config = self.get_task_config(task)  # reads from DB
        for provider in config.fallback_chain:
            for key in self.get_active_keys(provider):
                try:
                    return self.call_provider(provider, key, config.model, prompt)
                except RateLimitError:
                    continue  # try next key
                except ProviderError:
                    break     # skip to next provider
        raise AllProvidersExhaustedError(task)
```

### 3.2 AI Workflows

| Endpoint | Workflow File | Task |
|---|---|---|
| `/ai/resume` | `resume_parser.py` | Extract skills/experience from raw text |
| `/ai/roadmap` | `roadmap_generator.py` | Generate milestones for selected target roles |
| `/ai/companies` | `company_matcher.py` | Score and explain company compatibility |
| `/ai/skills/analyze` | `skill_analyzer.py` | Analyze all telemetry data and produce skill profile |
| `/ai/mentor/chat` | `mentor_chat.py` | Stateful conversational responses |

### 3.3 AI Provider Configuration

Three provider SDKs will be integrated:

| Provider | SDK | Use Case |
|---|---|---|
| **Google Gemini** | `google-generativeai` | Roadmap generation, skill analysis (high reasoning) |
| **OpenAI (GPT)** | `openai` | Conversational mentor, quick completions |
| **HuggingFace Inference** | `huggingface_hub` | Lightweight classification tasks, embeddings, fallback |

---

## Part 4: Admin Panel

### 4.1 Frontend (new page — same design language)

A new page (`/admin`) added to the React frontend, accessible only to users with `role: "admin"`. Consistent with the existing card-based, white/indigo design system.

**Admin Panel Sections:**

| Section | Features |
|---|---|
| **AI Model Routing** | View/edit which model & provider is assigned to each task. Set fallback chain order. |
| **API Key Management** | Add, rename, activate, deactivate, delete API keys per provider. View key pool health status (active/rate-limited/failed). |
| **User Management** | View all users, promote to admin, suspend accounts. |
| **Sync Monitor** | See the status and last run time of all scheduled data sync jobs. Manually trigger sync for any user. |
| **System Health** | Provider status indicators (Gemini / OpenAI / HuggingFace) with live ping results. |

### 4.2 Backend (`/api/admin` routes)

All routes are protected by an `isAdmin` middleware that verifies `role === 'admin'` from the JWT payload.

```
/api/admin/ai-configs
  GET    /                    ← list all task-to-model mappings
  PUT    /:taskId             ← update model, provider, fallback chain

/api/admin/api-keys
  GET    /                    ← list all keys (masked), with status
  POST   /                    ← add a new key
  PUT    /:keyId              ← update label or activate/deactivate
  DELETE /:keyId              ← delete a key

/api/admin/users
  GET    /                    ← list all users
  PUT    /:userId/role        ← promote/demote
  DELETE /:userId

/api/admin/sync
  GET    /jobs                ← status of all cron jobs
  POST   /trigger/:userId     ← manually trigger sync

/api/admin/health
  GET    /providers           ← ping all AI providers and return status
```

### 4.3 `aiConfigs` MongoDB Collection

```js
{
  task: "roadmap_gen",           // unique task identifier
  label: "Roadmap Generation",   // human-readable
  primaryProvider: "gemini",
  primaryModel: "gemini-1.5-pro",
  fallbackChain: ["openai", "huggingface"],
  isActive: true,
  updatedAt: Date
}
```

### 4.4 `apiKeys` MongoDB Collection

```js
{
  provider: "gemini" | "openai" | "huggingface",
  label: "Gemini Key #1",        // admin-set label
  encryptedKey: String,          // AES-256 encrypted at rest
  isActive: Boolean,
  status: "ok" | "rate_limited" | "failed",
  lastUsedAt: Date,
  addedAt: Date
}
```

> [!NOTE]
> API keys are AES-256 encrypted in MongoDB. The `LLMManager` decrypts on the fly using a server-side `ENCRYPTION_SECRET` stored in environment variables — never in the DB.

---

## Part 5: Responsiveness Optimization (Frontend Only)

> [!NOTE]
> All changes are additive (Tailwind responsive prefixes only). No existing styles, colors, or components will be removed or altered.

The existing layout uses `max-w-[1280px]` on the main container. Optimizations:

- **Mobile (`< 768px`):** Sidebar collapses to icon-only. Cards stack to single column. Charts resize correctly.
- **Tablet (`768px – 1280px`):** Grid layouts shift to 2-col where appropriate.
- **Desktop (`> 1280px`):** Content stays capped at `max-w-[1280px]` — no stretching.
- **Ultrawide (`> 1920px`):** The outer background fills, but the main content area remains centered and bounded.

---

## Proposed File Changes Summary

### [NEW] `/backend/`
| File | Purpose |
|---|---|
| `server.js` | Express entry point, middleware setup |
| `package.json` | Dependencies |
| `config/db.js` | MongoDB Atlas connection |
| `config/passport.js` | GitHub, Google OAuth strategies |
| `models/` | Mongoose schemas for all 6 collections |
| `routes/` | Route files for auth, users, telemetry, resume, ai, admin |
| `controllers/` | Business logic per route group |
| `services/githubService.js` | GitHub API fetcher |
| `services/leetcodeService.js` | LeetCode GraphQL fetcher |
| `services/codeforcesService.js` | Codeforces API fetcher |
| `services/codechefService.js` | CodeChef scraper |
| `services/kaggleService.js` | Kaggle API fetcher |
| `middleware/auth.js` | JWT verification middleware |
| `middleware/isAdmin.js` | Admin role guard |
| `utils/encrypt.js` | AES-256 encrypt/decrypt for API keys |

### [NEW] `/ai_service/`
| File | Purpose |
|---|---|
| `main.py` | FastAPI app entry |
| `requirements.txt` | All Python dependencies |
| `llm_manager.py` | Provider routing, key rotation, fallback |
| `workflows/resume_parser.py` | Resume → structured JSON |
| `workflows/roadmap_generator.py` | AI roadmap milestone generation |
| `workflows/company_matcher.py` | Company compatibility engine |
| `workflows/skill_analyzer.py` | Full skill profile computation from telemetry |
| `workflows/mentor_chat.py` | AI mentor conversational handler |
| `utils/db.py` | MongoDB connection helper (for reading aiConfigs) |

### [MODIFY] `src/` (Frontend — wiring only)
| File | Change |
|---|---|
| `src/context/AppContext.jsx` | Replace static mock data with `fetch()` calls to backend API |
| `src/pages/Dashboard.jsx` | Consume live data from context |
| `src/pages/SkillIntelligence.jsx` | Consume live skill profile from API |
| `src/pages/Roadmap.jsx` | Load/save roadmap milestones via API |
| `src/pages/CompanyMatches.jsx` | Fetch company match scores from AI service |
| `src/pages/AIMentor.jsx` | Connect chat to live AI mentor endpoint |
| `src/pages/Profile.jsx` | Show/edit connected source handles |
| `src/App.jsx` | Add `/admin` route, add auth guard |
| **[NEW]** `src/pages/Admin.jsx` | Admin panel page |
| **[NEW]** `src/pages/Login.jsx` | Auth page (email/password + OAuth buttons) |

---

## Verification Plan

### Automated Tests
- `backend/tests/`: Unit tests for each external service fetcher using mocked HTTP responses.
- `ai_service/tests/`: Unit tests for `LLMManager` — simulate 429 errors, verify key rotation; simulate provider failure, verify fallback chain.

### Manual Verification
1. Register via email/password → receive JWT → access protected routes.
2. Login with GitHub OAuth → GitHub access token stored → manual sync populates `telemetry`.
3. Upload a PDF resume → verify extracted JSON returned with correct skill structure.
4. Admin: Add a Gemini key, set it to the `roadmap_gen` task, call the roadmap endpoint → confirm it uses the configured key.
5. Admin: Deactivate all Gemini keys → call roadmap endpoint → confirm fallback to OpenAI.
6. Check UI at 375px (mobile), 768px (tablet), 1440px (desktop), 2560px (ultrawide) for layout integrity.

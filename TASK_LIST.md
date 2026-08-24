# CareerOS — Implementation Task List

Reference: [IMPLEMENTATION_PLAN.md](file:///d:/Project/CareerOS/IMPLEMENTATION_PLAN.md)

---

## Phase 1: Project Scaffolding & Configuration
- [x] Create `backend/` directory structure (config, models, routes, controllers, services, middleware, utils)
- [x] Create `backend/package.json` with all dependencies
- [x] Create `backend/.env.example` with all required env vars
- [x] Create `backend/server.js` (Express entry point with middleware)
- [x] Create `backend/config/db.js` (MongoDB Atlas connection via Mongoose)
- [x] Create `ai_service/` directory structure (workflows, utils)
- [x] Create `ai_service/requirements.txt`
- [x] Create `ai_service/main.py` (FastAPI entry point)
- [x] Create `ai_service/.env.example`
- [x] Update `.gitignore` for backend + ai_service

## Phase 2: MongoDB Models
- [x] `backend/models/User.js` — user schema with auth, connectedSources, role
- [x] `backend/models/Telemetry.js` — per-source raw data snapshots
- [x] `backend/models/SkillProfile.js` — AI-computed skill categories, mastery, gaps
- [x] `backend/models/Roadmap.js` — generated milestones and readiness
- [x] `backend/models/ChatHistory.js` — mentor chat sessions
- [x] `backend/models/AiConfig.js` — task-to-model routing config
- [x] `backend/models/ApiKey.js` — encrypted API key pool

## Phase 3: Authentication
- [x] `backend/middleware/auth.js` — JWT verification middleware
- [x] `backend/middleware/isAdmin.js` — admin role guard
- [x] `backend/config/passport.js` — GitHub + Google OAuth strategies
- [x] `backend/routes/authRoutes.js` — register, login, OAuth, logout, refresh
- [x] `backend/controllers/authController.js` — all auth business logic

## Phase 4: User & Core API Routes
- [x] `backend/routes/userRoutes.js` — GET/PUT/DELETE /me
- [x] `backend/controllers/userController.js`
- [x] `backend/routes/telemetryRoutes.js` — GET /, POST /sync
- [x] `backend/controllers/telemetryController.js`
- [x] `backend/routes/resumeRoutes.js` — POST /upload
- [x] `backend/controllers/resumeController.js`
- [x] `backend/routes/aiRoutes.js` — proxy routes to Python service
- [x] `backend/controllers/aiController.js`

## Phase 5: External Data Source Services
- [x] `backend/services/githubService.js` — GitHub REST API fetcher
- [x] `backend/services/leetcodeService.js` — LeetCode GraphQL fetcher
- [x] `backend/services/codeforcesService.js` — Codeforces API fetcher
- [x] `backend/services/codechefService.js` — CodeChef scraper
- [x] `backend/services/kaggleService.js` — Kaggle API fetcher
- [x] `backend/services/syncOrchestrator.js` — cron job orchestrator (node-cron)

## Phase 6: Admin API Routes
- [x] `backend/routes/adminRoutes.js` — all admin endpoints
- [x] `backend/controllers/adminController.js` — AI configs CRUD, API keys CRUD, user mgmt, sync monitor, health
- [x] `backend/utils/encrypt.js` — AES-256 encrypt/decrypt utility

## Phase 7: Python AI/ML Microservice — LLM Manager
- [x] `ai_service/utils/db.py` — MongoDB connection helper
- [x] `ai_service/utils/encryption.py` — key decryption utility
- [x] `ai_service/llm_manager.py` — full LLM gateway (task routing, key pool rotation, provider fallback)
- [x] Fixed relative imports → absolute imports across all files

## Phase 8: Python AI Workflows
- [x] `ai_service/workflows/resume_parser.py` — resume text → structured JSON
- [x] `ai_service/workflows/skill_analyzer.py` — telemetry data → skill profile
- [x] `ai_service/workflows/roadmap_generator.py` — roles + gaps → milestones
- [x] `ai_service/workflows/company_matcher.py` — profile → company compatibility scores
- [x] `ai_service/workflows/mentor_chat.py` — stateful conversational AI mentor

## Phase 9: Wire up endpoints in FastAPI main.py
- [x] Register all workflow routes in `ai_service/main.py`
- [x] Add health check endpoint
- [x] Fix request schemas to match Node.js backend payloads
- [x] Add error handling middleware

## Phase 10: Verification
- [x] Backend `npm install` — dependencies installed successfully
- [ ] Verify backend starts without errors (requires MongoDB URI in .env)
- [ ] Verify ai_service starts without errors (requires `pip install -r requirements.txt`)
- [ ] Test auth endpoints (register, login)
- [ ] Test telemetry sync flow
- [ ] Test resume upload pipeline
- [ ] Test AI proxy routing
- [ ] Test admin CRUD operations

## Phase 11: Frontend Wiring (NOT YET STARTED)
- [ ] `src/pages/Login.jsx` — Auth page (email/password + OAuth buttons)
- [ ] `src/pages/Admin.jsx` — Admin panel page
- [ ] `src/context/AppContext.jsx` — Replace static mock data with fetch() calls
- [ ] Wire Dashboard, SkillIntelligence, Roadmap, CompanyMatches, AIMentor, Profile to live APIs
- [ ] Responsiveness optimization

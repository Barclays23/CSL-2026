# CSL 2026 Backend

Express 5 + TypeScript + MongoDB/Mongoose API for the single-current-tournament CSL application.

## Requirements
- Node.js LTS
- MongoDB Atlas URI or local MongoDB
- Cloudinary account for image uploads (optional until uploads are used)

## Setup
1. Open a terminal in `backend/`.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and configure MongoDB, JWT and admin credentials.
4. Run `npm run seed:admin` once to create the administrator. Existing accounts are not overwritten.
5. Run `npm run dev`.

Health check: http://localhost:5000/api/health

## Commands
- `npm run dev` - development server with reload
- `npm run typecheck` - TypeScript check
- `npm run build` - compile to dist/
- `npm start` - run compiled server
- `npm run seed:admin` - create initial administrator
- `npm test` - run Node's test runner

## Environment
See `.env.example`. Never commit `.env`. JWT_SECRET must be at least 32 characters. Configure CLIENT_URL=http://localhost:5173 for local frontend integration. The API uses an HTTP-only csl_token cookie and credentialed CORS.

Cloudinary values are optional in development. Uploads return a configuration error until all three Cloudinary values are supplied.

## Architecture
- modules/*/*.model.ts - Mongoose schemas and inferred record types
- *.dto.ts - Zod request validation
- *.repository.ts - database reads, writes and aggregations
- *.service.ts - tournament rules and orchestration
- *.controller.ts - HTTP handling
- *.routes.ts - route registration and middleware
- container/index.ts - dependency composition
- shared/ - errors, response helpers, common DTOs and types

## API
Base URL: http://localhost:5000/api

- GET /health
- POST /auth/login, POST /auth/logout, GET /auth/me
- GET /settings, PATCH /settings
- GET/POST /players, GET/PATCH/DELETE /players/:id
- GET /teams, GET /teams/auction-summary, GET /teams/:id, GET /teams/:id/statistics, team CRUD
- GET /managers, GET /managers/:id, manager CRUD
- GET /sponsors, GET /sponsors/:id, sponsor CRUD
- GET/POST /matches, GET/PATCH/DELETE /matches/:id
- POST /matches/:id/goals, PATCH/DELETE /matches/:id/goals/:goalId
- POST /auction/start, POST /auction/complete, POST /auction/reopen
- GET /standings, GET /top-scorers, GET /dashboard/summary
- POST /uploads

All write routes require an authenticated admin, except login/logout. Public GET routes return sanitized information. List responses use pagination, not meta.

## Rules
- One Settings singleton.
- Player status: active/inactive. Auction status: pending/sold/unsold.
- Jersey numbers are optional and unique within each team.
- Team auction totals are calculated from Player records.
- Goals are embedded in Match. Own goals count for the credited team but not personal top scorer totals.
- Shootouts are separate and excluded from normal goal statistics.
- Group standings use completed group matches only.
- Top scorers and overall dashboard statistics include all completed stages.

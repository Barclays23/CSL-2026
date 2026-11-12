# CSL 2026 — Real API integration

## Current integration mode

The frontend now uses the Express API by default. The preview/mock repository remains in frontend/src/mocks/ and the existing service-level mock branches are preserved for rollback.

Frontend environment:

    VITE_API_BASE_URL=http://localhost:5000/api
    VITE_USE_MOCK_API=false
    VITE_UPLOAD_PATH=/uploads

- VITE_USE_MOCK_API=false (or unset): use the real backend.
- VITE_USE_MOCK_API=true: use the existing in-browser preview repository.
- After changing a Vite environment variable, restart the frontend dev server.

## Start the backend

1. Open a terminal in backend/.
2. Run npm install.
3. Copy .env.example to .env.
4. Set a valid MongoDB URI, a JWT secret of at least 32 characters, admin email/password, and CLIENT_URL=http://localhost:5173.
5. Run npm run seed:admin once to create the administrator account.
6. Run npm run dev.
7. Open http://localhost:5000/api/health. It should return HTTP 200 and report the database as connected.

Do not commit either .env file. Use a disposable/test database while validating CRUD.

## Start the frontend

1. Open another terminal in frontend/.
2. Copy .env.example to .env.local (or configure the same Vite variables in your local environment).
3. Ensure VITE_USE_MOCK_API=false.
4. Run npm install and npm run dev.

## CRUD and integration smoke-test order

The API uses an HTTP-only cookie, so requests must keep credentials enabled (the shared Axios instance already has withCredentials: true).

1. Health: GET /health.
2. Login: POST /auth/login; then verify GET /auth/me and logout/login behavior.
3. Settings: public GET /settings, admin PATCH /settings.
4. Teams: create/list/update/delete a disposable team; check GET /teams/auction-summary.
5. Players: create/list/update/deactivate/delete a disposable player; verify assignment and auction constraints.
6. Managers and sponsors: exercise create/list/update/delete.
7. Matches: create a fixture, add/edit/delete goals, update status, and verify score calculations.
8. Statistics: verify GET /standings, GET /top-scorers, and GET /dashboard/summary after adding completed test matches.
9. Uploads: test only after Cloudinary environment variables are configured.

The frontend CRUD pages already call the centralized service modules. Those modules contain both the existing preview-repository implementation and the real Axios endpoint implementation; changing the environment flag switches the data source without deleting the mock files.

## Rollback

Set VITE_USE_MOCK_API=true and restart Vite. This re-enables the original preview repository. The mock seed, store and repository are intentionally retained.

## Important verification note

This branch changes the default data source; it does not claim that the live database or every endpoint has been tested. The repository currently has no tournament records, and the API must be started against your configured MongoDB database and smoke-tested in the order above. Do not point the app at production data until the disposable-database tests pass.
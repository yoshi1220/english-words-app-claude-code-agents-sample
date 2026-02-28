# Review Verifier Memory (Frontend)

## Frontend Testing
- Uses Vitest (not Jest) -- plan.md incorrectly says Jest
- Test files use `.test.tsx` extension, co-located with components
- Uses `vi.mock()` / `vi.mocked()` (Vitest API, not Jest)
- Testing Library: `@testing-library/react` + `@testing-library/user-event`

## Frontend Architecture
- Vite 7 with React 19 (plan.md says React 18)
- No proxy config in vite.config.ts -- API calls go directly to BASE_URL
- CSR app -- browser makes API requests, not server
- `localhost:3000` hardcode works in Docker because browser connects to host port mapping

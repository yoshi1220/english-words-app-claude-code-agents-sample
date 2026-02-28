# Review Verifier Memory

## Project Structure
- Backend: NestJS 11 (plan.md says 10), TypeORM 0.3, MySQL 8
- Frontend: React 19 (plan.md says 18), Vite 7, Vitest 4 (plan.md says Jest)
- Backend tests: co-located in `src/` (Jest rootDir: "src"), NOT in `test/`
- Frontend tests: Vitest (not Jest), co-located with components
- CLAUDE.md is auto-generated from plan.md data

## Verified Patterns
- Backend Jest config: `rootDir: "src"`, `testRegex: ".*\\.spec\\.ts$"` -- tests must be in `src/`
- NestJS scaffold places tests in `src/` (e.g., `app.controller.spec.ts`)
- Frontend is CSR (Vite dev server), so `localhost:3000` works even in Docker (browser makes requests)
- `backend/test/` is for e2e tests only (`jest-e2e.json`)

## Common Review Issues
- plan.md version numbers may lag behind actual package.json versions (NestJS 10->11, React 18->19)
- plan.md test file paths may specify `test/` but actual convention is `src/` co-location
- plan.md says Jest for frontend but actual framework is Vitest
- Reviews may miss CLAUDE.md needing same updates as plan.md
- Docker "localhost won't work" claims need nuance -- CSR apps access via browser, not container-to-container

## Review Quality Indicators
- First review (001-word-registration) was thorough -- all 4 warnings confirmed accurate
- Reviewer correctly identified plan.md deviations and provided sound reasoning
- Reviewer appropriately used LOW severity for documentation-only issues

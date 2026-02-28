# Implementation Coordinator Memory

## Project: english-words

### Architecture Overview
- **Monorepo structure**: `backend/` (NestJS) + `frontend/` (Vite + React) + `docker-compose.yml`
- **Backend**: NestJS (CLI v11 installed), TypeORM, MySQL 8.x, class-validator/class-transformer
- **Frontend**: Vite + React 18 + TypeScript, React Hook Form, Axios
- **Testing**: Backend=Jest (NestJS default), Frontend=Vitest (Vite standard, Jest-compatible API)
- **Docker**: 3 services (db, backend on :3000, frontend on :5173)
- **Spec directory**: `/specs/001-word-registration/`

### Key Design Decisions
- Vitest chosen over Jest for frontend (plan.md says Jest, but Vitest is Vite-native and Jest-compatible)
- NestJS CLI v11 generates @nestjs/core v11.x (plan.md says v10, but API-compatible)
- Dockerfile uses node:20-alpine (LTS) despite host having Node 24
- DB container name: `english-words-db` (referenced in quickstart.md)

### Environment
- Node.js: v24.14.0, npm: 11.10.0
- NestJS CLI: v11.0.16 (via npx)
- Docker: Available via WSL2 integration (may need Docker Desktop WSL integration enabled)

### Pattern References (for future tasks)
- DB connection env vars: DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
- API base path: `/api/words`
- Error response format: `{ statusCode, message[], error }`
- See [patterns.md](patterns.md) for detailed code patterns

### Coordination Notes
- T001/T002/T003 (Phase 1 Setup) are parallelizable
- Phase 2 (T004/T005) depends on T001 completion (edits backend/src/ files)
- Full task dependency chain: Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5

### Phase 4 Notes (T017-T020)
- Backend validation (class-validator decorators) already implemented in T005+T010; T018 tests are regression tests
- tasks.md T018 path wrong: `backend/test/` vs actual `backend/src/` -- always verify actual file locations
- Backend unit test rootDir is `src/` (package.json jest config), specs go in `backend/src/**/*.spec.ts`
- For long string input tests in frontend, use `fireEvent.change` not `userEvent.type` (perf issue)
- T020 changes errorMessage from string to string[] -- breaks existing test assertion (mock returns 400 format)
- Frontend test framework: Vitest (vi.fn, vi.mock, vi.mocked) -- NOT Jest (jest.fn)
- Backend test framework: Jest (jest.fn, jest.spyOn) -- NOT Vitest

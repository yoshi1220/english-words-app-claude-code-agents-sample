# Post-Implementation Code Reviewer Memory

## Project: english-words

### Technology Stack (Actual)
- Backend: NestJS 11, TypeORM 0.3, MySQL 8.x, class-validator, class-transformer
- Frontend: React 19, Vite 7, TypeScript 5.9, React Hook Form 7, Axios, Vitest 4
- Testing: Jest + supertest (backend), Vitest + React Testing Library + user-event (frontend)

### Established Patterns
- See [patterns.md](patterns.md) for details

### Key Review Findings (001-word-registration)
- Plan.md version numbers outdated (NestJS 10 -> 11, React 18 -> 19)
- Plan.md test file paths incorrect (`backend/test/` -> `backend/src/` is correct per Jest config)
- Frontend BASE_URL hardcoded; Docker compatibility requires env var or proxy

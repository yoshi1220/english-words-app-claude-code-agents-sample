# Code Patterns Reference

## API Contract Pattern (from contracts/api.md)
- Endpoint: `POST /api/words`
- Success: 201 Created with `{ id, spell, meaning, createdAt }`
- Validation Error: 400 Bad Request with `{ statusCode: 400, message: string[], error: "Bad Request" }`
- Server Error: 500 with `{ statusCode: 500, message: "Internal server error", error: "Internal Server Error" }`

## Backend Patterns (from data-model.md, contracts/api.md)
- Entity: TypeORM decorators (@Entity, @PrimaryGeneratedColumn, @Column, @CreateDateColumn)
- DTO: class-validator decorators + class-transformer @Transform(trim)
- Validation messages in Japanese: "スペルを入力してください", "意味を入力してください", etc.
- ValidationPipe config: { whitelist: true, transform: true, forbidNonWhitelisted: true }
- CORS enabled in main.ts

## Frontend Patterns (from contracts/api.md)
- HTTP client: Axios with typed response
- API service: function-based (not class), e.g., `export async function createWord()`
- Types: CreateWordRequest, WordResponse interfaces
- BASE_URL: 'http://localhost:3000'

## Docker Pattern (from research.md)
- MySQL healthcheck: mysqladmin ping
- Backend depends_on db with condition: service_healthy
- Volume mount for hot reload: ./backend:/app + /app/node_modules (anonymous volume)
- Environment variables for DB connection (not hardcoded in app.module.ts)

## Testing Patterns
- Backend: Jest 30 + ts-jest 29, NestJS @nestjs/testing
- Backend Jest config: `rootDir: "src"`, `testRegex: ".*\\.spec\\.ts$"` -- tests MUST be in `src/` (not `test/`)
- Backend test reference: `backend/src/app.controller.spec.ts` uses `Test.createTestingModule` pattern
- Frontend: Vitest 4 + @testing-library/react + @testing-library/jest-dom + @testing-library/user-event
- Frontend Vitest config: `globals: true`, `environment: "jsdom"`, setup imports `@testing-library/jest-dom`
- Frontend tsconfig.app.json has `"types": ["vite/client", "vitest/globals"]` and `"verbatimModuleSyntax": true`
- TDD: Write tests first (RED), then implement (GREEN)

### CRITICAL: Backend test file placement
tasks.md says `backend/test/words/` but Jest config `rootDir: "src"` means only `src/` is scanned.
Correct placement: `backend/src/words/words.service.spec.ts` and `backend/src/words/words.controller.spec.ts`
(matches existing pattern: `backend/src/app.controller.spec.ts` is co-located with source)

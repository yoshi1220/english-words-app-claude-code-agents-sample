# Frontend UI Implementer Memory

## Project Overview
- Feature: 001-word-registration (英単語登録機能)
- Frontend: Vite + React 19 + TypeScript 5.9 in `frontend/` directory
- Spec/plan/tasks in: `specs/001-word-registration/`

## Tech Stack (Confirmed)
- React 19.2, TypeScript ~5.9.3
- Vite 7.x with @vitejs/plugin-react
- react-hook-form ^7.71.2
- axios ^1.13.5
- vitest ^4.0.18 for testing
- @testing-library/react ^16.3.2, @testing-library/jest-dom ^6.9.1, @testing-library/user-event ^14.6.1
- jsdom ^28.1.0 (test environment)

## Directory Structure
```
frontend/
├── src/
│   ├── components/WordRegistrationForm/  (feature component)
│   ├── services/                         (API clients)
│   ├── test/setup.ts                     (test setup file)
│   ├── App.tsx, App.css, main.tsx
│   └── vite-env.d.ts
├── vitest.config.ts
├── Dockerfile
└── package.json
```

## TypeScript Configuration (CRITICAL)
- `verbatimModuleSyntax: true` in tsconfig.app.json — MUST use `import type` for type-only imports
- `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- `erasableSyntaxOnly: true` — avoid enums with const keyword patterns

## Component Patterns
- Named exports for feature components: `export function WordRegistrationForm()`
- No default exports for feature components — only App.tsx uses `export default`
- Labels connected to inputs via `htmlFor`/`id` (required for `getByLabelText` in tests)
- React Hook Form: `useForm<FormType>()`, `register`, `handleSubmit`, `reset`
- `reset()` used to clear form on success; NOT called on error (preserves input)

## Services Pattern
- API clients in `frontend/src/services/`
- Pattern: `export interface RequestType`, `export interface ResponseType`, `export async function`
- Axios used directly (not a custom instance) with BASE_URL constant
- See: `frontend/src/services/wordService.ts`

## Linting
- ESLint (not biome) — run `npm run lint`

## Error Handling Pattern
- `catch` block with no bound variable (`catch {`) — avoids unused variable lint error
- Success: show success message + `reset()` form
- Error: show error message only, NO `reset()` (input values preserved)

## Vitest Configuration
- `vitest.config.ts` is SEPARATE from `vite.config.ts`
- globals: true, environment: jsdom, setupFiles: ./src/test/setup.ts
- `tsconfig.app.json` types includes `"vitest/globals"` for TypeScript support
- Test exit code 1 when no test files exist is expected/normal

## Key File Paths
- Tasks: `/home/yoshi1220/workspace/english-words/specs/001-word-registration/tasks.md`
- Frontend root: `/home/yoshi1220/workspace/english-words/frontend/`
- vitest config: `/home/yoshi1220/workspace/english-words/frontend/vitest.config.ts`
- Test setup: `/home/yoshi1220/workspace/english-words/frontend/src/test/setup.ts`
- API contract: `/home/yoshi1220/workspace/english-words/specs/001-word-registration/contracts/api.md`

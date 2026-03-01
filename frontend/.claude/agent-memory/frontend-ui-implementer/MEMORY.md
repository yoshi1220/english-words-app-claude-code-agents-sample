# Frontend UI Implementer Memory

## Project Stack (verified)
- React 19 + TypeScript 5.9
- React Hook Form v7 (no Zod — native validation rules only)
- Axios v1 for HTTP
- Vitest v4 + Testing Library v16 + user-event v14 for tests
- ESLint v9 for lint (no Biome in this project)
- No MUI, no TanStack Query, no TanStack Router, no Redux in this project

## Component Pattern
- Location: `frontend/src/components/{ComponentName}/{ComponentName}.tsx`
- Test colocation: `frontend/src/components/{ComponentName}/{ComponentName}.test.tsx`
- Named exports (not default): `export function WordRegistrationForm()`
- See: `frontend/src/components/WordRegistrationForm/`

## React Hook Form Pattern
- Native validation rules (no Zod): `required`, `maxLength`, `validate`
- Destructure `formState: { errors }` from `useForm()`
- Inline error display: `{errors.field && <p role="alert">{errors.field.message}</p>}`
- See: `frontend/src/components/WordRegistrationForm/WordRegistrationForm.tsx`

## Axios Error Handling Pattern
- `axios.isAxiosError(error)` works with plain objects that have `isAxiosError: true`
- 400 responses: parse `error.response.data?.message` as `string[]`
- Store server errors as `string[]` state, not `string`
- Render each message with `.map((msg, i) => <p key={i}>{msg}</p>)`

## Test Patterns
- `vi.mock()` at file top (before imports) — Vitest hoisting
- `vi.mocked(fn)` for typed mock access
- `userEvent.setup()` for interactive events
- `fireEvent.change()` for setting long values (avoid slow `userEvent.type()` for 200+ chars)
- `waitFor()` for async assertions
- Test file structure: flat `it()` blocks + nested `describe()` for grouped scenarios

## API Client Pattern
- Location: `frontend/src/services/wordService.ts`
- Axios with hardcoded `BASE_URL = 'http://localhost:3000'`
- Named function exports + exported interfaces

## Lint
- `npm run lint` runs ESLint (not Biome)
- `npm run test` runs `vitest run` (single-pass, not watch)

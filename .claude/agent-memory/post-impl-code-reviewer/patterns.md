# Established Code Patterns

## Backend (NestJS)

### File Structure
- Tests co-located with source files in `src/` (NOT in separate `test/` directory)
- Jest config: `rootDir: "src"`, `testRegex: ".*\\.spec\\.ts$"`
- Module pattern: entity, dto/, service, controller, module per feature directory

### Naming
- Entity: PascalCase (e.g., `Word`)
- DTO: PascalCase + `Dto` suffix (e.g., `CreateWordDto`)
- Service: PascalCase + `Service` suffix (e.g., `WordsService`)
- Controller: PascalCase + `Controller` suffix (e.g., `WordsController`)
- Module: PascalCase + `Module` suffix (e.g., `WordsModule`)
- File names: kebab-case (e.g., `word.entity.ts`, `create-word.dto.ts`)

### Import Order
1. NestJS framework imports
2. Third-party library imports (TypeORM, class-validator, etc.)
3. Local module imports

### Error Handling
- ValidationPipe handles 400 errors automatically
- DB errors propagate as 500 via NestJS default exception filter
- No explicit try-catch in service/controller (framework handles it)

### Test Pattern
- `Test.createTestingModule()` for setup
- `jest.spyOn()` for mocking repository methods
- `// eslint-disable-next-line @typescript-eslint/unbound-method` before `expect(repo.method).toHaveBeenCalledWith()`
- Validation tests use supertest with full app initialization + ValidationPipe

## Frontend (React + Vite)

### File Structure
- Components in PascalCase directories: `components/ComponentName/ComponentName.tsx`
- Tests alongside components: `ComponentName.test.tsx`
- Services in camelCase: `services/wordService.ts`
- Test setup: `src/test/setup.ts` imports `@testing-library/jest-dom`

### Naming
- Component files and directories: PascalCase
- Service files: camelCase
- Interface types: PascalCase (e.g., `CreateWordRequest`, `WordResponse`)
- Functions: camelCase (e.g., `createWord`)

### Import Order
1. React / library imports
2. Local module imports
3. Type-only imports (using `type` keyword)

### Test Pattern
- `vi.mock()` at top of file (before other imports)
- `vi.mocked()` for typed mock references
- `userEvent.setup()` for user interaction simulation
- `waitFor()` for async assertion patterns
- `fireEvent.change()` for large text inputs (to avoid slow `userEvent.type()`)
- Error mocks include `isAxiosError: true` property (axios checks this internally)

### Comment Style
- Sequential numbered comments for multi-step logic (e.g., `// 1.`, `// 2.`, etc.)
- Follows CLAUDE.md rule about sequential comment numbering

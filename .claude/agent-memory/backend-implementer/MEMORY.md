# Backend Implementer Memory

## Project Structure

- Repository root: `/home/yoshi1220/workspace/english-words/`
- Backend directory: `backend/` (NestJS 11.x + TypeORM 0.3 + MySQL 2)
- Specs directory: `specs/001-word-registration/` (tasks.md, plan.md, spec.md, etc.)
- Tasks tracked in: `specs/001-word-registration/tasks.md`

## NestJS Backend Setup (T001 - completed)

- NestJS CLI version used: @nestjs/cli@11.0.16 (installed @nestjs 11.x packages)
- Required dependencies: `@nestjs/typeorm ^11.0.0`, `typeorm ^0.3.28`, `mysql2 ^3.18.2`, `class-validator ^0.15.1`, `class-transformer ^0.5.1`
- Test runner: jest (via `npm run test`)
- Build command: `npm run build` (nest build)

## Test Patterns (CRITICAL)

- Jest config has `rootDir: "src"` — ALL spec files MUST live under `backend/src/`
- Feature tests go in `backend/src/words/` (NOT `backend/test/words/`)
- Unit tests: `backend/src/words/words.service.spec.ts`, `backend/src/words/words.controller.spec.ts`
- Reference test: `backend/src/app.controller.spec.ts`
- E2E tests live in `test/`: `test/app.e2e-spec.ts` (separate jest-e2e.json config)
- Mock repositories: provide via `getRepositoryToken(Entity)` with `useValue: { save: jest.fn() }`
- Mock services: provide by class name with `useValue: { create: jest.fn() }`
- tasks.md originally referenced `backend/test/words/` paths — those were corrected to `backend/src/words/`

## Known Pre-existing Lint Warnings

- `backend/src/main.ts` line 20: `bootstrap();` produces `@typescript-eslint/no-floating-promises` warning
- This is a pre-existing NestJS scaffold issue, NOT introduced by our changes
- Do not attempt to fix unless explicitly tasked

## ESLint Config (eslint.config.mjs - typescript-eslint recommendedTypeChecked)

- Config file: `backend/eslint.config.mjs` (flat config format, ESLint 9)
- Uses `tseslint.configs.recommendedTypeChecked` — strict type-aware rules enabled
- `@typescript-eslint/no-unsafe-return` is active — `@Transform` callbacks returning `any` will fail
  - Fix: extract to named function `const trimString = ({ value }: TransformFnParams): unknown => ...`
- `@typescript-eslint/unbound-method` is active — `expect(mock).toHaveBeenCalledWith()` in tests will fail
  - Fix: add `// eslint-disable-next-line @typescript-eslint/unbound-method` before each such `expect()` line in spec files
- `@typescript-eslint/no-floating-promises` is set to `warn` (not error)
- `@typescript-eslint/no-unsafe-argument` is set to `warn` (not error)

## AppModule Pattern (T004 - completed)

- `TypeOrmModule.forRoot()` uses environment variables with `|| fallback` defaults (not `?? null`)
- `entities` glob: `[__dirname + '/**/*.entity{.ts,.js}']`
- `synchronize: true` enabled (dev only)

## main.ts Pattern (T005 - completed)

- `app.enableCors()` called before `app.useGlobalPipes()`
- `ValidationPipe` options: `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true`

## Words Module Structure (T009-T013 - completed)

- Entity: `backend/src/words/word.entity.ts` — `@Entity('words')`, `@PrimaryGeneratedColumn()`, `@Column()`, `@CreateDateColumn()`
- DTO: `backend/src/words/dto/create-word.dto.ts` — uses `trimString` helper with `TransformFnParams`, `@IsNotEmpty`, `@IsString`, `@MaxLength`
- Service: `backend/src/words/words.service.ts` — `@Injectable()`, `@InjectRepository(Word)`, single `create()` method
- Controller: `backend/src/words/words.controller.ts` — `@Controller('api/words')`, `@Post()` returns 201 by default (no `@HttpCode` needed)
- Module: `backend/src/words/words.module.ts` — `TypeOrmModule.forFeature([Word])`, registers controller and service
- AppModule updated to import `WordsModule`

## Supertest Import (CRITICAL)

Use default import, NOT namespace import:
```typescript
import request from 'supertest';      // CORRECT — matches e2e spec pattern
import * as request from 'supertest'; // WRONG — causes "request is not a function"
```
Reference: `backend/test/app.e2e-spec.ts` uses default import correctly.

## Integration Test Pattern for Validation Tests

When writing integration-style tests with `INestApplication` and supertest:
- Use `module.createNestApplication()` and apply `useGlobalPipes()` in `beforeEach`
- Call `await app.close()` in `afterEach`
- Cast `res.body` to avoid `@typescript-eslint/no-unsafe-member-access` error:
  ```typescript
  const body = res.body as { message: string[] };
  expect(body.message).toContain('...');
  ```
- `app.getHttpServer()` will produce `@typescript-eslint/no-unsafe-argument` warning (acceptable — set to warn)

## Task Tracking

- Mark tasks complete in `specs/001-word-registration/tasks.md` by changing `[ ]` to `[x]`
- TDD is NON-NEGOTIABLE: write tests first (RED), then implement (GREEN)
- Execution order: T001 -> T004/T005 -> T006-T013 (backend) -> verify

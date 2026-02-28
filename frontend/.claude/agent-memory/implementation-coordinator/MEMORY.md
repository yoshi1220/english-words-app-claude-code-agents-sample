# Frontend Implementation Coordinator Memory

## Stack

- React 19, Vite 7, TypeScript 5.9, react-hook-form 7, axios, Vitest 4, testing-library

## Test Patterns

- Mock pattern: `vi.mock('path', () => ({ fn: vi.fn() }))` at file top, then `vi.mocked(fn)`
- User events: `userEvent.setup()` before interactions
- Async assertions: always `await waitFor(() => { expect(...) })`
- Long string input: use `fireEvent.change(el, { target: { value: longStr } })` not `userEvent.type`

## Form Patterns

- `useForm<CreateWordRequest>()` with destructured `register, handleSubmit, reset, formState: { errors }`
- Validation: pass rules object as second arg to `register('field', { required, maxLength, validate })`
- Error display: `{errors.field && <p role="alert">{errors.field.message}</p>}`

## API Error Handling

- Use `axios.isAxiosError(error)` for type narrowing
- 400 response: parse `error.response.data.message` (string[])
- Non-400 errors: show generic fallback message

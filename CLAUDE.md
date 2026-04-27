# io-shared-libs

Internal company SDK monorepo. Single source of truth for shared libraries used across microservices.

## Stack

- **Runtime:** Node.js 20+ (native `fetch`, `crypto.randomUUID`, `AbortSignal.any`)
- **Language:** TypeScript 5.x — strict mode, NodeNext module resolution
- **Monorepo:** pnpm Workspaces + Turborepo
- **Bundler:** tsup (ESM + CJS dual output)
- **Testing:** Jest 29 + ts-jest + jest-mock-extended

## Packages

| Package | Purpose |
|---|---|
| `@io-shared/http-client` | Native fetch wrapper — Priority 1 |
| `@io-shared/logger` | ILogger interface stub |
| `@io-shared/shared-configs` | Shared tsconfig, eslint, jest base |

## Commands

```bash
pnpm install                  # Install all workspace deps
pnpm turbo build              # Build all packages
pnpm turbo test               # Run all tests with coverage
pnpm turbo typecheck          # Type-check all packages
pnpm turbo lint               # Lint all packages
pnpm turbo clean              # Remove dist/ and coverage/

# Per-package (from repo root)
pnpm --filter @io-shared/http-client build
pnpm --filter @io-shared/http-client test
```

## Architecture: http-client

Clean/Hexagonal architecture. Consumers depend on the `IHttpClient` interface (the port), never on `HttpClient` directly.

```
IHttpClient (port)
    └── HttpClient (adapter)
            ├── InterceptorManager  → async reduce pipeline
            ├── withRetry           → exponential backoff, pure fn
            ├── validateUrl         → HTTPS enforcement
            └── parseResponse       → content-type aware JSON/text/binary
```

**Request flow:**
1. `validateUrl` — blocks non-HTTPS
2. `runRequestInterceptors` — CorrelationId always first, then Auth, then custom
3. `AbortController` — timeout via `setTimeout` + `AbortSignal.any()`
4. `fetch` — raw call
5. Error normalization → `ClientError` (4xx), `ServerError` (5xx), `NetworkError`, `TimeoutError`
6. `parseResponse` — auto JSON/text/binary
7. `runResponseInterceptors`
8. `withRetry` wraps steps 2–7

## Code Conventions

### ESM imports — always use `.js` extension
TypeScript NodeNext resolves `.js` → `.ts` at compile time:
```ts
// Correct
import { HttpError } from './errors/http.error.js';
// Wrong
import { HttpError } from './errors/http.error';
```

### Error classes — always call `Object.setPrototypeOf`
Required for correct `instanceof` across ESM/CJS module boundaries:
```ts
constructor(...) {
  super(message);
  Object.setPrototypeOf(this, new.target.prototype);
}
```

### Interceptors — always return new objects, never mutate
```ts
onRequest(request: InternalRequest): InternalRequest {
  return { ...request, headers: { ...request.headers, 'X-Foo': 'bar' } };
}
```

### Mocking in tests — use `jest-mock-extended`
```ts
import { mock } from 'jest-mock-extended';
const client = mock<IHttpClient>();
```

### Retry tests — use fake timers
```ts
jest.useFakeTimers();
// ...
await jest.runAllTimersAsync();
```

## Zero Runtime Dependencies

`packages/http-client` has **no `dependencies`** field. All deps are `devDependencies`. Never add a runtime dependency — use Node.js 20 built-ins instead.

## Security Rules

- All URLs must use `https:` — `validateUrl()` throws on any other protocol
- `X-Correlation-ID` is injected automatically on every request via `CorrelationInterceptor`
- Never log request bodies — they may contain PII or credentials

## Gotchas

- `withInterceptor()` returns a **new** `HttpClient` instance (immutable). The constructor always prepends `CorrelationIdInterceptor`, so pass `interceptors.slice(1)` to avoid doubling it.
- `AbortSignal.any()` requires Node 20.3+. There is a fallback for older versions in `executeRequest`.
- Jest runs via `ts-jest` with CommonJS transform (`tsconfig.jest.json`). The `moduleNameMapper` in `jest.base.config.cjs` maps `.js` imports to `.ts` source at test time.
- `turbo.json` pipelines use precise `inputs` arrays — edit them if you add new config files that affect build output.

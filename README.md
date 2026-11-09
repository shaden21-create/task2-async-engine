# Fault-Tolerant Async Data Engine

A TypeScript engine that queries several public API endpoints at the same time with
`Promise.allSettled()`, maps the untyped JSON into strict domain interfaces (no `any`),
and keeps going when an endpoint fails.

## Run it

```bash
npm install
npm run build
npm start              # fetch + benchmark with the default thread pool
npm run bench:default  # UV_THREADPOOL_SIZE=4
npm run bench:8        # UV_THREADPOOL_SIZE=8
```

Requires Node 18+ (native `fetch`).

## How it works

- `tsconfig.json` is strict: `strict`, `noImplicitAny`, `strictNullChecks`,
  `useUnknownInCatchVariables` and `noUncheckedIndexedAccess` are all on.
- `http.ts` wraps native `fetch` with a 5 s timeout and throws `HttpError` on non-2xx.
- API responses are typed `unknown` and checked with type guards (`guards.ts`)
  before the mappers (`mappers.ts`) build `User`, `Post`, `Todo` and `Album` objects.
  Malformed records are skipped and counted.
- `engine.ts` starts every request at once with `Promise.allSettled`. A rejected
  request becomes a logged failure and an empty array, so the other endpoints
  still return data.
- The albums endpoint is deliberately broken (404) to demonstrate this.

## Example output

```
✔ users: 100 records
✔ posts: 100 records
✔ todos: 100 records
✘ albums: HTTP 404 Not Found for https://dummyjson.com/albums
Failures: 1
```

## Bonus: UV_THREADPOOL_SIZE

`fetch` does not use libuv's thread pool (network I/O uses OS-level async sockets),
so the variable doesn't change HTTP speed. It does change CPU-heavy work that runs
on the pool, so the benchmark hashes 16 values with `pbkdf2` (3 rounds, averaged)
on an 8-core Mac.

| Thread pool size | Run 1 | Run 2 | Run 3 | Mean |
|---|---|---|---|---|
| 4 (default) | 285 ms | 360 ms | 278 ms | 308 ms |
| 8 | 256 ms | 246 ms | 243 ms | 248 ms |

About 19% faster with 8 threads. The gain is smaller than the 2x that 16 jobs
(4 waves vs 2 waves) would suggest. Likely reasons: the machine's cores are not all
equally fast, other processes share the CPU, and run-to-run noise.

## Network note

My first endpoint choice (jsonplaceholder.typicode.com) loaded in the browser but
reset every connection from `curl` and Node on my network (`ECONNRESET` during the
TLS handshake). The engine logged all four failures and exited cleanly, which is the
behavior it is designed for. I then switched to dummyjson.com.
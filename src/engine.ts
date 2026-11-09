import { performance } from "node:perf_hooks";
import { albumsEndpoint, postsEndpoint, todosEndpoint, usersEndpoint } from "./endpoints";
import { HttpError, PayloadError } from "./errors";
import { fetchJson } from "./http";
import { isRecord } from "./guards";
import type { EngineResult, Endpoint, EndpointFailure } from "./types";

async function fetchCollection<T>(endpoint: Endpoint<T>): Promise<T[]> {
  const body = await fetchJson(endpoint.url);

  if (!isRecord(body)) {
    throw new PayloadError(endpoint.url, "Expected a JSON object");
  }

  const container = body[endpoint.rowsKey];
  if (!Array.isArray(container)) {
    throw new PayloadError(endpoint.url, `Expected "${endpoint.rowsKey}" to be an array`);
  }

  const rows: readonly unknown[] = container;
  const items: T[] = [];
  let dropped = 0;

  for (const raw of rows) {
    const mapped = endpoint.mapItem(raw);
    if (mapped === null) {
      dropped++;
    } else {
      items.push(mapped);
    }
  }

  if (dropped > 0) {
    console.warn(`⚠ ${endpoint.name}: dropped ${dropped} malformed record(s)`);
  }
  return items;
}

function describeError(reason: unknown): string {
  if (reason instanceof HttpError || reason instanceof PayloadError) {
    return reason.message;
  }
  if (reason instanceof Error) {
    if (reason.name === "TimeoutError") return "request timed out";
    const cause = reason.cause;
    return cause instanceof Error ? `${reason.message} (${cause.message})` : reason.message;
  }
  return String(reason);
}

function settle<T>(
  name: string,
  result: PromiseSettledResult<T[]>,
  failures: EndpointFailure[],
): T[] {
  if (result.status === "fulfilled") {
    console.log(`✔ ${name}: ${result.value.length} records`);
    return result.value;
  }
  const reason = describeError(result.reason);
  failures.push({ endpoint: name, reason });
  console.error(`✘ ${name}: ${reason}`);
  return [];
}

export async function runEngine(): Promise<EngineResult> {
  const start = performance.now();
  const failures: EndpointFailure[] = [];

  // All four requests start immediately and run concurrently.
  const [users, posts, todos, albums] = await Promise.allSettled([
    fetchCollection(usersEndpoint),
    fetchCollection(postsEndpoint),
    fetchCollection(todosEndpoint),
    fetchCollection(albumsEndpoint),
  ]);

  return {
    users: settle("users", users, failures),
    posts: settle("posts", posts, failures),
    todos: settle("todos", todos, failures),
    albums: settle("albums", albums, failures),
    failures,
    durationMs: performance.now() - start,
  };
}
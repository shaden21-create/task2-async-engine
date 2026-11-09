import { HttpError } from "./errors";

export async function fetchJson(url: string, timeoutMs = 5000): Promise<unknown> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new HttpError(url, response.status, response.statusText);
  }

  const body: unknown = await response.json();
  return body;
}
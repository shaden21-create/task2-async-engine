import { pbkdf2 } from "node:crypto";
import { availableParallelism } from "node:os";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);

export interface BenchmarkResult {
  threadPoolSize: string;
  cpuCores: number;
  jobs: number;
  roundsMs: number[];
  averageMs: number;
}

export async function runCryptoBenchmark(
  inputs: string[],
  jobs = 16,
  rounds = 3,
  iterations = 300_000,
): Promise<BenchmarkResult> {
  // A fixed number of jobs, so every run does exactly the same work.
  const labels = Array.from({ length: jobs }, (_, i) => {
    return inputs[i % inputs.length] ?? `fallback-${i}`;
  });

  const roundsMs: number[] = [];

  for (let round = 0; round < rounds; round++) {
    const start = performance.now();
    // All jobs are queued at once; libuv runs them on its worker threads.
    await Promise.all(
      labels.map((label) => pbkdf2Async(label, "engine-salt", iterations, 64, "sha512")),
    );
    roundsMs.push(performance.now() - start);
  }

  const averageMs = roundsMs.reduce((sum, ms) => sum + ms, 0) / roundsMs.length;

  return {
    threadPoolSize: process.env["UV_THREADPOOL_SIZE"] ?? "4 (default)",
    cpuCores: availableParallelism(),
    jobs,
    roundsMs,
    averageMs,
  };
}
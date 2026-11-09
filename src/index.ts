import { runCryptoBenchmark } from "./benchmark";
import { runEngine } from "./engine";

async function main(): Promise<void> {
  console.log("=== Fault-Tolerant Async Data Engine ===\n");

  const result = await runEngine();

  console.log("\n--- Summary ---");
  console.log(`Users:    ${result.users.length}`);
  console.log(`Posts:    ${result.posts.length}`);
  console.log(`Todos:    ${result.todos.length}`);
  console.log(`Albums:   ${result.albums.length}`);
  console.log(`Failures: ${result.failures.length}`);
  console.log(`Fetch phase: ${result.durationMs.toFixed(0)} ms`);

  const firstUser = result.users[0];
  if (firstUser !== undefined) {
    console.log(`\nSample user: ${firstUser.name} <${firstUser.email}> from ${firstUser.city}`);
  }

  console.log("\n--- Heavy processing benchmark (pbkdf2 on the thread pool) ---");
  const bench = await runCryptoBenchmark(result.users.map((user) => user.email));
  console.log(`Thread pool size: ${bench.threadPoolSize} | CPU cores: ${bench.cpuCores}`);
  bench.roundsMs.forEach((ms, i) => {
    console.log(`  round ${i + 1}: ${bench.jobs} jobs in ${ms.toFixed(0)} ms`);
  });
  console.log(`  average: ${bench.averageMs.toFixed(0)} ms`);
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});
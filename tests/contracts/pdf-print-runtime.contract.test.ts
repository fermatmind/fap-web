import { expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

it("loads the per-release PDF secret through the production Next dotenv loader", () => {
  const root = mkdtempSync(path.join(tmpdir(), "pdf-next-env-"));
  const key = "a".repeat(64);
  try {
    writeFileSync(path.join(root, ".env.production.local"), `GOTENBERG_RESULT_PRINT_TOKEN_SECRET=${key}\n`, { mode: 0o600 });
    const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "production" };
    delete env.GOTENBERG_RESULT_PRINT_TOKEN_SECRET;
    const script = `const {loadEnvConfig}=require(require.resolve('@next/env',{paths:[require.resolve('next/package.json')]}));loadEnvConfig(process.argv[1],false,{info(){},error(){}});process.exit(process.env.GOTENBERG_RESULT_PRINT_TOKEN_SECRET===${JSON.stringify(key)}?0:1)`;
    const run = spawnSync(process.execPath, ["-e", script, root], { env, encoding: "utf8" });
    expect(run.status, run.stderr).toBe(0);
    expect(run.stdout).not.toContain(key);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

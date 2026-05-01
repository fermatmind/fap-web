import { spawnSync } from "node:child_process";

describe("generated output artifact hygiene", () => {
  it("keeps local generated output files out of source control", () => {
    const result = spawnSync("git", ["ls-files", "output"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("");
  });
});

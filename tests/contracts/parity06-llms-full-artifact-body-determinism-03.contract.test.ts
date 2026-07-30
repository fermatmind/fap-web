import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  resolveLlmsFullEntryGroups,
  type LlmsFullBuildProfile,
} from "@/app/llms-full.txt/route";

const ROOT = process.cwd();

type Entry = {
  path: string;
  title: string;
  summary?: string;
  faq?: Array<{ question: string; answer: string }>;
  nextSteps?: string[];
};

type EntryGroups = {
  personality: Entry[];
  topics: Entry[];
  articles: Entry[];
  guides: Entry[];
};

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function enumeratedGroups(): EntryGroups {
  return {
    personality: [{
      path: "/en/personality/intj-a",
      title: "INTJ-A",
      summary: "Backend personality enumeration summary.",
    }],
    topics: [{
      path: "/en/topics/mbti",
      title: "MBTI",
      summary: "Backend topic enumeration summary.",
    }],
    articles: [{
      path: "/en/articles/mbti-basics",
      title: "MBTI basics",
      summary: "Backend article enumeration summary.",
    }],
    guides: [{
      path: "/en/career/guides/career-planning",
      title: "Career planning",
      summary: "Backend career-guide enumeration summary.",
    }],
  };
}

function volatileEnrichedGroups(round: number): EntryGroups {
  const entries = enumeratedGroups();
  return Object.fromEntries(
    Object.entries(entries).map(([key, values]) => [
      key,
      values.map((entry) => ({
        ...entry,
        summary: `Volatile detail summary round ${round}.`,
        faq: [{ question: `Question ${round}?`, answer: `Answer ${round}.` }],
        nextSteps: [`Next step ${round}`],
      })),
    ])
  ) as EntryGroups;
}

async function resolve(
  profile: LlmsFullBuildProfile,
  round: number,
  loader = vi.fn(async () => volatileEnrichedGroups(round))
) {
  const enumerated = enumeratedGroups();
  const result = await resolveLlmsFullEntryGroups(profile, enumerated, loader);
  return { enumerated, loader, result };
}

describe("PARITY-06 llms-full artifact body determinism", () => {
  it("uses one backend/CMS enumeration snapshot without invoking volatile detail enrichment", async () => {
    const { enumerated, loader, result } = await resolve("artifact", 1);

    expect(loader).not.toHaveBeenCalled();
    expect(result).toBe(enumerated);
    expect(result.personality[0].summary).toBe("Backend personality enumeration summary.");
    expect(result.topics[0].summary).toBe("Backend topic enumeration summary.");
    expect(result.articles[0].summary).toBe("Backend article enumeration summary.");
    expect(result.guides[0].summary).toBe("Backend career-guide enumeration summary.");
    expect(JSON.stringify(result)).not.toContain("Volatile detail summary");
    expect(JSON.stringify(result)).not.toContain("Question 1?");
    expect(JSON.stringify(result)).not.toContain("Next step 1");
  });

  it("preserves public runtime best-effort detail enrichment", async () => {
    const { enumerated, loader, result } = await resolve("runtime", 2);

    expect(loader).toHaveBeenCalledTimes(1);
    expect(result).not.toBe(enumerated);
    expect(result.personality[0].summary).toBe("Volatile detail summary round 2.");
    expect(result.articles[0].faq).toHaveLength(1);
    expect(result.topics[0].nextSteps).toEqual(["Next step 2"]);
  });

  it("keeps three artifact snapshots identical when detail timing or payloads would differ", async () => {
    const rounds = await Promise.all([1, 2, 3].map(async (round) => {
      const loader = vi.fn(async () => {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 4 - round));
        return volatileEnrichedGroups(round);
      });
      const result = await resolveLlmsFullEntryGroups("artifact", enumeratedGroups(), loader);
      expect(loader).not.toHaveBeenCalled();
      return {
        body_sha256: hash(result),
        url_set_sha256: hash(
          Object.values(result).flat().map((entry) => entry.path).sort()
        ),
      };
    }));

    expect(new Set(rounds.map((round) => round.body_sha256))).toHaveLength(1);
    expect(new Set(rounds.map((round) => round.url_set_sha256))).toHaveLength(1);
  });

  it("keeps artifact selection ahead of all four runtime-only enrichment maps", () => {
    const route = fs.readFileSync(path.join(ROOT, "app/llms-full.txt/route.ts"), "utf8");
    const selection = route.indexOf("resolveLlmsFullEntryGroups(");
    const personality = route.indexOf("enrichPersonalityEntry(entry, siteUrl)", selection);
    const topic = route.indexOf("enrichTopicEntry(entry, siteUrl)", selection);
    const article = route.indexOf("enrichArticleEntry(entry, siteUrl)", selection);
    const guide = route.indexOf("enrichCareerGuideEntry(entry, siteUrl)", selection);

    expect(selection).toBeGreaterThanOrEqual(0);
    expect(personality).toBeGreaterThan(selection);
    expect(topic).toBeGreaterThan(selection);
    expect(article).toBeGreaterThan(selection);
    expect(guide).toBeGreaterThan(selection);
    expect(route).not.toContain("LLMS_FULL_ARTIFACT_ENRICHMENT_TIMEOUT_MS");
    expect(route).not.toContain("LLMS_FULL_ARTIFACT_ENRICHMENT_CONCURRENCY");
  });
});

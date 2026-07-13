import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { NextRequest } from "next/server";
import * as testing from "next/experimental/testing/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { config, proxy } from "@/proxy";
import { getSiteUrlOrThrow } from "@/lib/site";
import { renderPersonalitySections } from "@/lib/cms/personality-sections";
import type { CmsPersonalitySection } from "@/lib/cms/personality";
import { isSecurity122Web16AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

function read(relPath: string): string {
  return readFileSync(path.join(ROOT, relPath), "utf8");
}

function git(args: string[]): string {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function tryGit(args: string[]): string | null {
  try {
    return git(args);
  } catch {
    return null;
  }
}

function committedDiffOutput(): string {
  const candidateRefs =
    process.env.GITHUB_ACTIONS === "true"
      ? ["HEAD^1...HEAD", "origin/main...HEAD", "main...HEAD"]
      : ["origin/main...HEAD", "main...HEAD", "HEAD^1...HEAD"];

  for (const ref of candidateRefs) {
    const output = tryGit(["diff", "--name-only", ref]);
    if (output !== null) {
      return output;
    }
  }

  if (process.env.GITHUB_ACTIONS === "true") {
    return "";
  }

  throw new Error(`Unable to resolve a committed diff base from: ${candidateRefs.join(", ")}`);
}

function cmsSection(overrides: Partial<CmsPersonalitySection>): CmsPersonalitySection {
  return {
    sectionKey: "v8_5_module_08_career_workflow",
    title: "Career workflow",
    renderVariant: "rich_text",
    bodyMd: "这段 CMS 正文必须保留。",
    bodyHtml: "",
    payloadJson: null,
    sortOrder: 100,
    isEnabled: true,
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("SECURITY-122-WEB-16 public UI route and config guards", () => {
  it("keeps the MBTI career bridge CTA visibly styled on the light result card", () => {
    const layout = read("app/(root)/layout.tsx");
    const css = read("app/mbti-career-cta.css");
    const ctaRule = css.match(/\[data-testid="mbti-career-next-step-cta"\]\s*\{[\s\S]*?\}/)?.[0] ?? "";
    const ctaFocusRule =
      css.match(/\[data-testid="mbti-career-next-step-cta"\]:focus-visible\s*\{[\s\S]*?\}/g)?.at(-1) ?? "";

    expect(layout).toContain('import "../mbti-career-cta.css"');
    expect(ctaRule).toContain("display: inline-flex");
    expect(ctaRule).toContain("background: #047857");
    expect(ctaRule).toContain("color: #ffffff !important");
    expect(ctaRule).toContain("text-decoration: none");
    expect(ctaFocusRule).toContain("outline: 2px solid #047857");
  });

  it("keeps Chinese V8.5 workflow labels localized even when CMS titles are English", () => {
    const source = read("lib/cms/personality-sections.tsx");

    expect(source).toContain('v8_5_module_08_career_workflow: { zh: "工作、职业和协作方式"');
    expect(source).toContain('v8_5_module_08_career_workflow: { zh: "职业匹配观察"');

    render(
      <div>
        {renderPersonalitySections(
          [
            cmsSection({
              sectionKey: "v8_5_module_08_career_workflow",
              title: "Career workflow",
              bodyMd:
                "第一段说明工作和协作方式。\n\n第二段保留正文。\n\n第三段保留上下文。\n\n第四段保留场景。\n\n第五段保留信号。\n\n第六段保留观察入口。",
            }),
            cmsSection({
              sectionKey: "v8_5_work_decision",
              title: "Work decision scenario",
              bodyMd: "工作决策正文。",
            }),
            cmsSection({
              sectionKey: "v8_5_relationship_communication",
              title: "Relationship and communication",
              bodyMd: "关系沟通正文。",
            }),
            cmsSection({
              sectionKey: "v8_5_pressure_growth",
              title: "Pressure and growth",
              bodyMd: "压力成长正文。",
            }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("工作、职业和协作方式")).toBeInTheDocument();
    expect(screen.getByText("工作决策场景")).toBeInTheDocument();
    expect(screen.getByText("关系与沟通场景")).toBeInTheDocument();
    expect(screen.getByText("压力与成长")).toBeInTheDocument();
    const renderedText = document.body.textContent ?? "";
    expect(renderedText).not.toContain("Career workflow");
    expect(renderedText).not.toContain("Work decision scenario");
    expect(renderedText).not.toContain("Relationship and communication");
  });

  it("keeps proxy coverage complete for bot-visible probes and locale redirect roots", () => {
    for (const url of ["/robots.txt", "/sitemap.xml", "/llms.txt", "/llms-full.txt", "/articles", "/career", "/topics", "/personality"]) {
      expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), url).toBe(true);
    }

    expect(testing.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/_next/static/app.js" })).toBe(false);

    const response = proxy(
      new NextRequest("https://fermatmind.com/articles?utm=bot-probe", {
        headers: {
          "user-agent": "Googlebot/2.1",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        },
      })
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://fermatmind.com/zh/articles?utm=bot-probe");
  });

  it("fails closed for malformed production NEXT_PUBLIC_SITE_URL values instead of returning localhost-like fallbacks", () => {
    vi.stubEnv("NODE_ENV", "production");

    for (const value of ["localhost:3000", "https://", "ftp://fermatmind.com", "not a url"]) {
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", value);
      expect(() => getSiteUrlOrThrow(), value).toThrow(/production absolute HTTP\(S\) URL/);
    }
  });

  it("keeps the current PR diff inside the public UI route and config guard scope", () => {
    const committedOutput = committedDiffOutput();
    const workingTreeOutput = git(["diff", "--name-only"]);
    const untrackedOutput = git(["ls-files", "--others", "--exclude-standard"]);
    const files = Array.from(
      new Set(
        `${committedOutput}\n${workingTreeOutput}\n${untrackedOutput}`
          .split("\n")
          .map((file) => file.trim())
          .filter(Boolean)
      )
    );

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(files.length).toBeGreaterThan(0);
    expect(files.every((file) => isSecurity122Web16AllowedFile(file)), files.join("\n")).toBe(true);
  });
});

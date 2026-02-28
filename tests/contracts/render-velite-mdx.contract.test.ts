import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getBlogPostBySlug } from "@/lib/content";
import { renderVeliteMdx } from "@/lib/content/renderVeliteMdx";

describe("renderVeliteMdx contract", () => {
  it("returns null for empty body", () => {
    expect(renderVeliteMdx("")).toBeNull();
    expect(renderVeliteMdx("   ")).toBeNull();
  });

  it("safely returns null for malformed body", () => {
    expect(renderVeliteMdx("this is not executable js")).toBeNull();
  });

  it("renders compiled velite body from real content", () => {
    const post = getBlogPostBySlug("mbti-basics", "zh");
    expect(post).not.toBeNull();

    const node = renderVeliteMdx(post!.body);
    expect(node).not.toBeNull();
    expect(renderToStaticMarkup(node as Parameters<typeof renderToStaticMarkup>[0])).toContain("这项测评在做什么");
  });
});

import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { buildContentPageTraditional } = require("../../scripts/i18n/content-page-zh-tw.mjs");
const source = () => ({
  slug: "about", locale: "zh-CN", status: "published", is_public: true, is_indexable: true,
  title: "关于费马测试", summary: "软件与职业兴趣不是能力。", content_html: "",
  content_md: "## 我们\n\n- 软件、内存和视频\n- 不保证职业适配；93题，{{name}}，https://example.com/关于/1。",
  headings: ["我们"], faq_items: [{ question: "能判断能力吗？", answer: "不能。兴趣不是能力。" }],
});

describe("offline CMS Traditional candidate", () => {
  it("converts complete reader fields with structure and protected literals intact", () => {
    const input = source(), before = structuredClone(input);
    const candidate = buildContentPageTraditional(input);
    expect(input).toEqual(before);
    expect(candidate.fields.title).toBe("關於費馬測試");
    expect(candidate.fields.summary).toBe("軟體與職業興趣不是能力。");
    expect(candidate.fields.content_md).toContain("軟體、記憶體和影片");
    expect(candidate.fields.content_md).toContain("93題，{{name}}，https://example.com/关于/1。");
    expect(candidate.fields.faq_items[0].answer).toBe("不能。興趣不是能力。");
    expect(candidate.fields).not.toHaveProperty("is_public");
    expect(candidate.fields).not.toHaveProperty("status");
    expect(candidate.fields).not.toHaveProperty("slug");
    expect(candidate.state).toContain("requires_native_source_revision_binding");
  });

  it("reuses unchanged units and changes only affected field hashes", () => {
    const first = buildContentPageTraditional(source());
    expect(buildContentPageTraditional(source(), first)).toEqual(first);
    const next = buildContentPageTraditional({ ...source(), summary: "新的说明。" }, first);
    expect(next.units.title).toEqual(first.units.title);
    expect(next.units.summary.sourceHash).not.toBe(first.units.summary.sourceHash);
    expect(next.sourceProjectionHash).not.toBe(first.sourceProjectionHash);
  });

  it.each(["[说明](/关于)", "```js\nconst 标识 = 1;\n```", "<p>正文</p>", "![图片](/图片.png)", "| 表格 |"])("rejects unsupported rich format without corrupting it: %s", body => {
    expect(() => buildContentPageTraditional({ ...source(), content_md: body })).toThrow("MARKDOWN_FORMAT_UNSUPPORTED");
  });

  it("rejects non-public sources and HTML rather than translating their entire JSON", () => {
    expect(() => buildContentPageTraditional({ ...source(), is_public: false })).toThrow("SOURCE_INVALID");
    expect(() => buildContentPageTraditional({ ...source(), content_html: "<p>正文</p>" })).toThrow("SOURCE_INVALID");
  });
});

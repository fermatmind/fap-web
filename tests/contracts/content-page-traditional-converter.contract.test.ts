import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { buildContentPageTraditional, convertTraditionalMarkdown } = require("../../scripts/i18n/content-page-zh-tw.mjs");
const source = () => ({
  slug: "about", locale: "zh-CN", status: "published", is_public: true, is_indexable: true,
  title: "关于费马测试", summary: "软件与职业兴趣不是能力。", content_html: "",
  content_md: "## 我们\n\n- 软件、内存和视频\n- 不保证职业适配；93题，{{name}}，https://example.com/关于/1。",
  headings: ["我们"], faq_items: [{ question: "能判断能力吗？", answer: "不能。兴趣不是能力。" }],
});

describe("offline CMS Traditional candidate", () => {
  it("preserves opted-in link spacing and full targets without broadening the CMS default", () => {
    const input = "[软件说明]( /关于?地区=中国#说明 )，[软件](\thttps://example.com/软件\t)";
    expect(convertTraditionalMarkdown(input, { allowLinkSpacing: true })).toBe("[軟體說明]( /关于?地区=中国#说明 )，[軟體](\thttps://example.com/软件\t)");
    expect(() => convertTraditionalMarkdown(input)).toThrow("MARKDOWN_FORMAT_UNSUPPORTED");
    expect(() => convertTraditionalMarkdown("[说明]( javascript:alert )", { allowLinkSpacing: true })).toThrow("MARKDOWN_FORMAT_UNSUPPORTED");
  });

  it("converts explicitly selected Markdown table text while preserving layout and full link targets", () => {
    const input = "## 软件说明\n\n| 软件 | 说明 |\n| :--- | ---: |\n| [视频](/关于?地区=中国#说明) | 93题，{{name}}，${value} |\n\n- 兴趣不是能力。";
    const target = convertTraditionalMarkdown(input, { allowTables: true });
    expect(target).toBe("## 軟體說明\n\n| 軟體 | 說明 |\n| :--- | ---: |\n| [影片](/关于?地区=中国#说明) | 93題，{{name}}，${value} |\n\n- 興趣不是能力。");
    expect(() => convertTraditionalMarkdown(input)).toThrow("MARKDOWN_FORMAT_UNSUPPORTED");
    expect(() => buildContentPageTraditional({ ...source(), content_md: input })).toThrow("MARKDOWN_FORMAT_UNSUPPORTED");
  });

  it.each([
    "| 软件 | 说明 |",
    "| 软件 | 说明 |\n| --- |\n| 视频 | 1 |",
    "| 软件 | 说明 |\n| --- | --- |\n| 视频 | 1 | 2 |",
    "| 软件 | 说明 |\n| --- | --- |\n| 视频 | 1",
    "| 软件 | 说明 |\n| --- | --- |\n| 视频\\|图像 | 1 |",
  ])("rejects malformed or unsupported tables without authoring a replacement: %s", input => {
    expect(() => convertTraditionalMarkdown(input, { allowTables: true })).toThrow("MARKDOWN_TABLE_UNSUPPORTED");
  });

  it.each(["<p>正文</p>", "```js\nconst value = 1;\n```", "![图片](/image.png)", "[说明](javascript:alert)", "[说明](/broken"])("keeps rich-format rejection when tables are enabled: %s", input => {
    expect(() => convertTraditionalMarkdown(input, { allowTables: true })).toThrow("MARKDOWN_FORMAT_UNSUPPORTED");
  });

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

  it("preserves domestic storage and account closure without rewriting protected literals", () => {
    const input = {
      ...source(), slug: "privacy",
      title: "中国境内存储与跨境提供",
      summary: "注销账号或账号注销，不是退出登录；软件内存仍指设备内存。",
      seo_description: "保留 `注销账号` 与 {{账号注销}}。",
      content_md: "## 中国境内存储\n\n- 注销账号后，按原规则处理。\n- 账号注销与退出登录不同。\n- https://example.com/注销账号/123 {{账号注销}} ${境内存储} 14 个月",
      headings: ["中国境内存储"],
      faq_items: [{ question: "如何注销账号？", answer: "账号注销不是退出登录。" }],
    };
    const before = structuredClone(input), candidate = buildContentPageTraditional(input);
    expect(input).toEqual(before);
    expect(candidate.fields.title).toBe("中國境內儲存與跨境提供");
    expect(candidate.fields.summary).toBe("註銷帳號或帳號註銷，不是退出登入；軟體記憶體仍指裝置記憶體。");
    expect(candidate.fields.headings).toEqual(["中國境內儲存"]);
    expect(candidate.fields.seo_description).toBe("保留 `注销账号` 與 {{账号注销}}。");
    expect(candidate.fields.faq_items[0]).toEqual({ question: "如何註銷帳號？", answer: "帳號註銷不是退出登入。" });
    expect(candidate.fields.content_md).toContain("https://example.com/注销账号/123 {{账号注销}} ${境内存储} 14 個月");
    expect(candidate.fields.content_md).not.toContain("境記憶體儲");
    const stale = structuredClone(candidate);
    stale.units.title = { sourceHash: "old-glossary", text: "中國境記憶體儲" };
    expect(buildContentPageTraditional(input, stale)).toEqual(candidate);
  });

  it.each(["[说明](javascript:alert)", "[说明](/broken", "[说明](//example.com)", "```js\nconst 标识 = 1;\n```", "<p>正文</p>", "![图片](/图片.png)", "| 表格 |"])("rejects unsupported rich format without corrupting it: %s", body => {
    expect(() => buildContentPageTraditional({ ...source(), content_md: body })).toThrow("MARKDOWN_FORMAT_UNSUPPORTED");
  });

  it("translates reviewed link labels while preserving full Unicode paths, queries, fragments and mail targets", () => {
    const content_md = "[价格与报告内容](/zh/pricing)；[支持中心](/zh/support)；[support@fermatmind.com](mailto:support@fermatmind.com)；[软件说明](/关于?地区=中国#说明)";
    const result = buildContentPageTraditional({ ...source(), content_md });
    expect(result.fields.content_md).toBe("[價格與報告內容](/zh/pricing)；[支援中心](/zh/support)；[support@fermatmind.com](mailto:support@fermatmind.com)；[軟體說明](/关于?地区=中国#说明)");
    expect(buildContentPageTraditional({ ...source(), content_md }, result)).toEqual(result);
  });

  it("rejects non-public sources and HTML rather than translating their entire JSON", () => {
    expect(() => buildContentPageTraditional({ ...source(), is_public: false })).toThrow("SOURCE_INVALID");
    expect(() => buildContentPageTraditional({ ...source(), content_html: "<p>正文</p>" })).toThrow("SOURCE_INVALID");
  });
});

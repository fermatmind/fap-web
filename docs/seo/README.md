# SEO 工作流（Taskpack-1 模板化扩量 SOP）

本仓库的 SEO 落地页遵循：**URL 永久不变**、**可抓取 HTML**、**canonical 收口**、**私密页 noindex**。

---

## A. 新增一个量表（新增一个 slug）只做三件事

### Step A — 在 slugs.md 追加 slug（先写表再做页面）
文件：`docs/seo/slugs.md`

- 追加一行：`| <slug> | <focus keyword> | <category> | <entity> | <date> | planning | ... |`
- slug 规则：全小写、用 `-` 分隔、不要版本号、不要动态 id。

---

### Step B — 新增一个 landing meta 文件
目录：`content/landing/`

- 复制模板：`personality-mbti-test.json`
- 改成新文件：`<slug>.json`
- 至少填这些字段（用于 /test/{slug} 渲染与 SEO）：
  - `h1_title`
  - `executive_summary`
  - `intro`
  - `faq_list`（3–5 组，q 用搜索词写法）
  - `table`（原生 <table> 友好）
  - `cta`（primary 指向 `/test/<slug>/take`）

---

### Step C — 本地验收（必须可抓取）
启动：
- `npm run dev`
- 打开：`http://localhost:3000/test/<slug>`
- 再打开：`http://localhost:3000/test/<slug>/take`

验收硬点（用 View Source，不看 Elements）：
- `/test/<slug>` 源码能看到：`<h1>`、`<h2>`、FAQ 的 `<h3>`、原生 `<table>` 文本
- `/test/<slug>` 头部 canonical 正确（无参数 URL）
- `/test/<slug>/take` 头部 robots 为 `noindex, nofollow`（可带 nocache）

---

## B. 证据包（每个量表都要 4 张图）

路径：
- `docs/seo/evidence/<slug>/`

命名固定：
1. `1-landing.png`：页面截图（能看到 H1、导读、FAQ、table、CTA）
2. `2-view-source.png`：View Source 截图（能看到 h1/h2/h3/table 文本）
3. `3-canonical.png`：View Source 搜索 canonical 的截图（href 正确）
4. `4-take-noindex.png`：take 页 View Source 搜索 robots 的截图（noindex, nofollow）

提交建议：
- `feat(seo): evidence for <slug>`
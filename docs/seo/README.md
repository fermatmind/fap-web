cd ~/Desktop/GitHub/fap-web
cat > docs/seo/README.md <<'EOF'
# SEO 工作流（Taskpack-1 模板化扩量 SOP）

本仓库的 SEO 落地页遵循：**URL 永久不变**、**可抓取 HTML**、**canonical 收口**、**私密页 noindex**。

> 关键原则：**可收录页面 = /test/{slug}**（SSR/SSG 输出 HTML）；其它页面默认不收录（take/result/share 等）。

---

## A. 新增一个量表（新增一个 slug）只做三件事

### Step A — 在 slugs.md 追加 slug（先登记再开发）
文件：`docs/seo/slugs.md`

- 在 “已上线 Slug 资产台账”表里新增一行（规划阶段可先用 `planning`）。
- slug 规则：全小写、用 `-` 分隔、不要版本号、不要动态 id。
- **必须与 meta 文件同名**：你写的 slug = 你要创建的 `<slug>.json` 文件名。

> 提醒：如果历史存在短 slug（例如 `/test/mbti`），要在 slugs.md 的 alias 表里登记，并明确 `301 -> 主 slug`。

---

### Step B — 新增一个 landing meta 文件（复制模板即可）
目录：`content/landing/`

- 复制模板：`personality-mbti-test.json`
- 改成新文件：`<slug>.json`
- 最小必填字段（用于 /test/{slug} 渲染与 SEO）：
  - `slug`
  - `h1_title`
  - `executive_summary`（80–120 字，紧跟 H1 的导读块）
  - `intro`
  - `faq_list`（3–5 组，q 用“搜索词写法”）
  - `table`（原生 `<table>` 友好）
  - `cta.primary.href`（必须指向 `/test/<slug>/take`）
  - `seo.seo_title` / `seo.seo_description` / `seo.seo_keywords` / `seo.canonical_path`

---

### Step C — 本地验收（必须可抓取、可收口）
启动：
- `npm run dev`
- 打开：`http://localhost:3000/test/<slug>`
- 再打开：`http://localhost:3000/test/<slug>/take`

验收硬点（用 View Source，不看 Elements）：

1) `/test/<slug>` 页面源码必须直接看到：
- `<h1>`（唯一）
- `<h2>`（简介/理论背景、FAQ、表格区）
- FAQ 的 `<h3>`
- 原生 `<table>`（至少一张）

2) canonical 必须收口：
- `/test/<slug>?utm=xxx` 的 View Source 里 `<link rel="canonical">` 仍指向无参数 URL
- canonical 必须是**绝对 URL**（例如 `https://fermatmind.com/test/<slug>`）
  - 依赖 `app/layout.tsx` 的 `metadataBase`（不要删）

3) `/test/<slug>/take` 必须 noindex：
- take 页 View Source 中 `<meta name="robots" content="noindex, nofollow">`（可带 nocache）

---

## B. 证据包（每个量表都要 4 张图）

路径：
- `docs/seo/evidence/<slug>/`

命名固定（不要改）：
1. `1-landing.png`：页面截图（能看到 H1、导读、FAQ、table、CTA）
2. `2-view-source.png`：View Source 截图（能看到 h1/h2/h3/table 文本）
3. `3-canonical.png`：View Source 搜索 canonical 的截图（href 正确、无参数、绝对 URL）
4. `4-take-noindex.png`：take 页 View Source 搜索 robots 的截图（noindex, nofollow）

提交建议：
- `feat(seo): evidence for <slug>`

---

## C. 快速排错（常见问题）

- **View Source 看不到正文，只看到一堆脚本**：说明页面不是 SSR/SSG 输出，SEO 不成立。
- **canonical 变成相对路径**：检查 `app/layout.tsx` 的 `metadataBase` 是否被删/写错。
- **take 页被收录风险**：检查 take 页是否明确设置 robots noindex。
EOF
# docs/seo/url-strategy.md

# URL 策略与抓取规范（Stage 2 / fap-web）
目标：确保 SEO 权重长期沉淀（URL 永久不变、权重不分散）、GEO 可被 AI 引擎稳定理解（结构化输出可提取），并防止流量起量后因爬虫抓取配额、重复内容与性能问题导致返工。

---

## 1. 永久路由（Permanent URL Strategy）

### 1.1 Index 页面（允许收录）
- `/test/{slug}`
  - 说明：量表落地页（Landing Page），唯一可收录的“量表入口页”
  - 索引：**index**
  - Canonical：**必须指向无参数原始 URL（完整 https:// 协议）**

- `/tests`（可选）
  - 说明：量表列表页/分类入口（站内枢纽页）
  - 索引：**index**（推荐）

### 1.2 Non-index 页面（禁止收录 / 防重复内容）
- `/test/{slug}/take`
  - 说明：答题页（可能是 SPA、交互复杂、内容重复）
  - 索引：**noindex**
  - Robots：Disallow

- `/result/{uuid}`
  - 说明：私密结果页（用户隐私）
  - 索引：**noindex**
  - Robots：Disallow

- `/share/{share_id}`
  - 说明：分享页（默认按隐私优先）
  - Stage 2 默认：**noindex + Disallow**
  - 若未来要放开收录：必须先完成“脱敏摘要策略”，并重新评审（见 6.4）

---

## 2. URL 与版本解耦（Version Decoupling）
原则：URL 永久稳定，内容版本变化由后端/配置消化，**不得体现在路径中**。

- ❌ 禁止：`/v1/test/mbti`、`/test/mbti-v1.2`、`/test/mbti?version=...` 的可收录变体
- ✅ 允许：
  - URL 固定：`/test/mbti`
  - 内容版本选择：
    - 默认读取“latest/production pack”
    - 灰度/实验可用 cookie/header/query 控制
  - 但：**任何带参数的访问必须 Canonical 回无参数 URL**

---

## 3. Canonical 规则（权重保护核心）

### 3.1 HTTPS 强制与 HSTS（Security/SEO Bundle）
- **强制 HTTPS**：所有 `http://` 请求必须 **301** 到 `https://`
- **Canonical 必须包含完整协议**：禁止 `//domain.com/...` 省略协议写法，必须输出完整 `https://{domain}/...`
- **HSTS 建议开启**（由网关/CDN 配置）：
  - 建议长期启用 HSTS 以减少协议降级与重复收录风险（上线前确保全站 HTTPS 可用）
  - 注意：HSTS 是“强约束”，启用前必须确认子域名与证书策略一致

### 3.2 基本规则
- 所有落地页请求无论带任何参数：
  - `/test/mbti?utm_source=wechat`
  - `/test/mbti?src=ad&ver=b`
- 页面 `<head>` 中都必须输出：
  - `canonical = https://{domain}/test/mbti`（无参数原地址，完整 https:// 协议）

### 3.3 重定向链条约束
- 禁止出现多重重定向链：`A -> B -> C`
- 必须一次到位：`A -> C`
- 任何 slug 改名必须保持旧 slug 301 直达新 slug，避免权重损耗。

---

## 4. 抓取与渲染规范（Anti-bot & Mobile SEO）

### 4.1 移动端适配声明（百度友好）
站点采用响应式布局（同一 URL 服务 PC + Mobile），所有 **index 页面** 必须包含：

- `<meta name="applicable-device" content="pc,mobile">`

目的：明确告诉百度蜘蛛无需 m. 二级域名跳转，主站权重集中。

### 4.2 Vary 头策略（可选增强）
- 若边缘/CDN 对 UA/Accept-Language 做差异化缓存，需确保：
  - 不产生“同 URL 不同内容导致索引混乱”
- 推荐实践（由网关/CDN 配置）：
  - 仅在确实按 UA 输出不同 HTML 时设置 `Vary: User-Agent`
  - 若仅是响应式 CSS，不建议开启 UA vary（减少缓存碎片）

### 4.3 爬虫限制（抓取配额保护）
- robots.txt 必须：
  - `Disallow: /test/*/take`
  - `Disallow: /result/`
  - `Disallow: /share/`（Stage 2 默认）
  - `Disallow: /api/`（后端接口不应被抓取）
- 目的：
  - 防止 `/take`、`/result`、`/api` 撑爆抓取配额
  - 防止重复内容影响收录质量

### 4.4 Web Vitals 性能阈值（Performance as SEO）
搜索排名（尤其移动端）高度依赖体验指标。对所有 **index 页面**（`/test/{slug}`、`/tests`）要求：

- **LCP ≤ 2.5s**（首屏最大内容渲染）
- **CLS ≤ 0.1**（避免布局跳动）
- **禁止首屏抖动布局**：
  - 首屏关键元素（H1、导读块、开始按钮、首屏主图/卡片）必须有固定尺寸/占位
  - 异步加载图片/广告必须预留高度（或使用骨架屏/占位容器）
- 目的：
  - 即使 URL 策略完美，若 CLS 过高仍会压低排名与点击体验

---

## 5. Sitemap 策略（只放“值得抓取”的页面）

### 5.1 sitemap.xml 收录范围（写死规则）
- **只允许**下列页面进入站点地图：
  - `/test/{slug}`（index 页面）
  - `/tests`（可选）
- 禁止进入 sitemap：
  - `/test/{slug}/take`
  - `/result/{uuid}`
  - `/share/{share_id}`
  - `/api/*`

### 5.2 更新频率建议（可写入 lastmod/changefreq）
- `/tests`：daily（或 weekly）
- `/test/{slug}`：weekly（内容更新不频繁）
- 若做白皮书：`/research/*` 可按 monthly（Stage 3）

---

## 6. 下线与错误码策略（避免索引污染 + 最快清理）

### 6.1 临时下线（可恢复）
场景：内容整改、合规审核、短期维护。

- 推荐策略：302 到 `/tests`（或维护页）
- 原因：告诉搜索引擎“这是暂时的”，避免永久移除索引。

### 6.2 永久删除（不可恢复）
场景：版权/合规原因永久下架量表。

- 推荐策略：返回 **410 Gone**（不要用 404）
- 原因：410 能让搜索引擎更快清理索引、减少长期无效抓取。

### 6.3 量表替换/迁移
场景：旧量表被新量表替代（内容结构变化但主题一致）。

- 旧 slug：301 到新 slug
- 保留期限：≥ 12 个月
- 禁止多跳：必须 old -> new 一跳完成

### 6.4 分享页（share）未来是否可收录的前置条件
Stage 2 默认 share noindex。若未来要开放收录，必须满足：
- 分享页不包含可识别个人信息
- 分享摘要内容足够丰富且不重复（避免“海量薄页”）
- 每个 share 页都有 canonical 策略（可讨论是否 canonical 到落地页）

---

## 7. 多语言路径预留（不返工）
未来全球化建议采用“语言前缀目录”：
- 国内默认：`/{lang?}/test/{slug}`（默认 zh 可省略）
- 海外：`/en/test/{slug}`

注意：
- Stage 2 可以只上线中文不带前缀：`/test/mbti`
- 但必须在架构层预留：将来加 `/en/` 不要求重构 slug 体系

---

## 8. 验收清单（打勾标准）
- [ ] `/test/mbti` 可访问、可渲染、可被收录（无 noindex）
- [ ] `/test/mbti?utm_source=xx` canonical 指向 `https://{domain}/test/mbti`（无参数、含 https://）
- [ ] HTTPS 强制：访问 `http://{domain}/test/mbti` 会 301 到 `https://{domain}/test/mbti`
- [ ] `/test/mbti` `<head>` 含 `applicable-device=pc,mobile`
- [ ] `/test/mbti/take`、`/result/*`、`/share/*` 均为 noindex 且 robots 禁抓
- [ ] sitemap.xml 仅包含 `/test/{slug}`（与 `/tests` 可选）
- [ ] 量表永久删除返回 410；临时下线 302 到 `/tests`
- [ ] 无抖动布局：落地页首屏关键元素有固定占位，CLS 不出现明显跳动（目标 CLS ≤ 0.1）
- [ ] 性能达标：index 页面 LCP 目标 ≤ 2.5s（移动端优先）
# MBTI 性格资产技术架构与权威边界

## 发布链路

```text
GSC query/page evidence
  -> fap-web asset package and semantic QA
  -> approval package with exact hashes
  -> fap-api import dry-run and authority storage
  -> fap-api public readmodels
  -> fap-web metadata/body/JSON-LD rendering
  -> indexability promotion
  -> sitemap + llms.txt + llms-full.txt release gate
  -> INDEX-24R read-only verification
  -> GSC submission and monitoring
```

每一箭头都是独立 gate。内容包完成不能自动进入 CMS，CMS 导入不能自动 index，indexable 不能自动提交 GSC。

## Authority matrix

| Surface | Authority | Consumer / validator |
| --- | --- | --- |
| Profile/Comparison 正文、FAQ、SEO 字段、sections、内链 | fap-api CMS/API | fap-web renderer、CMS-28/INDEX-24R |
| publication/indexability/robots/eligibility | fap-api effective state | fap-web metadata、sitemap/LLMS 枚举 |
| Comparison JSON-LD payload | fap-api public readmodel | fap-web 仅校验并渲染 |
| 页面 canonical/hreflang/meta 输出 | backend authority 经 fap-web 渲染 | INDEX-24R |
| sitemap/LLMS URL 集 | backend-authoritative enumeration | fap-web feeds、INDEX-24R |
| GSC impressions/clicks/query evidence | Google Search Console | OPS/GSC evidence package |
| 私人 result/attempt/report/order/payment | 非公开产品数据 | 永不进入 public enumeration |

## Effective indexability

Profile 和 Comparison 的公开状态不能只看单一字段。有效索引状态至少要求：

1. CMS/public record 为 public/published。
2. `is_indexable=true`。
3. 最终 SEO robots 不含 `noindex`。
4. sitemap 与 LLMS eligibility gate 已释放。
5. canonical、JSON-LD 与可见内容通过一致性验证。

任一条件失败时，readmodel、页面 robots、answer surface 和枚举必须 fail closed。`MBTI-CMS-28A` 将曾经分裂的
DB 状态和 variant robots 统一为 effective indexability，防止详情 API、目录 API 与页面互相矛盾。

## Frontend request model

Profile 页面曾由 metadata 和正文分别请求 detail/SEO，瞬时超时会产生并缓存 noindex shell。稳定模型为：

- 同一次渲染使用共享 authority bundle 去重。
- detail 与 SEO 分开处理；detail 成功时不因独立 SEO 请求失败而丢失正文。
- 只对 timeout、429、5xx 做一次有界重试；404 不重试。
- SEO 临时失败只能使用 detail 内已有的 backend SEO projection。
- detail 最终失败继续返回最小 noindex shell，不发明本地内容。

## Comparison schema model

- A/T 与 cross-type comparison 均由 fap-api 返回 `seo_meta`、`jsonld` 和 `seo_surface_v1`。
- fap-web 不创建 comparison FAQ/Breadcrumb fallback schema。
- JSON-LD canonical 必须等于页面 canonical。
- FAQPage schema 必须与页面可见 FAQ 逐问逐答一致。
- schema 可在 noindex 验证阶段存在，但不代表允许 sitemap、LLMS 或 GSC release。

## Discoverability gates

| Gate | 含义 | 不代表 |
| --- | --- | --- |
| sitemap | 可发现的 canonical URL 集 | 已收录、排名、AI 引用 |
| `llms.txt` | AI/GEO entry surface | enriched evidence 完整 |
| `llms-full.txt` | evidence-gated enriched context | AI 一定引用或回答正确 |
| JSON-LD | 可解析结构化数据 | graph proof 或权威背书 |
| GSC request | 请求 Google 抓取/索引 | Google 保证收录或排名 |

## Release state machine

```text
draft asset
  -> QA pass
  -> import dry-run pass
  -> approved exact package
  -> production import
  -> readback pass / noindex hold
  -> schema parity pass
  -> exact promotion authorization
  -> indexable
  -> INDEX-24R ALLOW_URL_EXPANSION
  -> GSC submit/monitor
```

状态不得跳跃。生产 deploy、CMS write、promotion 和 GSC mutation 必须分别授权，不能用一次宽泛授权串联执行。

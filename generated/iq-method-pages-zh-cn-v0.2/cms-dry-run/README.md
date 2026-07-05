# IQ 7 页 CMS Dry-Run 包

状态：draft-review only，未写入 CMS，未生产导入，未发布，未激活 sitemap/llms。

## 这个包做什么

- 汇总 7 个 zh-CN IQ 方法论页面的 CMS Article draft 导入映射。
- 定义 /zh/topics/iq-eq 下的 IQ 文章分组，不再把 IQ 和 EQ 混在一个模糊 entry group。
- 定义 IQ 测试 landing/page_blocks 的文章入口映射，但不允许前端硬编码。
- 固定 noindex/readback/claim gate，给 fap-api CMS importer 和后续 readback PR 使用。

## 这个包不做什么

- 不执行 CMS 写入。
- 不执行生产导入。
- 不切换发布状态。
- 不把任何页面加入 sitemap、llms.txt 或 llms-full.txt。
- 不新增前端静态内容、MDX、public 图片或 runtime fallback。

## 文件

- cms_import_manifest.json：7 篇 Article draft 的导入映射和默认状态。
- topic_iq_articles_mapping.json：/zh/topics/iq-eq 的 IQ/EQ 分组映射。
- landing_page_blocks_mapping.json：IQ 测试页辅助内链的 backend page_blocks 映射。
- seo_geo_gate.json：发布、索引、schema、sitemap/llms 激活门禁。
- claim_audit_summary.json：7 页自动 claim scan 汇总，人工 review 仍必需。
- readback_checklist.md：后端 dry-run/import 后必须逐项读回核对的清单。
- dry_run_report.json：本次 dry-run 包状态摘要。
- sha256_manifest.json：源文件和 dry-run 文件 hash。

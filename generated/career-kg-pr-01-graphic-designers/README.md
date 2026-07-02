# PR-CAREER-KG-01 平面设计师职业知识图谱资产包

本目录是 `PR-CAREER-KG-01` 的 dry-run 内容资产与 QA 证据包，不是 fap-web runtime 内容源。

- `graphic-designers.zh-CN.asset.json`：平面设计师职业知识图谱资产，覆盖 identity、SEO、内容块、来源、内链和发布边界。
- `qa_report.json`：schema validation、trust audit、editorial gate、dry-run importer、staging preview smoke 和 fap-web render smoke 汇总。
- `dry_run_importer_report.json`：只验证 would-upsert 形状，不写 CMS、不写 staging、不写 production。
- `staging_preview_smoke.json`：本地 contract preview 证据，不等待 staging deploy，不触发 manual deploy。
- `fap_web_render_smoke.json`：由 contract mock backend display surface 验证 fap-web 可渲染。
- `sha256_manifest.json`：本目录文件 SHA-256。

生产导入、CMS 写入、SEO runtime、sitemap、llms、canonical、noindex、robots、JSON-LD runtime 和 search submission 均不属于本 PR。

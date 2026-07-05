# IQ 7 页 CMS Readback Checklist

适用 PR：IQ-METHOD-PAGES-ZH-CN-CMS-READBACK-01。当前 PR 只准备清单，不执行 CMS 读写。

## 全局门禁

- [ ] 后端 CMS readback 返回 7 个 Article draft。
- [ ] 每篇 status 为 draft_review_only 或后端等价 draft review 状态。
- [ ] 每篇 is_public=false。
- [ ] 每篇 is_indexable=false。
- [ ] 每篇 robots=noindex,follow。
- [ ] 每篇 sitemap_eligible=false。
- [ ] 每篇 llms_eligible=false。
- [ ] 没有 answer_key、correct_answer、题目规则、评分公式、private result、order、payment、recover、restore URL。
- [ ] 媒体字段只引用 Media Library URL 或保持空，不引用 frontend/public 新图。

## Article 字段

### 1. 什么是 IQ 风格推理测试？

- [ ] slug = what-is-iq-style-reasoning-test
- [ ] canonical_url = https://fermatmind.com/zh/articles/what-is-iq-style-reasoning-test
- [ ] route = /zh/articles/what-is-iq-style-reasoning-test
- [ ] locale = zh-CN
- [ ] related_test_slug = iq-test-intelligence-quotient-assessment
- [ ] category = 测评方法与边界
- [ ] content_md 与 generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/article.md / generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/article.cms.json 一致。
- [ ] seo_title / seo_description / robots 与 generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/seo.json 一致。
- [ ] FAQ 可见文本与 generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/faq.json 一致，若启用 FAQPage schema 则必须保持可见文本一致。
- [ ] internal_links 只包含公开 article/test URL，不包含私有流程 URL。

### 2. 在线 IQ 风格测试和专业智力测评有什么区别？

- [ ] slug = online-iq-test-vs-professional-assessment
- [ ] canonical_url = https://fermatmind.com/zh/articles/online-iq-test-vs-professional-assessment
- [ ] route = /zh/articles/online-iq-test-vs-professional-assessment
- [ ] locale = zh-CN
- [ ] related_test_slug = iq-test-intelligence-quotient-assessment
- [ ] category = 测评方法与边界
- [ ] content_md 与 generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/article.md / generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/article.cms.json 一致。
- [ ] seo_title / seo_description / robots 与 generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/seo.json 一致。
- [ ] FAQ 可见文本与 generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/faq.json 一致，若启用 FAQPage schema 则必须保持可见文本一致。
- [ ] internal_links 只包含公开 article/test URL，不包含私有流程 URL。

### 3. IQ 风格测试里的原始分、正确率和完成时间说明什么？

- [ ] slug = iq-test-score-meaning-boundary
- [ ] canonical_url = https://fermatmind.com/zh/articles/iq-test-score-meaning-boundary
- [ ] route = /zh/articles/iq-test-score-meaning-boundary
- [ ] locale = zh-CN
- [ ] related_test_slug = iq-test-intelligence-quotient-assessment
- [ ] category = 测评方法与边界
- [ ] content_md 与 generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/article.md / generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/article.cms.json 一致。
- [ ] seo_title / seo_description / robots 与 generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/seo.json 一致。
- [ ] FAQ 可见文本与 generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/faq.json 一致，若启用 FAQPage schema 则必须保持可见文本一致。
- [ ] internal_links 只包含公开 article/test URL，不包含私有流程 URL。

### 4. 矩阵推理和模式识别题在测什么？

- [ ] slug = matrix-reasoning-pattern-recognition-guide
- [ ] canonical_url = https://fermatmind.com/zh/articles/matrix-reasoning-pattern-recognition-guide
- [ ] route = /zh/articles/matrix-reasoning-pattern-recognition-guide
- [ ] locale = zh-CN
- [ ] related_test_slug = iq-test-intelligence-quotient-assessment
- [ ] category = 能力与认知
- [ ] content_md 与 generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/article.md / generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/article.cms.json 一致。
- [ ] seo_title / seo_description / robots 与 generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/seo.json 一致。
- [ ] FAQ 可见文本与 generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/faq.json 一致，若启用 FAQPage schema 则必须保持可见文本一致。
- [ ] internal_links 只包含公开 article/test URL，不包含私有流程 URL。

### 5. 为什么 FermatMind IQ V1 是非认证测试？

- [ ] slug = why-fermatmind-iq-v1-not-certification
- [ ] canonical_url = https://fermatmind.com/zh/articles/why-fermatmind-iq-v1-not-certification
- [ ] route = /zh/articles/why-fermatmind-iq-v1-not-certification
- [ ] locale = zh-CN
- [ ] related_test_slug = iq-test-intelligence-quotient-assessment
- [ ] category = 测评方法与边界
- [ ] content_md 与 generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/article.md / generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/article.cms.json 一致。
- [ ] seo_title / seo_description / robots 与 generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/seo.json 一致。
- [ ] FAQ 可见文本与 generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/faq.json 一致，若启用 FAQPage schema 则必须保持可见文本一致。
- [ ] internal_links 只包含公开 article/test URL，不包含私有流程 URL。

### 6. IQ 风格测试的数据和隐私边界是什么？

- [ ] slug = iq-test-privacy-data-boundary
- [ ] canonical_url = https://fermatmind.com/zh/articles/iq-test-privacy-data-boundary
- [ ] route = /zh/articles/iq-test-privacy-data-boundary
- [ ] locale = zh-CN
- [ ] related_test_slug = iq-test-intelligence-quotient-assessment
- [ ] category = 测评方法与边界
- [ ] content_md 与 generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/article.md / generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/article.cms.json 一致。
- [ ] seo_title / seo_description / robots 与 generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/seo.json 一致。
- [ ] FAQ 可见文本与 generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/faq.json 一致，若启用 FAQPage schema 则必须保持可见文本一致。
- [ ] internal_links 只包含公开 article/test URL，不包含私有流程 URL。

### 7. FermatMind 如何审查 IQ 风格测试内容？

- [ ] slug = iq-expert-review-disclosure
- [ ] canonical_url = https://fermatmind.com/zh/articles/iq-expert-review-disclosure
- [ ] route = /zh/articles/iq-expert-review-disclosure
- [ ] locale = zh-CN
- [ ] related_test_slug = iq-test-intelligence-quotient-assessment
- [ ] category = 测评方法与边界
- [ ] content_md 与 generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/article.md / generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/article.cms.json 一致。
- [ ] seo_title / seo_description / robots 与 generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/seo.json 一致。
- [ ] FAQ 可见文本与 generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/faq.json 一致，若启用 FAQPage schema 则必须保持可见文本一致。
- [ ] internal_links 只包含公开 article/test URL，不包含私有流程 URL。

## Topic 读回

- [ ] /zh/topics/iq-eq 读回存在独立 IQ 文章分组。
- [ ] IQ 文章分组包含 7 个 slug。
- [ ] EQ 文章分组被保留或为空，不与 IQ 混写为单个 “IQ / EQ 文章” 分组。

## Landing/page_blocks 读回

- [ ] IQ 测试 landing/page_blocks 若配置，来源为 backend CMS，不是 fap-web hardcode。
- [ ] 链接 cluster 包含 7 个 Article 路径。
- [ ] 未配置时 fap-web 不应注入本地 fallback 文案。

## 激活前置

- [ ] method review 通过。
- [ ] claim review 通过。
- [ ] CMS dry-run import 通过。
- [ ] CMS readback 通过。
- [ ] private URL guard 通过。
- [ ] 进入单独发布 PR 后才允许改 public/indexable。
- [ ] 进入单独 SEO/GEO activation PR 后才允许 sitemap/llms eligibility。

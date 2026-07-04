# QA Checklist — 在线 IQ 风格测试和专业智力测评有什么区别？

- [x] 无 H1；页面 title 由 CMS 渲染为 H1。
- [x] 无 forbidden claims 显式命中。
- [x] 未生成题目、答案、解题步骤或评分表。
- [x] 有 visible FAQ。
- [x] 有 visible boundary caveat。
- [x] 有 next step，且不指向私有流程。
- [x] draft 状态 robots 为 `noindex,follow`。
- [x] `sitemap_eligible=false`。
- [x] `llms_eligible=false`。
- [x] 页面搜索意图与其他 6 页有区分。
- [ ] 待方法与 claim 审核。
- [ ] 待 CMS dry-run import 映射。

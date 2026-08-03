# W7 EQ English parity 扫描交接

## 结论

W7 当前应保持阻塞，不进入 producer。控制面仍记录 `registered / not_started`，所有写入与发布权限为 false。本扫描没有修改 master manifest，没有创建 candidate patch、producer package、CMS import 或 runtime enablement。

现有英文内容并非空白：后端编译权威中有 51 个英文结果块，并有 559 个可面向读者的双语深度节点，扫描时可识别的英文读者身份合计 610。这个数字只是 current scan count，不是 frozen expected count；在 producer package 冻结前，`expected` 与 `remaining` 必须保持 `Unknown`。

## 主要阻塞

1. 英文 active/calibrated 常模无仓库或生产证据。仓库只证明一个 zh-CN bootstrap/provisional seed；配置存在 en fallback chain 不代表英文常模存在。
2. 21 个英文结果块含 percentile 语义或变量，前端也会在字段存在时显示百分位，缺少 calibrated authority 失败关闭。
3. EQ 没有专用 share serializer、allow/deny、撤销/过期与 runtime gate；当前分享按钮禁用是正确状态。
4. EQ history 只有通用列表基础，没有专用 access summary、英文重入动作或前端 consumer。
5. 结果页可见地显示原始 `attempt_id`；PDF 文件名与 filename hint 也包含它。
6. 多个 EQ reader 组件在本地化字段缺失时显示内部 id，属于失败打开风险。
7. EQ-SJT 仍是 `planned_unavailable`，历史 scorer、take flow、integrated composer 和 smoke 均不能当作当前产品或 parity 权威。

## 已满足、不要重做

- EQ-60 后端报告合同为 `eq_60.report.v2`，当前 `full/free`，无 paywall。
- 51 个英文结果块与 51 个中文块成对存在，全部 access level 为 free。
- 922 个 report asset 本地化节点都有 en 与 zh-CN；英文节点未发现汉字混入。
- V5 renderer、canonical fixtures、depth/scene/personalization assets 与主要科学边界已有合并历史。
- 私有结果路由已有 noindex、no-store 相关边界，浏览器分析网络发送对 `/result` 有 hard-stop 合同。

## 下一步

第一个建议执行的 PR 是 `EN-PARITY-W7-EQ-NORM-AUTHORITY-GATE-01`。它只让后端在缺少 exact locale/cohort/version 的 active CALIBRATED norm authority 时不输出 percentile claim，不导入或激活生产常模，也不修改英文正文。

可直接使用的后续执行提示：

`/goal 执行 EN-PARITY-W7-EQ-NORM-AUTHORITY-GATE-01，严格按 generated/en-content-parity/W7-eq/scan/pr_decomposition.json 的 scope、allowed_paths、checks 和 no_go 完成 fap-api PR 全生命周期。`

后续完整顺序见 `w7_pr_dependency_dag.md`。每个 REQUIRED PR 的 exact manifest entry、state entry、local checks、验收条件与执行提示都在 `pr_decomposition.json`。

## 计数与分类口径

- `result_content_inventory.jsonl`：逐项列出 51 个英文 compiled result block identity。
- `compiled_content_inventory.jsonl`：按 20 个 compiled bundle 记录递归本地化 identity 数量。递归叶节点并非全部有独立稳定业务 ID，因此不伪造 ID；bundle identity + source hash + recursive count 是本扫描的审计口径。
- reader report content：559。
- internal/runtime metadata：219，不计内容目标。
- SEO/GEO：139，排除出 W7。
- SJT：5，`planned_unavailable`，排除出 W7。
- authoritative share projection：0。

## 真值边界

- 本扫描没有读取生产数据库，所以生产 active norm、live PDF 完整性和 live share 状态均不能推断，记为 `Unknown` 或 blocked。
- GitHub 合并历史在 2026-07-30 通过只读 PR readback 核对；fixture、baseline seed 与 staging smoke 没有被当作生产证据。
- 任何未来 package rebuild 都会改变 SHA，必须回到 producer 阶段并重新走独立 W9；不得在 frozen package 后静默替换。

## 扫描验证记录

- 20 文件集合、JSON/JSONL 解析、51 个 result identity 唯一性、20 个 bundle 唯一性、分类加总、11 个 PR candidate 的 entry 完整性、DAG 无环、allow/deny 无冲突、19 文件 SHA 覆盖、922 个 en/zh-CN 本地化节点与英文汉字泄漏检查：PASS。
- `node scripts/seo/validate-en-content-parity-control.mjs`：PASS。
- 控制合同中 registration、launch state 与全权限 false 的 3 个只读断言：PASS。
- EQ renderer、report action URL、private leak regression 与 print URL redaction 共 34 个聚焦测试：PASS。
- 完整运行 control master 合同时有 4 个既有夹具失败：夹具试图在真实 `generated/en-content-parity/W1-mbti/` 新建 package，并因 main 已存在 `scope_manifest.json` 主动拒绝覆盖；其余 55 个断言通过。未修改或删除 W1 资产，W7 只读断言已单独通过。

MBTI 内容真理源规则

状态： v1 正式规则
适用对象： 产品、工程、内容、运营
目的： 统一 MBTI 内容系统的编辑边界、发布边界、线上运行边界与热修边界，确保内容长期稳定运营、可追溯、可回滚、可治理。

⸻

1. 背景

当前 MBTI 内容系统并非纯前端内容系统，也并非纯后端内容系统，而是已经形成稳定的混合模式：
	•	仓库内仍存在完整的前端 authored corpus。
components/result/mbti/clone/content/index.ts 明确保留了 16 个 base content 与 32 个 fullCode patch；tests/contracts/mbti-desktop-content-registry.contract.test.ts 也要求本地 registry 覆盖全部 32 个 zh fullCode。
	•	线上 runtime 已存在 published storage read path。
lib/cms/personality-desktop-clone.ts 会请求 /v0.5/personality/{fullCodeSlug}/desktop-clone，并只接受 mbti_desktop_clone_v1 的 published payload。
	•	当前结果页 shell 会把 runtime projection 与 storage content 组合消费。
components/result/mbti/clone/MbtiDesktopCloneShell.tsx 会拉取 storage content，再交给 components/result/mbti/clone/mbtiDesktopClone.resolve.ts；后者明确以 storage 作为内容来源，同时继续保留 projection、headline、dimensions 等 runtime 数据。
	•	既有文档 docs/mbti-desktop-storage-cutover.md 已明确：
fap-web 消费 published storage content，本地 32-type registry 不再是 runtime source，而是 migration artifact / seed source。

因此，MBTI 内容治理必须采用已经确认的长期方案：

双层单向真理源 + 工件化发布

本规则只定义“谁是编辑真理源、谁是线上运行真理源、二者如何流转、如何热修与如何处理漂移”，不改变任何结果页内容、结果页架构或 runtime 逻辑。

⸻

2. 术语定义

2.1 编辑真理源

唯一允许人工长期编辑、审阅、版本管理的内容源。
对 MBTI 而言，其形式为 Git 中的 authored corpus / versioned content package。

2.2 线上运行真理源

唯一允许线上 runtime 在正式流量下直接消费的内容源。
对 MBTI 而言，其形式为 published storage artifact。

2.3 Content artifact

由编辑真理源经过校验、预览与构建后生成的可发布内容工件。
它是发布对象，不是日常编辑入口。

2.4 Published storage artifact

已经发布到线上 storage、可被 runtime 直接读取的 content artifact。
它是线上运行真理源的具体载体。

2.5 Break-glass 热修

仅在高优先级线上事故下，允许绕过常规发布链、对线上 published storage artifact 做一次受控紧急修复的例外流程。

2.6 Drift / 漂移

authoring corpus 与 published storage artifact 在同一内容版本语义上出现不一致，导致“Git 中看到的内容”与“线上实际运行的内容”不一致。

⸻

3. 正式规则

3.1 编辑真理源

MBTI 内容的唯一编辑真理源是 Git 中的 authored corpus / versioned content package。

正式规则如下：
	•	所有常规内容修改，必须先发生在 authored corpus。
	•	Authored corpus 是团队讨论、审稿、评审、追溯、回滚与后续发布的唯一编辑基线。
	•	Storage 不是内容团队、产品团队或运营团队的日常编辑入口。
	•	未进入 authored corpus 的内容，不得视为常规内容资产的一部分。

⸻

3.2 线上运行真理源

MBTI 内容的唯一线上运行真理源是 published storage artifact。

正式规则如下：
	•	线上 runtime 只认 published storage artifact。
	•	线上用户实际看到什么，以 published storage artifact 为准。
	•	前端本地 authored corpus 即使完整存在，也不与 published storage artifact 构成并列 runtime 真理源。
	•	已发布 artifact 必须视为不可变对象。
不允许在相同版本号下原地覆盖内容并继续沿用同一版本标识。

⸻

3.3 二者关系

编辑真理源与线上运行真理源不是同等级双主源，而是：
	•	authoring corpus 负责编辑
	•	published storage artifact 负责运行
	•	二者关系只能是单向发布

禁止事项：
	•	禁止把 storage 当作日常内容后台直接编辑。
	•	禁止把 storage 回流成常规编辑入口。
	•	禁止把“前端本地 authored corpus”和“线上 storage content”同时定义成同等真理源。
	•	禁止跳过 artifact 直接把临时内容写成线上正式版本。

⸻

4. 权限边界

4.1 谁可以改 authored corpus

只有被授权的内容负责人、产品负责人、指定工程负责人可以通过 Git 流程修改 authored corpus。
所有修改必须经过可审阅、可追溯的变更流程。

4.2 谁可以发布到 storage

仅指定发布责任人可以执行发布到 storage 的操作。
通常由工程发布责任人负责执行，内容与产品负责审批发布内容本身。

4.3 Storage 是否允许手工改

默认不允许。

Storage 不是常规编辑面，也不是运营后台。
除 break-glass 热修外，任何直接修改 storage 内容的行为都视为违规。

4.4 当前端本地内容与 runtime published 内容不一致时，以谁为准
	•	对线上用户体验与线上行为判断：以 published storage artifact 为准。
	•	对后续版本编辑与下一次正式发布的内容基线：以 authored corpus 为准，但必须立即进入漂移处理流程，不允许长期并存。

4.5 Drift 未关闭前的限制

一旦确认 drift 存在，在 drift 被关闭前：
	•	不得继续基于旧 authored corpus 发起新的常规内容发布。
	•	不得默认把线上临时内容当作下一轮内容编辑基线。
	•	必须先完成“回写”或“回滚”中的一种。

⸻

5. 发布流转

MBTI 内容的唯一推荐流转为：

编辑源 → 校验 → 生成 artifact → 预览 artifact → 批准发布 → 发布到 storage → 线上运行

正式规则如下：
	1.	未经过校验，不得生成正式 artifact。
	2.	未生成 artifact，不得进入预览与正式发布流程。
	3.	预览环境必须渲染待发布 artifact，不得以未封装的 authored corpus 直接替代正式预览对象。
	4.	未经过预览确认，不得发布到 storage。
	5.	发布对象必须是 artifact，而不是人工逐条改 storage。
	6.	Runtime 只消费已发布 artifact，不直接消费 authored corpus。
	7.	每次发布都必须产生明确的版本标识，并能追溯：
	•	改了哪些类型
	•	改了哪些 slot / chapter / surface
	•	当前线上运行的是哪一版 artifact
	•	回滚点在哪里

⸻

6. 热修规则

6.1 默认原则

默认禁止直接修改 storage 内容。

6.2 允许 break-glass 的条件

仅当出现明确线上事故，且等待常规发布链会扩大用户影响时，才允许启动 break-glass 热修。

6.3 Break-glass 必备条件

Break-glass 必须同时满足：
	•	有审计记录
	•	有责任人
	•	有原因说明
	•	有变更范围说明
	•	有计划关闭时间
	•	有明确的回滚点

6.4 Break-glass 的后续义务

Break-glass 后必须完成收口，默认要求：
	•	24 小时内完成，或
	•	在下一个工作日内完成

允许的收口方式只有二选一：
	1.	将热修内容回写到 authored corpus，并重新生成 artifact 正式发布；
	2.	回滚 storage artifact，撤销临时热修。

6.5 Break-glass 期间的状态要求

在收口完成前，该版本必须被标记为：

异常运行状态

不得把该状态长期视为正常运营版本。

6.6 禁止事项
	•	禁止把 break-glass 当作常规发版方式。
	•	禁止热修后长期维持“线上改过但 Git 未同步”的状态。
	•	禁止以“先救火”为理由跳过后续回写或回滚。

⸻

7. 漂移处理规则

当 authored corpus 与 published storage artifact 不一致时，视为内容治理异常，而不是“暂时可接受状态”。

正式规则如下：

7.1 发现漂移后的处理要求
	•	必须立刻指定责任人处理。
	•	必须记录漂移范围、发现时间、责任人和计划关闭时间。
	•	必须暂停基于旧编辑基线的常规继续发布。

7.2 允许的处理方式

允许的处理方式只有两种：

A. 回写
把线上有效变更补回 authored corpus，再重新生成并发布 artifact。

B. 回滚
撤回 storage 上的异常变更，使线上重新对齐到最近一次正式 artifact。

7.3 明确禁止
	•	不允许“先放着以后再说”。
	•	不允许把 storage 中的临时内容继续当作下一轮常规编辑基线。
	•	不允许漂移长期未关闭却继续推进常规内容版本。

7.4 漂移检测要求

必须存在固定的 drift 检测机制与责任人，至少在以下场景执行一次校验：
	•	每次正式发布后
	•	每次 break-glass 热修后

⸻

8. 适用范围与非目标

8.1 适用范围

本规则适用于：
	•	MBTI 旗舰内容系统
	•	MBTI authored corpus 与 published storage artifact 的治理边界
	•	MBTI 内容发布、热修、漂移处理的统一规则

8.2 非目标

本规则当前不包括：
	•	重构 Big Five
	•	上 CMS、后台编辑器或发布服务
	•	修改 runtime 逻辑、API、schema
	•	修改结果页架构或结果页内容表达
	•	处理首页、marketing、history/compare 的产品改造

⸻

9. 下一步

在本规则确立后，下一阶段优先事项为：
	1.	建立最小发布链
	2.	建立《MBTI 内容治理规则 v1》
	3.	建立内容 QA baseline

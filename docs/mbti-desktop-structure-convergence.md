# MBTI Desktop 三章骨架收敛（Career / Growth / Relationships）

## 目标
本次 PR 的目标是收敛 MBTI Desktop 结果页三章的阅读骨架，避免同一章出现两套并列主解释系统。

本次只做前端渲染骨架替换，不补内容、不改协议。

收敛后，desktop 主链仅保留 canonical 模块；被收敛掉的 6 个字段在协议层继续兼容保留：
- `career.career_ideas`
- `career.work_styles`
- `growth.what_energizes`
- `growth.what_drains`
- `relationships.superpowers`
- `relationships.pitfalls`

## 变更范围
- 仅 `fap-web` 的 desktop clone 渲染顺序与模块选择。
- 仅 Career / Growth / Relationships 三章。
- 不改 `ResultClient`、`RichResultReport`、Big5、mobile、支付与解锁逻辑。

## 每章隐藏模块
### Career
- `Strengths`
- `Weaknesses`
- `职业方向建议`
- `工作风格建议`

### Growth
- `Strengths`
- `Weaknesses`
- `什么让你充电`
- `什么让你消耗`

### Relationships
- `Strengths`
- `Weaknesses`
- `关系超级优势`
- `关系潜在陷阱`

## 每章保留模块
### Career
- `职业优势`
- `职业短板`
- `匹配岗位建议`
- `匹配阅读指南`

### Growth
- `成长优势`
- `成长短板`

### Relationships
- `关系优势`
- `关系短板`

## 协议兼容说明
- 上述 6 个字段当前仍在 API/adapter/resolver 协议层保留。
- 当前 desktop main flow 不再渲染这些字段。
- 后续若做 hard convergence，必须先完成 consumer/tests/import chain 清理，再推进字段移除。

## 收敛后阅读顺序（Desktop）
### Career
1. 章节标题
2. 插画
3. 两段导语
4. `Influential Traits`
5. 章节解锁卡（原位）
6. `职业优势`
7. `职业短板`
8. `匹配岗位建议`
9. `匹配阅读指南`
10. 章尾解锁卡（原位）

### Growth
1. 章节标题
2. 插画
3. 两段导语
4. `Influential Traits`
5. 章节解锁卡（原位）
6. `成长优势`
7. `成长短板`
8. 章尾解锁卡（原位）

### Relationships
1. 章节标题
2. 插画
3. 两段导语
4. `Influential Traits`
5. 章节解锁卡（原位）
6. `关系优势`
7. `关系短板`
8. 章尾解锁卡（原位）

## 解锁位保持不动的原因
`Influential Traits` 下方的章节解锁卡承担固定的阅读节奏和商业路径承接（跳转 `#offer-full`）。
本次只做重复模块收敛，不调整解锁位，以避免影响现有支付/转化路径与章节锚点行为。

## 实施方式
- 保持原有 storage content / resolver 数据源。
- 不写死文案，不新增第二套 content source。
- 仅在章节渲染层替换模块集合与顺序。

## 下一步
如需进一步清理重复字段（例如下半段已停用模块的协议级清理），应单独在 `fap-api` 发起后端协议清理 PR。

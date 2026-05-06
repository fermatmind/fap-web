# 结果页支付链路与邮箱访问链路专项扫描文档

日期：2026-05-06

本文档不是某两个 PR 的复盘，而是用于未来专项深度扫描的全链路协议。扫描范围覆盖：结果页访问控制、邮箱绑定/找回、支付解锁、订单恢复、跨设备结果页重入、报告读取授权、前后端状态一致性。

## 1. 链路目标

用户完成测评后，系统需要同时满足三条产品链路：

- 结果页访问链路：用户提交测评后进入结果页，结果页根据后端访问状态决定显示邮箱门禁、免费预览、付费解锁、生成中、完整报告或错误状态。
- 支付解锁链路：用户在结果页购买完整报告后，支付成功应稳定回到同一 attempt 的正确完整报告页，桌面端和手机端都要可用。
- 邮箱找回链路：用户输入邮箱后，当前结果页与邮箱绑定。之后用户在任意设备输入同一邮箱，可以看到该邮箱下保存的结果列表并重新打开对应结果页。

当前邮箱阶段是 weak email-claim MVP：

- 不发送验证码。
- 不做邮箱所有权强验证。
- 文案必须明确提醒用户使用自己的邮箱。
- 未来加验证码时，应把 `attempt_email_bindings.status` 从直接 `active` 升级为 `pending -> verified`，不应重做整体结构。
- 不应用于敏感临床报告。`SDS_20` 和 `CLINICAL_COMBO_68` 必须排除。

## 2. 权威边界

后端是以下事实的唯一权威：

- attempt 是否存在。
- attempt 属于哪个 `anon_id` / `user_id` / org。
- attempt 是否已绑定邮箱。
- 邮箱 hash/encrypted PII 如何保存。
- 订单是否已支付。
- benefit grant 是否有效。
- 结果页是否可读。
- 报告是否 ready。
- 某个短期 `result_access_token` 是否能读取某个 attempt。

前端只负责：

- 展示产品 UI。
- 调用 API。
- 保存临时 pending order context，帮助支付回跳。
- 从 URL 中读取后端签发的 `access_token` / `result_access_token` 并传回 API。
- 处理 `EMAIL_BIND_REQUIRED`、locked、ready、pending、failed 等状态。

前端不能做：

- 伪造完整报告可读状态。
- 用本地 fallback 内容代替后端报告权限。
- 把 result access token 当登录 token 存储。
- 用订单找回语义替代结果邮箱找回语义。
- 把弱邮箱 claim 应用到临床敏感报告。

## 3. 核心实体与表

后端需要重点扫描这些表。

### 3.1 Attempt 与结果

- `attempts`
- `attempt_results`
- `attempt_report_access_projections`
- 相关 submission / scoring / report payload 表或 JSON 字段

重点问题：

- attempt 是否存在。
- attempt 的 `scale_code` 是否正确。
- attempt 是否属于当前 org。
- attempt 的 owner 是 `anon_id` 还是 `user_id`。
- result 是否已生成。
- report projection 是否 ready。
- projection 的 `access_state`、`report_state`、`pdf_state` 是否与支付/邮箱状态一致。

### 3.2 邮箱绑定

- `attempt_email_bindings`

重点字段：

- `org_id`
- `attempt_id`
- `email_hash`
- `email_enc`
- `pii_email_key_version`
- `bound_anon_id`
- `bound_user_id`
- `status`
- `source`
- `first_bound_at`
- `last_accessed_at`

当前 MVP 期望：

- 用户输入邮箱绑定后，`status = active`。
- 邮箱必须通过 `PiiCipher` 规范化、hash、加密。
- lookup 只用 hash 查找，不返回明文邮箱。
- 未来验证码升级时，同一表结构支持 `pending -> verified`。

### 3.3 支付与权益

- `orders`
- `payment_attempts`
- `benefit_grants`
- webhook 处理相关日志/表

重点问题：

- `orders.target_attempt_id` 是否指向当前结果页 attempt。
- `orders.payment_state` 是否 paid。
- `orders.grant_state` 是否 granted。
- `benefit_grants.status` 是否 active。
- grant 是否过期。
- order owner 是否与 attempt owner 或邮箱绑定 owner 匹配。
- 支付回调是否完成 entitlement 投放。

## 4. 后端接口地图

### 4.1 邮箱绑定

```text
POST /api/v0.3/attempts/{id}/email-bind
```

职责：

- 接收用户输入邮箱。
- 校验当前 actor 拥有该 attempt。
- 存储 `email_hash` / `email_enc`。
- MVP 直接写入 `status = active`。

必须检查：

- 无 actor 不允许绑定。
- actor 不匹配不允许绑定。
- 不泄露明文邮箱。
- 不允许跨 org 绑定。
- 临床排除逻辑不能被绕过。

### 4.2 邮箱结果找回

```text
POST /api/v0.3/results/lookup-by-email
```

职责：

- 根据邮箱查找 active bindings。
- 返回轻量结果列表。
- 为每个可打开结果生成短期 `result_access_token`。
- 无匹配时返回 `ok: true, items: []`。

必须检查：

- 只返回轻量列表，不返回完整报告 payload。
- 有 rate limiting。
- token 只授权对应 attempt。
- token 有过期时间。
- token 不扩大 tenant/org 权限。

### 4.3 结果/报告读取

```text
GET /api/v0.3/attempts/{id}/report-access
GET /api/v0.3/attempts/{id}/report
GET /api/v0.3/attempts/{id}/result
```

职责：

- 返回结果页访问状态。
- 读取完整报告或 legacy result。
- 支持 `access_token` 作为只读结果页授权。

必须检查：

- 未绑定邮箱的 eligible public scale 返回 `EMAIL_BIND_REQUIRED`。
- 已绑定邮箱或有有效 result token 时可读。
- 付费完整报告必须依赖 active benefit grant。
- `SDS_20` / `CLINICAL_COMBO_68` 不进入弱邮箱 claim。
- locked preview 与 paid full 的状态不能混淆。

### 4.4 支付与订单

```text
POST /api/v0.3/orders/checkout
GET /api/v0.3/orders/{order_no}
POST /api/v0.3/orders/lookup
GET /api/v0.3/orders/{order_no}/recover/alipay-return
```

职责：

- 创建订单。
- 发起支付。
- 支付等待页轮询订单状态。
- 支付回跳时恢复 order context。
- 订单已支付后返回可进入结果页的入口。

必须检查：

- `payment_recovery_token` 只用于订单恢复，不等于结果读取授权。
- 订单已支付且 grant active 后，后端应返回正确 result entry。
- 如果跨设备或手机浏览器没有原始 `anon_id`，订单恢复仍应能给出 tokenized result URL。
- tokenized result URL 必须只在支付、grant、email binding 条件都满足时生成。

## 5. 前端页面与模块地图

### 5.1 结果页

关键文件：

- `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx`
- `components/result/RichResultReport.tsx`
- `components/result/mbti/MbtiResultShell.tsx`
- `components/result/mbti/clone/MbtiDesktopCloneShell.tsx`

必须检查：

- 从 URL 读取 `access_token` 和 `result_access_token`。
- token 传给 `fetchAttemptReportAccess`。
- token 传给 `fetchAttemptReport`。
- token 传给 `fetchAttemptResult`。
- `EMAIL_BIND_REQUIRED` 显示邮箱门禁。
- 邮箱门禁提交成功后 reload 当前结果读取链路。
- 不把 URL token 写入 auth token。
- 不把 URL token 用于登录态 link。
- 后端失败时不要渲染假完整报告。

邮箱门禁文案必须包含：

```text
输入邮箱即可查看并找回该邮箱下保存的结果，请使用你自己的邮箱。
```

### 5.2 支付等待页

关键文件：

- `app/(localized)/[locale]/pay/wait/page.tsx`
- `app/(localized)/[locale]/orders/[orderNo]/OrdersClient.tsx`
- `lib/commerce/pendingOrder.ts`
- `lib/commerce/checkoutAction.ts`
- `lib/commerce/redirectUrls.ts`

必须检查：

- 创建订单后写入 pending order context。
- pending order context 可保存：
  - order number
  - attempt id
  - sku
  - provider
  - wait URL
  - payment recovery token
  - result URL
- `/pay/wait` 轮询订单时带上 `payment_recovery_token`。
- 订单 paid 后优先使用后端返回的 `exact_result_entry.actions.page_href`。
- 如果后端返回的 result href 带 `access_token`，前端不能清洗掉。
- `normalizeCommerceReportPath` 必须保留 query string。

### 5.3 订单查询与邮箱结果查询

关键文件：

- `components/support/OrderLookupForm.tsx`
- `components/support/ResultEmailLookupForm.tsx`
- `app/(localized)/[locale]/orders/lookup/page.tsx`
- `app/(localized)/[locale]/results/lookup/page.tsx`

必须检查：

- `/orders/lookup` 是订单找回，不应混入结果邮箱找回语义。
- `/results/lookup` 是邮箱结果找回。
- 邮箱结果找回打开 result URL 时必须携带 `access_token`。
- lookup 页面必须 noindex。
- 列表只显示轻量结果信息。

## 6. 端到端状态机

### 6.1 新测评到邮箱绑定

```text
take test
  -> submit attempt
  -> result page
  -> report-access
  -> EMAIL_BIND_REQUIRED
  -> frontend email gate
  -> POST email-bind
  -> binding active
  -> reload report-access/report
  -> locked preview or full report
```

扫描重点：

- 提交后 result page 是否先触发 `report-access`。
- 后端是否正确返回 `EMAIL_BIND_REQUIRED`。
- 绑定邮箱是否要求当前 actor 是 attempt owner。
- 绑定成功后是否重新读取而不是前端本地放行。

### 6.2 未付费结果页到支付

```text
result page locked/preview
  -> click unlock
  -> POST orders/checkout
  -> write pending order
  -> open provider payment
  -> /pay/wait polls order
```

扫描重点：

- checkout request 是否带 attempt id、sku、region、anon/user context。
- pending order 是否保存 recovery token。
- provider redirect/QR/html pay action 是否安全归一化。
- 支付等待页是否能恢复订单状态。

### 6.3 支付成功到结果页

```text
payment success/webhook
  -> order paid
  -> benefit grant active
  -> report access projection ready/full
  -> order read with payment_recovery_token
  -> backend returns exact_result_entry/page_href
  -> page_href includes access_token when needed
  -> frontend routes to result page
  -> result page sends access_token to report-access/report
  -> full report renders
```

扫描重点：

- webhook 是否完成 payment state 和 grant state。
- `benefit_grants` 是否 active。
- order read 是否使用 `payment_recovery_token`。
- result URL 是否带 `access_token`。
- result page 是否真的把 token 传给 API。
- 最终渲染的是 full report，不是 locked preview 或 placeholder。

### 6.4 任意设备邮箱找回结果

```text
/results/lookup
  -> enter email
  -> POST lookup-by-email
  -> backend returns lightweight items with result_access_token
  -> frontend opens result_url?access_token=...
  -> result page sends access_token to report-access/report
  -> result/report renders
```

扫描重点：

- 邮箱 normalization 是否一致。
- lookup 无结果是否返回 `ok: true, items: []`。
- lookup 不返回完整 payload。
- result URL token 是否短期有效。
- token 是否只读、只对应单个 attempt。

## 7. 典型故障与第一扫描点

| 现象 | 第一扫描点 | 常见原因 |
| --- | --- | --- |
| 结果页不要求邮箱 | 后端 feature config、`report-access` 响应 | production gate 未开、scale 被排除、attempt 已绑定 |
| 邮箱提交失败 | `email-bind` 请求与 actor header | 缺少 `anon_id`、user 不匹配、attempt 不存在 |
| 邮箱找回为空 | `attempt_email_bindings` | 邮箱 normalization 不一致、binding 未 active、org 不匹配 |
| 支付后回到结果页但仍是预览 | order/grant/report projection | grant 未 active、projection 未 ready、report payload 仍 locked |
| 手机支付后打不开报告 | `/pay/wait` 与 order read | recovery token 丢失、新浏览器无原 anon/user |
| URL 有 access_token 但 API 仍 404/403 | `ResultClient` 和 network requests | token 没传给 `report-access` / `report` |
| DevTools 订单 API 404 | `GET orders/{order_no}` | 保护性隐藏：缺 actor 或缺 recovery token |
| 结果页显示占位文本 | report read 与渲染 fallback | 后端未返回完整报告、前端 fallback 错误渲染 |
| 邮箱结果可打开别人的 attempt | token verification / org scope | 严重安全问题，必须 hard stop |

## 8. 生产排查协议

不要在共享输出中粘贴：

- 敏感凭据。
- 原始支付 recovery token。
- 原始 result access token。
- 明文邮箱。
- 完整支付平台流水隐私信息。

允许粘贴时需要脱敏：

```text
order_no=ord_xxx...abcd
attempt_id=10db...53da
access_token=redacted
email_hash=redacted
```

### 8.1 公网 API 初筛

无身份直接查订单/attempt 可能返回保护性 404，这是正常行为，不能直接判定数据不存在。

```bash
curl -sS -i "https://api.fermatmind.com/api/v0.3/orders/${ORDER_NO}" | sed -n '1,80p'
curl -sS -i "https://api.fermatmind.com/api/v0.3/attempts/${ATTEMPT_ID}/report-access" | sed -n '1,120p'
```

判断：

- 订单 404 可能是缺 actor/recovery token。
- attempt 404 可能是缺 actor/result token。
- `EMAIL_BIND_REQUIRED` 表示邮箱门禁链路生效。
- ready/full 状态才应进入完整报告读取。

### 8.2 Chrome DevTools 扫描

打开 Network，按顺序看：

1. `/pay/wait?...`
2. `/api/v0.3/orders/{order_no}`
3. `/result/{attempt_id}?access_token=...`
4. `/api/v0.3/attempts/{attempt_id}/report-access?...`
5. `/api/v0.3/attempts/{attempt_id}/report?...`
6. `/api/v0.3/attempts/{attempt_id}/result?...`

必须确认：

- order polling 带 `payment_recovery_token`。
- paid order response 有 `exact_result_entry`。
- `exact_result_entry.actions.page_href` 指向同一个 attempt。
- 跨设备需要时，page href 带 `access_token`。
- result page 的 API 请求带同一个 `access_token`。
- report response 是 full/unlocked payload。

### 8.3 数据库扫描问题清单

只做只读查询，且输出脱敏。

订单侧：

- 这个 order 是否存在？
- `payment_state` 是不是 paid？
- `grant_state` 是不是 granted？
- `target_attempt_id` 是不是用户当前 URL 的 attempt？
- order owner 是 user 还是 anon？
- contact email hash 是否存在？

权益侧：

- 是否有 active `benefit_grants`？
- grant 的 `attempt_id` 和 `order_no` 是否一致？
- grant 是否过期？

邮箱侧：

- 是否有 active `attempt_email_bindings`？
- binding 的 `attempt_id` 是否一致？
- binding owner 是否与 order/attempt owner 匹配？
- `email_hash` 是否来自同一 normalization 和 PII key 版本？

结果侧：

- attempt 是否存在且 org 正确？
- result 是否生成？
- report access projection 是否 ready？
- full report payload 是否可渲染？

## 9. 本地专项验证命令

### 9.1 后端

```bash
cd "$BACKEND_REPO"

php artisan route:list | grep -E 'email-bind|lookup-by-email|report-access|orders/'
DB_CONNECTION=sqlite DB_DATABASE=':memory:' php artisan migrate --force
php artisan test --filter='ResultEmailGatedReadTest|ResultEmailLookupTest|CommerceOrderReadFallbackTest'
APP_ENV=production php artisan tinker --execute='var_export(config("fap.features.email_first_result_access")); echo PHP_EOL;'
APP_ENV=testing php artisan tinker --execute='var_export(config("fap.features.email_first_result_access")); echo PHP_EOL;'
bash backend/scripts/ci_verify_mbti.sh
```

### 9.2 前端

```bash
cd "$FRONTEND_REPO"

pnpm lint app/'(localized)'/'[locale]'/'(app)'/result/'[id]'/ResultClient.tsx \
  tests/contracts/result-client-view-state.contract.test.tsx \
  tests/e2e/mbti-access-first-result.spec.ts

pnpm exec vitest run tests/contracts/result-client-view-state.contract.test.tsx
pnpm test:contract
pnpm test:e2e tests/e2e/mbti-access-first-result.spec.ts --project=chromium
```

关键断言：

- `?access_token=result_lookup_token_123` 必须传入 `fetchAttemptReportAccess`。
- 同一个 token 必须传入 `fetchAttemptReport`。
- `token=...` 这类 auth bearer URL 参数不能被当作 result access token。
- raw URL token 不能持久化为登录态。

## 10. 回归测试矩阵

### 邮箱门禁

- 未绑定 eligible public result 返回 `EMAIL_BIND_REQUIRED`。
- 前端显示邮箱门禁。
- 文案包含“请输入自己的邮箱”含义。
- 邮箱绑定成功后重新读取结果。
- 无 owner 不能绑定。
- owner 不匹配不能绑定。
- 临床排除 scale 不进入弱邮箱门禁。

### 邮箱找回

- 同邮箱可列出 bound results。
- 无匹配返回空列表，不报错。
- 列表不返回完整报告 payload。
- 每个 item 的 result URL 有短期 token。
- token 只能打开对应 attempt。
- token 过期后不可读。

### 支付链路

- locked result 点击购买会创建订单。
- pending order context 保存 order、attempt、provider、recovery token。
- 支付等待页轮询订单。
- 支付成功后订单状态 paid。
- benefit grant active。
- paid order response 返回 result entry。
- 跨设备需要时 result entry 带 access token。
- result page 带 token 读取 full report。
- 手机端支付回跳不依赖原始 localStorage/anon 才能看报告。

### 渲染链路

- MBTI paid full report 渲染 rich report shell。
- locked preview 不冒充 full。
- report pending 显示生成中。
- report unavailable 显示错误/恢复入口。
- 不出现用于开发占位的 placeholder 文案作为正式完整报告。

## 11. 未来验证码升级扫描点

目标升级：

```text
active direct bind
  -> pending bind
  -> email code verification
  -> verified/active bind
```

需要保持：

- `attempt_email_bindings` 表结构可复用。
- lookup 只认 verified/active。
- 未验证邮箱不能找回结果。
- 已支付订单恢复仍不能绕过邮箱验证策略，除非有单独的支付证明链路。
- 文案从“输入邮箱即可查看”升级为“验证邮箱后查看/找回”。

新增测试：

- pending binding 不允许 lookup。
- verified binding 允许 lookup。
- code 过期/错误不激活 binding。
- resend code rate limit。

## 12. PR 拆分建议

如果未来继续改这条链路，按以下 scope 拆：

1. Backend email binding/schema/status upgrade。
2. Backend result lookup/token/read gate。
3. Backend payment recovery/result token hardening。
4. Frontend result email gate。
5. Frontend result lookup page。
6. Frontend pay wait/order recovery UI。
7. Verification-code UI and API。
8. Observability and production scan scripts。

不要在同一个 PR 混合：

- 支付权益规则和邮箱验证码 UI。
- 订单找回和结果邮箱找回。
- 临床报告访问和弱邮箱 claim。
- CMS/SEO/editorial 内容和产品访问控制。
- 前端 fallback 内容和后端 report authority。

## 13. 历史参考

以下 PR 是本链路近期修复背景，仅作定位参考，不是本文档的主体：

- `fap-api` PR `#1197`: production email gate default and tokenized paid recovery。
- `fap-web` PR `#643`: result page consumes URL result access token。

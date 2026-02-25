# SEO 执行手册（Canonical `/tests` 版）

本仓库 SEO 规范：
- 主规范路径：`/tests/{slug}`
- 旧路径 `/test/*` 仅作兼容入口（308）
- URL 永久稳定，版本与灰度不进路径

## 1. 新增量表流程

1. 在 `docs/seo/slugs.md` 新增 canonical slug 与 alias 台账。
2. 新增/更新内容元数据（landing meta）。
3. 确认页面可在 `/tests/{slug}` 访问并可收录。
4. 验证 legacy `/test/*` 一跳 308 到 canonical。

## 2. 必过检查

- `/tests/{slug}` 页面可收录，canonical 正确。
- `/tests/{slug}/take` noindex。
- `/test/{slug}` 与 `/test/{slug}/take` 返回 308 且单跳。
- alias slug 访问时最终 URL 为 canonical slug。
- query 参数在 redirect 过程中保留。

## 3. 证据目录规范

- canonical 证据目录：`docs/seo/evidence/<canonical-slug>/`
- legacy 证据目录：`docs/seo/evidence/<legacy-slug>/`（保留并标注 legacy）

## 4. 回归建议命令

```bash
pnpm typecheck
pnpm test:contract
pnpm test:e2e --grep "legacy slug redirect"
```

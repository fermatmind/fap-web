Structured Data Evidence — personality-mbti-test

本目录用于保存 /test/personality-mbti-test 落地页的结构化数据（JSON-LD）证据（不依赖截图，证据可复现）。

------------------------------------------------------------
1) 目标页面
------------------------------------------------------------
- Page: /test/personality-mbti-test
- Local URL: http://localhost:3000/test/personality-mbti-test
- View Source: view-source:http://localhost:3000/test/personality-mbti-test
- Canonical (expected): https://fermatmind.com/test/personality-mbti-test


------------------------------------------------------------
2) 证据文件说明
------------------------------------------------------------

2.1 1-page-html.html（HTML 源码快照）
- 文件：1-page-html.html
- 含义：从 View Source 保存的页面 HTML 源码（应包含 JSON-LD 的 <script type="application/ld+json">）
- 目的：保证“结构化数据是 SSR 直出的”，任何人无需跑代码即可审阅

生成方式（推荐二选一）：
A) 浏览器方式（最简单）
- 打开：view-source:http://localhost:3000/test/personality-mbti-test
- 全选 → 复制 → 粘贴到 1-page-html.html 保存

B) CLI 方式（可复现）
- 确保本地 dev 已启动：pnpm dev
- 生成：
  curl -sS http://localhost:3000/test/personality-mbti-test > 1-page-html.html


2.2 2-validate.txt（自动校验输出）
- 文件：2-validate.txt
- 含义：对 1-page-html.html 做静态检查的输出结果（无截图、可复现）
- 检查项（必须全部 OK）：
  - JSON-LD script 数量（应为 3：Quiz / BreadcrumbList / Dataset）
  - 必须包含：
    - "@type":"Quiz"
    - "@type":"BreadcrumbList"
    - "@type":"Dataset"
    - timeRequired
    - hasPart
    - PT2M / PT10M / PT20M

生成方式（Python，一次性可复现）：
python3 - <<'PY'
from pathlib import Path
from datetime import datetime, timezone
import re

html_path = Path("1-page-html.html")
out_path  = Path("2-validate.txt")

html = html_path.read_text(encoding="utf-8", errors="ignore")

keys = [
  '"@type":"Quiz"',
  '"@type":"BreadcrumbList"',
  '"@type":"Dataset"',
  'timeRequired',
  'hasPart',
  'PT2M',
  'PT10M',
  'PT20M',
]

lines = []
lines.append("== Evidence check for: /test/personality-mbti-test")
lines.append("== Generated at: " + datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))
lines.append("")
lines.append("[CHECK] ld+json scripts count:")
lines.append(str(len(re.findall(r'type="application/ld\\+json"', html))))
lines.append("")
lines.append("[CHECK] Must contain:")
for k in keys:
  lines.append(("  OK  " if k in html else "  ERR ") + k)

lines.append("")
lines.append("[SNIPPET] timeRequired/hasPart/PT*nM occurrences (first 50):")
matches = re.findall(r"(timeRequired|hasPart|PT\\d+M)", html)
for m in matches[:50]:
  lines.append(m)

out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
print("WROTE", out_path)
PY


------------------------------------------------------------
3) 当前结论（本目录验收口径）
------------------------------------------------------------
只要满足：
- 1-page-html.html 中包含 3 段 application/ld+json
- 2-validate.txt 中所有关键项均为 OK

即可认为任务包 3 的“本地可复现证据”已完成。

注：线上验证（Rich Results Test / schema.org validator）在有可访问 URL 后再补充即可，不影响本地证据闭环。


------------------------------------------------------------
4) 可选：线上验证补充（部署后再做）
------------------------------------------------------------
若后续补线上证据，建议新增文件（可选）：
- 3-rich-results-test.png（Google Rich Results Test）
- 4-schema-validator.png（schema.org Validator）

并在 PR 中附上线上 URL 与截图路径。
# W4 RIASEC English parity PR dependency DAG

Status: planning-only; W4 is `registered/not_started`. Every new execution node is on HOLD until the control window sets `launch_ready`.

```mermaid
flowchart TD
  I["INVENTORY-01<br/>14 groups / 1550 rows"]
  RL["RUNTIME-LOCALE-01<br/>backend fail-closed locale contract"]
  D["DIMENSION-ASSETS-01"]
  P["PAIR-ASSETS-01"]
  T["TOP3-ASSETS-01"]
  A["ACTIVITY-ASSETS-01"]
  Q140["140Q-ASSETS-01"]
  Q["QUALITY-ASSETS-01"]
  C["CALIBRATION-ASSETS-01"]
  F["FEEDBACK-ASSETS-01"]
  S["SAFE-VARIANTS-01"]
  PF["PACKAGE-FREEZE-01<br/>exact 1550-row SHA"]
  W9["W9 independent QA"]
  IMP["EXACT-PACKAGE-IMPORTER-01<br/>dry-run only"]
  FG["FRONTEND-LOCALE-GUARD-01"]
  BQ["BE-QA-01"]
  FQ["FE-QA-01"]
  DI["separately approved exact-SHA draft import"]
  AP["editorial + psychometrics + product approval"]
  RP["controlled runtime pilot"]
  LQ["live result/share/PDF/history QA"]

  I --> RL
  I --> D
  I --> P
  I --> T
  I --> A
  I --> Q140
  I --> Q
  I --> C
  I --> F
  I --> S
  D --> PF
  P --> PF
  T --> PF
  A --> PF
  Q140 --> PF
  Q --> PF
  C --> PF
  F --> PF
  S --> PF
  PF --> W9
  W9 --> IMP
  RL --> FG
  IMP --> BQ
  RL --> BQ
  FG --> FQ
  BQ --> FQ
  BQ --> DI
  W9 --> DI
  DI --> AP
  AP --> RP
  FQ --> RP
  RP --> LQ
```

## Decisions

| Candidate | Verdict | Reason |
|---|---|---|
| New slot/schema architecture | ALREADY_SATISFIED | Existing deep-slot schema is usable; locale-aware selection is the missing contract. |
| Locale-aware backend resolver | BLOCKED / required after launch | Current registry, activity, and feedback paths are zh-CN-only. |
| Nine producer segments | BLOCKED / required after launch | They cover all 1550 atomic rows without mixing reader content with runtime code. |
| 120 authored top3 assets | NOT_REQUIRED | Keep 20 authored unordered rows and deterministic ordered projection; extend QA to 120/120. |
| Generic external validator | ALREADY_SATISFIED | Existing Asset Agent and validator harness cover generic dry-run validation. |
| W4 exact-package dry-run mapping | BLOCKED | Requires frozen package and W9 PASS; zero writes. |
| Frontend locale guard | BLOCKED / required after backend contract | Defense-in-depth only; no frontend copy. |
| W9 QA | BLOCKED | W9 waits for the first frozen package and must remain independent. |
| Public SEO/indexability PR | NOT_REQUIRED | Private result/report/PDF/history remain noindex; no new public indexable surface. |

The DAG is acyclic. fap-web and fap-api changes are split into separate PRs. Reader content, runtime contract, importer, QA, import, approval, pilot, and live QA remain separate gates.

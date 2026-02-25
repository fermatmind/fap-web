# Slug 资产台账（Canonical + Alias）

## 1. Canonical 命名规则

- 全小写，`-` 分隔。
- canonical 只用于 `/tests/{slug}`。
- legacy alias 仅用于兼容，不用于主链接生成。

## 2. 六模型 canonical 台账

| Scale Code | Canonical Slug | Canonical URL |
|---|---|---|
| MBTI | `mbti-personality-test-16-personality-types` | `/tests/mbti-personality-test-16-personality-types` |
| BIG5_OCEAN | `big-five-personality-test-ocean-model` | `/tests/big-five-personality-test-ocean-model` |
| CLINICAL_COMBO_68 | `clinical-depression-anxiety-assessment-professional-edition` | `/tests/clinical-depression-anxiety-assessment-professional-edition` |
| SDS_20 | `depression-screening-test-standard-edition` | `/tests/depression-screening-test-standard-edition` |
| IQ_RAVEN | `iq-test-intelligence-quotient-assessment` | `/tests/iq-test-intelligence-quotient-assessment` |
| EQ_60 | `eq-test-emotional-intelligence-assessment` | `/tests/eq-test-emotional-intelligence-assessment` |

## 3. Alias 兼容台账（长期保留）

| Alias Slug | Target Canonical Slug |
|---|---|
| `personality-mbti-test` | `mbti-personality-test-16-personality-types` |
| `mbti-test` | `mbti-personality-test-16-personality-types` |
| `mbti` | `mbti-personality-test-16-personality-types` |
| `mbti-personality-test` | `mbti-personality-test-16-personality-types` |
| `big5-ocean` | `big-five-personality-test-ocean-model` |
| `big5-ocean-test` | `big-five-personality-test-ocean-model` |
| `big-five-personality-test` | `big-five-personality-test-ocean-model` |
| `big5` | `big-five-personality-test-ocean-model` |
| `big5-personality-test` | `big-five-personality-test-ocean-model` |
| `clinical-combo-68` | `clinical-depression-anxiety-assessment-professional-edition` |
| `depression-anxiety-combo` | `clinical-depression-anxiety-assessment-professional-edition` |
| `sds-20` | `depression-screening-test-standard-edition` |
| `zung-self-rating-depression-scale` | `depression-screening-test-standard-edition` |
| `iq-test` | `iq-test-intelligence-quotient-assessment` |
| `iq_raven` | `iq-test-intelligence-quotient-assessment` |
| `raven-iq-test` | `iq-test-intelligence-quotient-assessment` |
| `raven-matrices` | `iq-test-intelligence-quotient-assessment` |
| `eq-test` | `eq-test-emotional-intelligence-assessment` |
| `emotional-intelligence-test` | `eq-test-emotional-intelligence-assessment` |

## 4. Redirect 规则

- `/test/{alias}` -> `308` -> `/tests/{canonical}`
- `/test/{alias}/take` -> `308` -> `/tests/{canonical}/take`
- `/tests/{alias}` -> `308` -> `/tests/{canonical}`
- `/tests/{alias}/take` -> `308` -> `/tests/{canonical}/take`

要求：单跳，且保留 query string。

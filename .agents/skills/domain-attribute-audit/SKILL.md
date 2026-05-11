---
name: domain-attribute-audit
description: Audit data-domain-* governance attributes in fap-web. Verify attributes are only on allowed surfaces, correctly role-scoped (primary/supporting/blocked), non-interactive, and absent from forbidden surfaces.
---

# Domain Attribute Audit

## Purpose
Verify that `data-domain-*` governance attributes are correctly placed, correctly role-scoped, and absent from forbidden surfaces. This skill covers the full attribute lifecycle: placement verification, copy compliance, interactivity checks, and surface scope validation.

## When to Use
- After adding or modifying `data-domain-id`, `data-domain-role`, or `data-domain-envelope-state` attributes
- Before opening a PR that touches domain attributes
- When auditing Phase 4C/4D runtime integration
- When verifying that Career Decision, Workstyle, or RIASEC surfaces have no self_understanding attributes

## When Not to Use
- For backend domain data — backend owns decision domain metadata
- For SEO content changes — use `seo-verify` skill
- For frontend visible copy changes — this skill checks attributes, not visible text
- For adding new domain surfaces — requires Phase planning scan first

## Hard Invariants
- **Do not** add `data-domain-id="self_understanding"` to Career Decision, Workstyle, or RIASEC surfaces.
- **Do not** add domain attributes to topic/article/personality/test surfaces without stable backend/CMS payload-backed mapping.
- **Do not** add interactive elements (links, buttons, CTAs, tooltips) to domain badge elements.
- **Do not** render forbidden domain copy variants (自我诊断, 人格诊断, 人格分析报告, Personality insight, etc.).
- **Do not** add domain attributes to SEO metadata, JSON-LD, sitemap, or llms output.

## Standard Workflow

### Step 1 — Attribute Inventory
```bash
# Find all data-domain-* attributes in runtime files
rg -n "data-domain-id|data-domain-role|data-domain-envelope-state" app/ components/ lib/
```

Expected: attributes only in result/report shells and approved surfaces.

### Step 2 — Role Verification
```bash
# Check domain roles on result/report surfaces
rg -n "data-domain-role" components/result/
```

Expected:
- MBTI: `primary`
- Big Five: `primary`
- Enneagram: `supporting`
- RIASEC: absent (no self_understanding attrs)

### Step 3 — Forbidden Copy Audit
```bash
# Check for forbidden domain copy in runtime
rg -n "自我認知|自我诊断|人格诊断|人格分析报告|Self-discovery|Personality insight|Personal diagnosis" app/ components/ lib/
```

Expected: zero hits in badge components. Forbidden copy may only appear in contract test `forbiddenCopyVariants` arrays.

### Step 4 — Interactivity Audit
```bash
# Check badge for interactive elements
rg -n "href=|onClick|role=.button|tooltip|modal|popover" components/domains/
```

Expected: zero hits. Badge must be `non_interactive_domain_label`.

### Step 5 — Surface Scope Verification
```bash
# Verify badge only on allowed surfaces
rg -n "SelfUnderstandingDomainBadge" app/ components/
```

Expected: only in allowed result/report shells (MbtiResultShell, Big5ResultShell, Big5ResultPageV2Shell, EnneagramResultShell). Not in career, topic, article, test, personality, home, order, pay, share, or take pages.

## Acceptance Commands
```bash
rg -n "data-domain-id|data-domain-role" app/ components/ lib/
rg -n "自我認知|自我诊断|人格诊断|Self-discovery|Personality insight" app/ components/ lib/
rg -n "href=|onClick|role=.button|tooltip|modal" components/domains/
rg -n "SelfUnderstandingDomainBadge" app/ components/
```

## Output Contract
- Attribute locations: list of files with `data-domain-*` attributes, with role and surface
- Forbidden copy: path and line number if any forbidden copy found (should be zero)
- Interactivity: path and line number if any interactive elements found (should be zero)
- Surface scope: list of files importing `SelfUnderstandingDomainBadge`

## Stop Conditions
- `data-domain-id="self_understanding"` found on Career Decision, Workstyle, or RIASEC surfaces
- Forbidden copy variant found in any runtime file
- Interactive element (href, onClick, button, tooltip, modal) found in domain badge component
- Badge imported on any surface not in the allowed set
- Domain attributes found in SEO metadata, schema, or sitemap files

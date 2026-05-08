# UASP Decision Domain Registry v1

Scope: PR-UASP-03

Train: universal-assessment-signal-platform-v1-train

Runtime behavior changed: no

## Purpose

Decision domains connect assessment signals to user decision problems. They do not grant recommendation, SEO/GEO, freemium, profile, CTA, or routing eligibility by themselves.

This registry is contract-only. It does not change result pages, CTA routing, recommendation runtime, profile runtime, or SEO pages.

## Decision Domains

| Domain | User Problem |
|---|---|
| `self_understanding` | Understand identity, traits, motivation, interests, values, or learning pattern. |
| `career_decision` | Clarify career direction and decision support without implying recommendation runtime. |
| `workstyle_decision` | Understand work style, collaboration mode, and workplace preference. |
| `relationship_decision` | Understand relationship and communication patterns. |
| `learning_growth` | Understand learning and growth patterns. |
| `emotional_state` | Understand temporary emotional or mental-state signals. |
| `ability_growth` | Understand ability-estimate or skill-growth signals without evaluating human worth. |
| `team_communication` | Support team communication reflection. |
| `leadership_growth` | Support leadership growth reflection. |
| `life_direction` | Support value, purpose, and long-range direction reflection. |

## First Batch Scale Domain Mapping

| Scale | Domains |
|---|---|
| `MBTI` | `self_understanding`, `career_decision`, `workstyle_decision` |
| `BIG5_OCEAN` | `self_understanding`, `workstyle_decision`, `career_decision` |
| `RIASEC` | `career_decision`, `self_understanding` |
| `ENNEAGRAM` | `self_understanding`, `relationship_decision`, `workstyle_decision` |

## Domain Rules

- `emotional_state` is sensitive by default.
- `ability_growth` is ability-sensitive by default.
- `career_decision` does not imply recommendation eligibility.
- Domain mapping does not grant SEO/GEO eligibility automatically.
- Domain mapping does not grant freemium eligibility automatically.
- Domain mapping does not grant profile contribution automatically.

Plain-language lock: career_decision does not imply recommendation eligibility.

## No Runtime Change Statement

This PR adds the UASP v1 decision domain registry and contracts only. It does not change pages, routing, CTAs, profile, recommendation, public catalog, sitemap, llms, or SEO/GEO output.

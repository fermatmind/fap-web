# Implementation PR Plan

## PR 1: MBTI64-CONTENT-PACKAGE-PILOT-01-GPT55

Scope: GPT 5.5 produces 8 backend content packages from the P0/P1 pilot queue. Codex validates schema, duplication risk, compliance, and internal links. No runtime changes.

## PR 2: MBTI64-BACKEND-IMPORT-CONTRACT-01

Scope: fap-api import/validation path for public MBTI A/T content packages, preserving existing personality API authority. No scoring or result-page changes.

## PR 3: MBTI64-FRONTEND-SEO-CONSUME-01

Scope: fap-web consumes backend content assets and improves rendering semantics: H2 sections, FAQ candidates, breadcrumbs, internal links, and schema. No local editorial fallback.

## PR 4: MBTI64-SITEMAP-LLMS-SEARCH-RELEASE-01

Scope: after runtime smoke, decide sitemap/llms inclusion and search submission. Keep this separate from content import and rendering.

## PR 5: MBTI64-SEO-MEASUREMENT-01

Scope: GSC/Baidu/IndexNow cohort tracking and page-priority dashboard.

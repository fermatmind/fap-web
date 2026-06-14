# Publish Readiness Packet Runbook

## Goal

Prepare a publish/indexability decision packet without changing publish state.

## Packet

- asset list
- QA report
- duplicate/cannibalization audit
- canonical/hreflang audit
- live route smoke
- sitemap impact
- llms impact
- rollback plan

## Decision

Return `GO`, `NO_GO`, or `CONDITIONAL`. Do not publish inside this runbook.

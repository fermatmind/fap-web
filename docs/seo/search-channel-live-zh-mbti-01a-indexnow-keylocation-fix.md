# SEARCH-CHANNEL-LIVE-ZH-MBTI-01A IndexNow KeyLocation Fix

## Summary

This scoped fix restores the durable public IndexNow keyLocation on the production apex frontend release artifact. The keyLocation is served by `fap-web` as a public static verification file because apex `fermatmind.com` traffic is handled by the frontend.

The verification value is an IndexNow public site verification key, not a private API secret. The raw key is intentionally not printed in this document, the generated report, the PR body, or the final report. Validation uses body length and SHA-256 matching.

## Root Cause

The backend Search Channel live configuration pointed to an apex-hosted IndexNow keyLocation, but the corresponding static text file was missing from the frontend release. Production therefore returned HTTP 404 for the keyLocation even though the queue item and live submit dry-run were otherwise safe.

## Fix

- Added the public IndexNow verification text file to `fap-web/public`.
- Added a contract test that verifies the public verification file exists, is 32 bytes, is text-safe, matches the expected configured key hash, and is intended for apex `fermatmind.com`.
- Added a generated report that records the safety boundary without exposing the raw key.

## Safety Boundary

- No live submission was performed.
- No external search API was called.
- No Search Channel queue item was enqueued.
- No production environment was edited.
- Staging is not used as keyLocation authority.
- Backend Search Channel submitter semantics were not changed.

## Next Task

`DEPLOY-READINESS｜Deploy IndexNow keyLocation fix`

# Sitemap / LLMS Parity Check Report

## Decision

`SITEMAP_LLMS_PARITY_PASS` / `NEEDS_BACKEND_SOURCE_CACHE_WARM` / `NEEDS_PUBLIC_RUNTIME_REVALIDATION` / `LLMS_FULL_DEGRADED_RETRY_REQUIRED` / `LLMS_FULL_RUNTIME_HOLD_DOCUMENTED` / `NO_GO_PARITY_BLOCKED` / `ACCESS_REQUIRED`

## Target

| Field | Value |
|---|---|
| URL |  |
| Article ID |  |
| Expected sitemap | include / exclude |
| Expected llms | include / exclude |

## Parity matrix

| Surface | Expected | Observed | Status | Evidence |
|---|---|---|---|---|
| CMS flags |  |  |  |  |
| Backend sitemap-source |  |  |  |  |
| Public sitemap.xml |  |  |  |  |
| Public llms.txt |  |  |  |  |
| Public llms-full.txt |  |  |  |  |
| Draft/private URL exposure | none |  |  |  |

## llms-full runtime stabilization

Use this section when public `llms-full.txt` is degraded, returns an HTTP/2
stream error, or temporarily misses the target URL while backend authority,
public sitemap, and public `llms.txt` are already correct.

| Check | Expected | Observed | Status | Evidence |
|---|---|---|---|---|
| HTTP/1.1 recheck | complete or contains target URL |  |  |  |
| retry window | 5-10 minutes attempted before closeout |  |  |  |
| target article revalidation / llms-full warm | attempted when authorized |  |  |  |
| final `--expect-llms-full` verifier | pass or documented runtime hold |  |  |  |
| llms-full mode/source | complete preferred; degraded requires hold evidence |  |  |  |

## Required next action

- 

## Hard-gate attestation

No CMS mutation, deploy, cache warm, search submission, or revalidation was performed unless explicitly authorized in the task. Frontend rebuild/deploy is not the default daily sitemap refresh path. Do not mark llms-full as a documented runtime hold unless the stabilization checks above were attempted and recorded.

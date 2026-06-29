# EQ Agent Runtime V2 Staging LLM Smoke Report

Date: 2026-06-25

## 1. Executive Summary

Verdict: **blocked for live LLM mode; deterministic fallback accepted.**

The V2 provider abstraction is deployed on staging and the EQ Agent runtime remains safe. Staging was configured with the OpenAI provider, `EQ_AGENT_LLM_STAGING_ONLY=true`, and a staging OpenAI key. However, a direct staging server request to `https://api.openai.com/v1/responses` timed out after 60 seconds. The runtime therefore fell back to `deterministic_read_only` as designed.

This report does **not** approve live LLM rollout. It records that the runtime route, feature flag wiring, provider fallback, report authority guardrails, no-paywall boundary, and no-SJT-entry boundary are working on staging, while true LLM-mode smoke is blocked by staging outbound connectivity to OpenAI.

## 2. Deployment And Environment Evidence

| Item | Evidence | Status |
|---|---|---|
| Staging API | `https://staging-api.fermatmind.com` | verified |
| Staging web | `https://staging.fermatmind.com` | not browser-smoked in this PR |
| Final staging backend revision | `fed95c351d57ed918d9f025100ec693f8fb9ac5d` | verified from `REVISION` |
| Required V2-03 merge commit | `c0f0169ca1d61bed029198095c57772b5eb4bebf` | ancestor of `origin/main` and included in staging revision |
| Runtime route | `/api/v0.3/attempts/{id}/eq/agent-runtime/messages` | present after staging deploy |
| Provider | `openai` | configured |
| `EQ_AGENT_LLM_STAGING_ONLY` | `true` | configured |
| Provider key | present | configured but not printed |
| Provider model | `gpt-4.1-mini` | configured |
| Final `EQ_AGENT_LLM_ENABLED` state | `false` | disabled after blocked smoke to avoid timeout latency |

Operational note: staging briefly had `EQ_AGENT_LLM_ENABLED=true` for the smoke. After OpenAI connectivity timed out, the flag was turned back to `false` and Laravel config cache was rebuilt so staging does not incur provider timeout latency on normal Agent requests.

## 3. Smoke Attempt

| Field | Value |
|---|---|
| Artifact directory | `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117` |
| Attempt ID | `7024cad3-9414-4921-b7a2-45183850e91b` |
| Anonymous ID | `eq-agent-v2-staging-smoke-20260625-110117` |
| Scale | `EQ_60` |
| Question count | `60` |
| Submit result | `202 Accepted` async submit, then report became deliverable |
| Quality level | `C` |
| Quality flags | `["INCONSISTENT"]` |
| Confidence label | `low` |

The attempt waited 320 seconds before submit, but the answer pattern was still flagged as inconsistent. This is acceptable for V2-04 because the smoke also needs to verify low-confidence boundary behavior. It is not accepted as normal-confidence evidence.

## 4. API Payload Checks

### 4.1 Report Payload

Both `en` and `zh-CN` report reads returned a deliverable EQ v1.6 report:

```json
{
  "eq_report_mode": "self_report",
  "measurement_type": "self_report_trait_mixed_ei",
  "report_version": "eq_report_v5_assets_commercial_ready_v1_6",
  "quality": {
    "level": "C",
    "confidence_label": "low",
    "flags": ["INCONSISTENT"]
  },
  "next_module": {
    "available": false,
    "module_code": "EQ_SJT_16",
    "status": "planned"
  }
}
```

### 4.2 Agent Context

`GET /api/v0.3/attempts/7024cad3-9414-4921-b7a2-45183850e91b/eq/agent-context`

Both locales returned `ready=true` with read-only guardrails:

```json
{
  "read_only": true,
  "can_mutate_report": false,
  "can_mutate_scores": false,
  "can_override_formulation": false,
  "can_enable_sjt": false,
  "can_create_paid_unlock_language": false,
  "can_use_paid_unlock_language": false,
  "can_expose_raw_technical_tags": false,
  "content_authority": "backend_content_pack_and_report_composer"
}
```

### 4.3 Runtime Message

`POST /api/v0.3/attempts/7024cad3-9414-4921-b7a2-45183850e91b/eq/agent-runtime/messages`

Observed runtime responses:

| Locale | Status | Mode | Provider | Result |
|---|---:|---|---|---|
| `en` | `200` | `deterministic_read_only` | `null` | safe fallback |
| `zh-CN` | `200` | `deterministic_read_only` | `null` | safe fallback |
| forbidden-claim prompt | `200` | `deterministic_read_only` | `null` | safe fallback with boundary |

Expected V2 live LLM mode would be `llm_provider_read_only` with provider metadata. That did not occur because staging could not complete the OpenAI request.

## 5. OpenAI Provider Diagnostic

A direct staging server diagnostic request to `https://api.openai.com/v1/responses` was run without printing the API key.

Result:

```text
model_present=true
key_present=true
http_status=0
curl_error=Connection timed out after 60001 milliseconds
json=false
```

Application logs showed provider fallback events:

```text
EQ_AGENT_PROVIDER_FALLBACK provider=openai reason=RuntimeException
```

Conclusion: provider configuration is present, but staging cannot reach the OpenAI Responses API within the request timeout. This is an infrastructure/connectivity blocker, not a report-authority or guardrail failure.

## 6. Safety Boundary Checks

No forbidden fragments were detected in the report/context/runtime summary:

- `SKU_EQ_60_FULL_299`
- `EQ_60_FULL`
- `"locked":true`
- `"paywall":true`
- `"blur_others":true`
- `profile:`
- `quality_level:`
- `focus:`
- `bucket:`
- `MSCEIT-like`
- `certified emotional intelligence`
- `predicts hiring performance`

The forbidden-claim prompt did not produce a high-risk claim. It returned deterministic boundary language and kept the response inside existing report assets.

## 7. Artifacts

Artifacts are stored under `/tmp` and are not committed:

- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/auth.redacted.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/questions.summary.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/start.redacted.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/submit.redacted.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/report_access.raw.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/report_en.raw.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/report_zh.raw.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/context_en.raw.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/context_zh-CN.raw.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/runtime_en.raw.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/runtime_zh-CN.raw.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/runtime_forbidden.raw.json`
- `/tmp/eq_agent_runtime_v2_staging_smoke_20260625_110117/summary.redacted.json`

## 8. Credential Hygiene Note

During manual browser creation, an initial UI-created key named `eq-agent-staging` was exposed in local tool output. That key was **not accepted as the continuing staging credential**. A second key, `eq-agent-staging-v2`, was created through the encrypted OpenAI Platform flow and written to staging without printing the plaintext.

Required cleanup outside this PR:

- Delete/revoke the UI-created `eq-agent-staging` key in OpenAI Platform.
- Keep or rotate `eq-agent-staging-v2` only after staging outbound connectivity is fixed.

## 9. Risks And Blockers

| Severity | Item | Status |
|---|---|---|
| P1 | Staging cannot reach OpenAI Responses API; live LLM mode cannot be verified. | open |
| P1 | Initial UI-created key was exposed in local tool output and should be revoked. | open |
| P2 | Smoke attempt is low-confidence (`quality.level=C`) due inconsistent answer pattern. | recorded |
| P2 | Frontend staging drawer was not browser-smoked in this docs PR because live provider mode was blocked at backend API level. | recorded |

## 10. Final Decision

`Live LLM staging smoke accepted: no`

`Deterministic fallback accepted: yes`

`Proceed to controlled live LLM rollout: no`

Required next step before retrying V2-04 live LLM acceptance:

1. Fix staging outbound access to `api.openai.com:443` or configure the approved outbound proxy/base URL.
2. Re-enable `EQ_AGENT_LLM_ENABLED=true` only for the retry window.
3. Re-run backend API smoke and verify `mode=llm_provider_read_only`.
4. Re-run forbidden-claim prompts and ensure the provider response is either safe or falls back deterministically.
5. Revoke the exposed `eq-agent-staging` key.

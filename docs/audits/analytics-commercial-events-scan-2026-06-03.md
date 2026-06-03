# Analytics Commercial Events Scan - 2026-06-03

PR train item: `ANALYTICS-COMMERCIAL-EVENTS-SCAN-01`
Repo: `fap-web`
Branch: `codex/analytics-commercial-events-scan-01`
Scope: docs-only read-only scan

## 1. One-line GO / NO-GO

NO-GO for paid ads and commercial readiness dashboards.

The current repository has a privacy-filtered tracking transport and partial GA4/Baidu event mapping, but the 10-step commercial event vocabulary requested for Day 1 is not the actual runtime vocabulary. Dashboards that expect `landing_pv`, `start_test`, `complete_test`, `click_deep_report`, `begin_checkout`, `report_unlock`, or `report_ready` as first-class event names would undercount or mark true values as Unknown. Unknown must not be treated as zero.

GO for current docs-only scan scope only. No tracking runtime, analytics dashboard, CMS, order, payment, deployment, or secret state was changed.

## 2. Current Event Registry

Primary evidence:

- `lib/tracking/events.ts` defines the active tracking vocabulary.
- `lib/tracking/client.ts` maps internal event names to GA4 names and Baidu Tongji event tuples.
- `app/api/track/route.ts` accepts only registered tracking events, normalizes aliases, filters payload fields, sanitizes URLs, and forwards only when configured targets exist.
- `docs/analytics/conversion-setup-qa-checklist.md` and `docs/analytics/tracking-activation-runbook.md` document the existing business boundary.

Current commercial and adjacent registry entries found:

| Runtime event | Status | Notes |
| --- | --- | --- |
| `view_landing` | present | Legacy landing view event. |
| `landing_view` | present | Big Five landing event. Maps to GA4 `page_view`. |
| `article_to_test_click` | present | Structured article CTA click event, distinct from `start_attempt`. |
| `start_attempt` | present | Current canonical start event. |
| `submit_attempt` | present | Current canonical completion/submit event. |
| `view_result` | present | Current canonical result-view event. |
| `click_unlock` | present | Current click-deep-report / checkout-intent event. |
| `create_order` | present | Current order-created / checkout-created event. |
| `payment_confirmed` | present | Auxiliary browser payment event, not business purchase truth. |
| `purchase_success` | present | Browser purchase bridge event and Google Ads purchase trigger when configured. Business truth remains backend/Ops. |
| `pay_success` | legacy alias | Normalizes to `purchase_success`. |
| `unlock_success` | present in registry | Maps to GA4 `report_unlock`, but this scan did not prove it is the production business unlock truth. |

Canonical SEO funnel events currently recorded in code:

1. `start_attempt`
2. `submit_attempt`
3. `view_result`
4. `click_unlock`
5. `create_order`
6. `payment_confirmed`
7. `purchase_success`

Alias normalization exists for older product names such as `start_click`, `submit_click`, `checkout_start`, and `pay_success`.

## 3. Standard Commercial Event Mapping

Requested Day 1 standard chain:

1. `landing_pv`
2. `article_to_test_click`
3. `start_test`
4. `complete_test`
5. `view_result`
6. `click_deep_report`
7. `begin_checkout`
8. `purchase_success`
9. `report_unlock`
10. `report_ready`

Current mapping and gaps:

| Standard event | Current fap-web equivalent | Status | Risk |
| --- | --- | --- | --- |
| `landing_pv` | `view_landing`, `landing_view`, GA4 `page_view` | mismatch | No single canonical standard name. Dashboard must not assume `landing_pv` exists. |
| `article_to_test_click` | `article_to_test_click` | pass | Existing article CTA event maps to GA4 with the same name. |
| `start_test` | `start_attempt`, GA4 `test_start` | mismatch | Runtime emits `start_attempt`, not `start_test`. |
| `complete_test` | `submit_attempt`, GA4 `test_submit` | mismatch | Runtime emits `submit_attempt`, not `complete_test`. |
| `view_result` | `view_result`, GA4 `result_view` | pass | Present. |
| `click_deep_report` | `click_unlock`, GA4 `checkout_start` | mismatch | Runtime and docs call this checkout intent, not `click_deep_report`. |
| `begin_checkout` | `create_order`, legacy `checkout_start` alias | mismatch | Runtime normalizes `checkout_start` to `create_order`; no exact `begin_checkout` event. |
| `purchase_success` | `purchase_success`, legacy `pay_success` alias | partial pass | Present, but business purchase truth remains backend/Ops, not browser-only telemetry. |
| `report_unlock` | `unlock_success` maps to GA4 `report_unlock`; backend/Ops truth | not proven | No repo-level proof that browser `report_unlock` is the authoritative production unlock metric. |
| `report_ready` | backend/Ops truth and result fixtures/reason codes | missing as frontend commercial event | No first-class standard browser event found. Treat as backend/Ops only until defined. |

The main gap is not that no telemetry exists. The gap is that the operations baseline and desired commercial chain use business-facing names while the frontend runtime uses legacy/canonical SEO names. This requires an explicit taxonomy adapter or runtime normalization plan before paid acquisition reporting.

## 4. GA4 Readiness

GA4 is partially ready for public funnel observation:

| Internal event | GA4 event | Current readiness |
| --- | --- | --- |
| `landing_view` / `view_landing` | `page_view` | Partial. Script config sets `send_page_view: false`, so page view ownership must be explicit. |
| `article_to_test_click` | `article_to_test_click` | Ready as exploratory event. Not a Key Event by default. |
| `start_attempt` | `test_start` | Ready by code mapping and tests. |
| `submit_attempt` | `test_submit` | Ready by code mapping and tests. |
| `view_result` | `result_view` | Ready by code mapping and tests. |
| `click_unlock` | `checkout_start` | Ready as checkout intent, not purchase. |
| `create_order` | `order_created` | Ready as order-created telemetry, not purchase. |
| `payment_confirmed` | `payment_success` | Auxiliary only. Not primary purchase truth. |
| `purchase_success` | `payment_success` plus Google Ads conversion when configured | Partial. Browser bridge exists; business truth remains backend/Ops. |

Positive evidence:

- `trackClientEvent` dispatches GA4 events through `gtag("event", mappedName, ...)`.
- `purchase_success` is the only event that can trigger the Google Ads purchase conversion bridge.
- Contract tests assert that non-purchase funnel events do not send Google Ads purchase conversions.
- Repeated purchase dispatches are deduped in a short browser window.

Remaining GA4 blockers:

- No live GA4 property/dashboard verification was performed in this PR.
- Standard commercial names are not first-class in the runtime vocabulary.
- `landing_pv`, `report_unlock`, and `report_ready` cannot be treated as confirmed GA4 metrics from fap-web alone.
- Dashboard owners must not mix built-in GA4 `purchase`, browser `purchase_success`, and backend `payment_success` as duplicate business purchase success.

## 5. Baidu Readiness

Baidu is partial and auxiliary only.

Positive evidence:

- Browser analytics bootstrap can load Baidu Tongji only when analytics is enabled, production host checks pass, route is public, sensitive query keys are absent, and consent exists.
- `buildBaiduTongjiConversionEvent` maps public conversion-style events to category/action/label tuples:
  - `test_start`: `test/start`
  - `test_submit`: `test/complete`
  - `result_view`: `result/view`
  - `checkout_start`: `checkout/begin`
  - `order_created`: `checkout/order`
- Existing docs warn that Baidu should remain PV/UV, source, search-term, entrance-page, visited-page, and public CTA auxiliary analysis.

NO-GO conditions:

- Baidu must not be used as private funnel, purchase, result, order, payment, share, or report-unlock truth.
- This PR did not verify the live Baidu dashboard.
- The current standard commercial chain is not represented as exact Baidu event names.
- Baidu dashboard setup after the platform change may not support old `_trackEvent` conversion-goal assumptions.

## 6. First-party `/api/track` Readiness

`/api/track` is ready as privacy-filtered transport for existing registered events, not as business truth.

Positive evidence:

- The route rejects unknown events with `invalid_event`.
- The route normalizes legacy aliases before filtering.
- Event payloads are filtered by per-event allowlists.
- Request path and URL-valued fields are sanitized.
- Locale and safe tracking labels are added server-side.
- If no ingest targets are configured, it returns `ok: true` with `forwarded: 0` rather than inventing a backend sink.

Current gap:

- The requested standard names `landing_pv`, `start_test`, `complete_test`, `click_deep_report`, `begin_checkout`, `report_unlock`, and `report_ready` are not all registered `/api/track` event names.
- Therefore a dashboard or issue queue that queries those names directly will miss current runtime events unless a read-model mapping is added.

## 7. Payload Privacy Matrix

| Surface | Current protection | Scan result |
| --- | --- | --- |
| Browser analytics bootstrap | Blocks private route families and sensitive query keys before loading analytics scripts. | PASS for code-level boundary. |
| `trackEvent` and observable funnel dispatch | Requires analytics enabled, production allowance, and consent. | PASS for consent boundary. |
| `/api/track` route | Rejects unknown events, filters payload fields, sanitizes path. | PASS for existing event names. |
| Article CTA tracking | Allows only public localized test detail destinations and safe attribution fields. | PASS. |
| Result/order identifiers | Contract tests assert masking/redaction before dispatch. | PASS for tested paths. |
| Order and purchase payload | Tests assert no cleartext `orderNo` is constructed for purchase analytics. | PASS for tested path. |
| Baidu private URL exposure | Bootstrap blocks private route segments and sensitive query keys. | PASS for code-level boundary; live dashboard not checked. |

Privacy result: current code-level privacy contracts pass, but live analytics dashboards were not inspected. Any live `private_url_seen=Yes` remains an immediate freeze condition for publish/search submission/ads.

## 8. Dedupe / Idempotency Risks

Current safeguards:

- `trackClientEvent` suppresses duplicate standard conversion dispatches inside a short browser window.
- Tests cover repeated `purchase_success` dispatch in the same browser tick window.
- Google Ads conversion bridge only fires for normalized `purchase_success`.
- Non-purchase events are explicitly tested to avoid Google Ads purchase conversion.

Remaining risks:

- Browser-window dedupe is not backend payment idempotency.
- `purchase_success`, `payment_confirmed`, and backend/Ops `payment_success` can still be double-counted if reporting merges them without a source-of-truth rule.
- `begin_checkout` and `create_order` semantics are mixed in docs and runtime aliases; reporting must decide whether checkout intent or order creation is being counted.
- `report_unlock` and `report_ready` are backend/Ops state transitions until a privacy-safe bridge is explicitly approved.
- Unknown data must remain Unknown, not zero, especially for live GA4/Baidu/dashboard gaps.

## 9. Follow-up PR Scope: `ANALYTICS-COMMERCIAL-EVENTS-01`

Recommended next fix PR:

PR id: `ANALYTICS-COMMERCIAL-EVENTS-01`
Repo: `fap-web`
Branch: `codex/analytics-commercial-events-01`
PR title: `fix(analytics): align commercial event taxonomy`

Proposed scope:

- Add a canonical commercial event taxonomy artifact that maps:
  - standard commercial event name
  - current runtime event name
  - GA4 event name
  - Baidu auxiliary category/action/label
  - first-party `/api/track` name
  - backend/Ops source of truth
  - whether Unknown is allowed
- Add contract coverage that freezes the mapping for:
  - `landing_pv`
  - `article_to_test_click`
  - `start_test`
  - `complete_test`
  - `view_result`
  - `click_deep_report`
  - `begin_checkout`
  - `purchase_success`
  - `report_unlock`
  - `report_ready`
- Decide whether to:
  - keep runtime names and add dashboard/read-model adapters, or
  - add mechanical standard aliases that normalize to existing runtime names before dispatch.
- Keep browser telemetry out of business purchase, report-unlock, and report-ready authority unless backend explicitly exposes a privacy-safe read model.
- Add a dashboard rule that Unknown values are displayed as Unknown, not zero.

Likely allowed files for the follow-up:

- `lib/tracking/**`
- `tests/contracts/*tracking*`
- `tests/contracts/*analytics*`
- `docs/analytics/**`
- `docs/audits/**`
- `docs/codex/pr-train.yaml`
- `docs/codex/pr-train-state.json`

Deferred from this follow-up unless separately authorized:

- No GA4 or Baidu dashboard writes.
- No Google Ads conversion expansion beyond purchase.
- No backend payment/order truth changes.
- No CMS/content/publish/search-submission changes.
- No real purchase/order tests.

## 10. Backend Truth vs Browser Event Boundary

Boundary confirmed by current docs and code:

- Browser and first-party `/api/track` events are telemetry, not authority.
- Backend/Ops remains the authority for payment success, report unlock, report ready, entitlement, and benefit records.
- GA4 is a public-funnel reporting surface.
- Baidu Tongji is auxiliary public traffic and public CTA analysis only.
- Google Ads purchase conversion may be fired only from the authorized `purchase_success` bridge when configured, and it must not become the sole business purchase source of truth.

Commercial readiness implication:

- Paid ads remain forbidden until the standard event taxonomy is reconciled and live dashboard/backend reporting can distinguish Unknown from zero.
- Natural multimedia distribution may continue only if it does not rely on paid conversion claims or unverified purchase/report metrics.
- Daily Giving public amplification is outside this fap-web event scan and remains governed by its separate readiness scan.

## Validation

Commands run:

```bash
git status --short --branch
git log -n 5 --oneline
rg -n "start_attempt|submit_attempt|click_unlock|create_order|purchase_success|purchase|begin_checkout|article_to_test_click|view_result|report_unlock|report_ready" app components lib tests docs -S
rg -n "gtag|_hmt|trackEvent|/api/track|EVENT_FIELD_WHITELIST|TRACKING_EVENTS" app components lib tests -S
pnpm exec vitest run tests/contracts/tracking-whitelist.contract.test.ts tests/contracts/analytics-payload-privacy.contract.test.ts tests/contracts/seo-cms-canary-web01-article-to-test-click.contract.test.tsx
pnpm typecheck
```

Results:

- Focused contract tests: PASS, 3 files / 22 tests.
- Typecheck: PASS.
- Runtime changed: no.
- Tests changed: no.
- CMS changed: no.
- Analytics dashboard changed: no.
- Search submission changed: no.
- Deployment changed: no.
- Secrets read or stored: no.

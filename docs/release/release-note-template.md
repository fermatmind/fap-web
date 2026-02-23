# Release Note Template

## Release
- Tag: `web@YYYY-MM-DD+<scope>`
- Date:
- Owner:
- Commit SHA:

## Fix Summary
- [ ] Clinical consent submit gate (`start` + `submit`)
- [ ] Crisis UI lock (fullscreen + fixed banner + no upsell)
- [ ] SDS 4-factor rendering hardening
- [ ] MBTI regression pass
- [ ] UAT matrix pass
- [ ] Rollout/ops gate pass

## Affected Scales
- [ ] MBTI
- [ ] BIG5_OCEAN
- [ ] CLINICAL_COMBO_68
- [ ] SDS_20

## Contract Changes
- `submit` payload optional consent:
  - `consent.accepted`
  - `consent.version`
  - `consent.locale`
- rollout env:
  - `ENABLE_*`
  - `ROLLOUT_PERCENT_*`
  - `ENABLE_*_COMMERCE`

## Ops Evidence
- Build hash artifact path:
- UAT mock result:
- UAT live result:
- Rollback drill result:

## Risk / Mitigation
- Risk:
- Mitigation:
- Rollback target tag:


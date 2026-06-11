# Claim Gate Playbook

Purpose: review content for claim safety before preview, publish, or search readiness.

Block or escalate:

- diagnosis, treatment, cure, clinical claims.
- hiring fit or job performance certainty.
- salary, promotion, or career success guarantees.
- precise best-career predictions.
- unsupported psychometric claims involving MBTI, Big Five, RIASEC, Enneagram, IQ, or clinical categories.
- claims without references.
- claims not reflected in `claim_gate.md` or operator review.

Outputs:

- Claim section in QA report.
- `CLAIM_GATE_REPORT.md` when needed using `assets/claim_gate_report_template.md`.

Decision:

- `CLAIM_SAFE`.
- `CLAIM_WARNING_NEEDS_OPERATOR_ACK`.
- `CLAIM_BLOCKED`.

No-go: do not rewrite claims into production content or approve blocked claims.

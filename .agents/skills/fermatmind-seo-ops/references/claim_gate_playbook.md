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

## V1.1 career resilience / industry-change claim gate

Apply this stricter taxonomy when a topic mentions career resilience, layoffs, industry change, AI disruption, future-proofing, career security, employability, or economic uncertainty.

Block or escalate these claims:

- layoff-risk prediction.
- recession-proof or AI-proof career guarantee.
- guaranteed career security.
- employability score, resilience score, or career-risk score unless an approved source and operator/legal review explicitly allow it.
- salary, promotion, hiring fit, job performance, or career-success prediction.
- deterministic use of Big Five, MBTI, RIASEC, Enneagram, or IQ for employment outcomes.
- best career, perfect fit, most accurate career path, or guaranteed career match.

Preferred safe framing:

- describe personality and interest tools as reflection inputs.
- separate personal preferences from labor-market evidence.
- use planning, tradeoff, and question prompts instead of prediction language.
- state that tests do not diagnose, rank candidates, forecast layoffs, guarantee security, or determine salary.

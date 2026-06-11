# Ops Portal SEO Playbook

Purpose: safely use `/ops/seo` evidence.

Inputs:

- Operator screenshot or exported summary from `/ops/seo`.
- Repo source evidence if available.

Check:

- Access boundary.
- URL Truth cards.
- Issue Queue cards.
- Metabase link/access notes.
- Search Channel Queue cards.
- Crawler/readiness safety cards.
- Current row counts if provided.

Rules:

- Do not log in unless operator explicitly asks and access is available.
- Do not modify Ops Portal permissions.
- Do not use `/ops/seo-operations` write actions.
- If live UI is not accessible, mark `Access required`.

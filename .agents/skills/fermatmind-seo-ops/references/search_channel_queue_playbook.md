# Search Channel Queue Playbook

Purpose: read-only Search Channel Queue audit.

Inputs:

- Queue export or operator-provided row snapshot.
- Target channel.
- Target URL list.

Checks:

- URL public.
- URL indexable.
- URL sitemap eligible.
- URL llms eligible.
- URL claim safe.
- URL private safe.
- Canonical correct.
- noindex false.
- draft false.
- approval present.
- channel allowed.
- execution state safe.
- reason codes clear.

Output: `SEARCH_CHANNEL_QUEUE_AUDIT.md` using `assets/search_channel_queue_report_template.md`.

No-go:

- Do not enqueue.
- Do not approve.
- Do not submit.
- Do not call GSC, Baidu, IndexNow, 360, Sogou, or Shenma.

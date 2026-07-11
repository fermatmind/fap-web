# AUDIT-PRR2-WEB-03 Topic Discoverability Authority

Topic detail discovery is backend/CMS-authoritative. The frontend may expose only topic rows returned as both public and indexable by `/v0.5/topics` for the requested locale.

Runtime order is fresh backend authority, then a previously validated in-process last-known-good value on transient failure, then an empty discoverability set. A successful empty response replaces the prior LKG, so unpublish, noindex, or deletion converges to removal. The frontend does not use topic fixtures to populate sitemap, `llms.txt`, or `llms-full.txt`.

Repository rule impact: this implements the existing backend-authority and stale-LKG/minimal-shell rules. It does not create content, publish CMS records, widen the topic graph, or execute production writes.

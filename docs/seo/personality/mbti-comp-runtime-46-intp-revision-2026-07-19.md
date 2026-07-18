# MBTI-COMP-RUNTIME-46 INTP-A vs INTP-T Revision Package

Final decision: `APPROVED_EXACT_ONE_RECORD_INTP_REVISION_FOR_PREFLIGHT_NO_PRODUCTION_WRITE_AUTHORIZED`

- Target: `/zh/personality/intp-a-vs-intp-t`
- Record count: `1`
- Required section count: `9`
- Exact payload SHA256: `10b306f2dbac4f9a801a7718ec5584d84f56f6de601ada0f8f677bcb163f960e`
- Source package SHA256: `5fcf54132504ef85978a5424e428fb56763ffbaa7c60f50b94b9c91fc3e85dc8`
- Authorization payload SHA256: `7a84cda503b6f328f0659ee5bd41c85f51c1eca44ac9aa7cfa721d59ab6197e2`
- Production write authorized: `false`
- Publication/indexability/sitemap/llms/search mutation authorized: `false`

## Rollback and readback

The importer must create at most one draft revision, keyed by the exact approval record id and payload hash. Any mismatch fails closed. Rollback removes only that draft revision. Readback must prove the exact nine section keys and preserve publication, indexability, sitemap, and llms state.

A separate operator authorization matching all three hashes is required before any production CMS/database write.

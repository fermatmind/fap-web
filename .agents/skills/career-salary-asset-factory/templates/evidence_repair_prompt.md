当前任务：修复指定 batch 的 salary evidence ledger。

不要生成 estimate ledger。
不要生成 salary asset。
不要修改 frozen control baseline。
不要自称 PASS。

输入：
- batch manifest: {{BATCH_MANIFEST}}
- prior evidence/audit: {{AUDIT_REPORTS}}
- source registry: references/source_registry.json

输出：
- repaired evidence JSONL for this batch only
- validation JSON

必须修复：
- CN usable evidence path
- US source labels and official evidence
- UK direct/adjacent evidence
- quality_flags consistency

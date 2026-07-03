# PR Train Sidecar Issues

## BIG5 Result Page Recovery Banner Renderer Copy

- repo: fap-web
- PR id / branch: BIG5-RESULT-PAGE-RENDERER-HYGIENE-FOLLOWUP-01 / codex/big5-result-page-renderer-hygiene-followup-01
- blocker type: out_of_scope_renderer_shell_copy
- evidence: live zh Big Five result page showed the result recovery banner eyebrow `结果找回` and helper text `这不会阻塞当前免费结果预览。保存后，我们会把访问链接发送到你的邮箱，方便换设备或稍后继续查看。`; local search maps this to `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx`.
- why not current PR scope: PR14 scope is limited to `lib/big5/**`, `components/big5/**`, `components/result/big5/**`, and Big Five contracts; changing the generic result client recovery banner would affect non-Big-Five result pages and requires a separate result-shell UX scope.
- whether required checks are affected: no; current Big Five renderer hygiene checks can pass without changing the generic recovery banner.
- recommended follow-up: open a scoped fap-web PR for result recovery banner UX, with assertions covering Big Five and non-Big-Five result pages.

"use client";

import { useCallback, useEffect, useState } from "react";
import { buildApiUrl } from "@/lib/api-base";
import { accountText } from "@/lib/account/displayLocale";
import { careerGuestHeaders } from "@/lib/commerce/guestOwnership";
import { getFmToken } from "@/lib/auth/fmToken";

type RefundView = {
  currency: string; amount_cents: number; amount_refunded: number; can_request: boolean; payment_state: string;
  request: null | { id: string; status: string; decision_note: string | null; reason_code: string; detail: string | null };
};

export function CareerRefundPanel({ orderNo, locale, onRefunded }: { orderNo: string; locale: string; onRefunded?: () => void }) {
  const zh = locale.startsWith("zh");
  const t = (cn: string, en: string) => zh ? accountText(locale === "zh-TW" ? "zh-TW" : "zh", cn) : en;
  const [view, setView] = useState<RefundView>();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("not_as_expected");
  const [detail, setDetail] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const endpoint = buildApiUrl(`/v0.5/career-assessment/orders/${encodeURIComponent(orderNo)}/refund`);

  const read = useCallback(async (signal?: AbortSignal) => {
    const token = getFmToken();
    if (!token) return;
    const response = await fetch(endpoint, { cache: "no-store", credentials: "omit", headers: { ...careerGuestHeaders(), Authorization: `Bearer ${token}` }, signal: signal ?? AbortSignal.timeout(15000) });
    if (response.status === 404) return; // This workspace currently supports Career94 purchases.
    if (!response.ok) throw new Error("REFUND_UNAVAILABLE");
    const next = await response.json() as RefundView;
    setView(next);
    setError(false);
  }, [endpoint]);

  useEffect(() => {
    const abort = new AbortController();
    void read(AbortSignal.any([abort.signal, AbortSignal.timeout(15000)])).catch(() => { if (!abort.signal.aborted) setError(true); });
    return () => abort.abort();
  }, [read]);

  const status = view?.payment_state === "refunded" ? "succeeded" : view?.request?.status;
  useEffect(() => {
    if (status === "succeeded") onRefunded?.();
  }, [status, onRefunded]);
  useEffect(() => {
    if (!status || !["pending", "approved", "processing", "attention"].includes(status)) return;
    const interval = window.setInterval(() => { void read().catch(() => setError(true)); }, 15000);
    return () => window.clearInterval(interval);
  }, [status, read]);

  async function submit(method: "POST" | "DELETE") {
    setBusy(true); setError(false);
    try {
      const token = getFmToken();
      if (!token) throw new Error("ACCOUNT_REQUIRED");
      const response = await fetch(endpoint, {
        method, cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(15000),
        headers: { ...careerGuestHeaders(), Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        ...(method === "POST" ? { body: JSON.stringify({ reason_code: reason, detail, acknowledged }) } : {}),
      });
      if (!response.ok) throw new Error("REFUND_UNAVAILABLE");
      setView(await response.json() as RefundView); setOpen(false);
    } catch { setError(true); } finally { setBusy(false); }
  }

  if (!view) return error ? <p role="status" className="text-sm print:hidden">{t("退款入口暂时无法读取。", "Refund details are temporarily unavailable.")}{" "}<button type="button" className="underline" onClick={() => void read().catch(() => setError(true))}>{t("重试", "Retry")}</button></p> : null;
  if (!view.can_request && !view.request && status !== "succeeded") return null;
  const labels: Record<string, string> = {
    pending: t("待审核", "Awaiting review"), approved: t("已批准，等待系统执行退款", "Approved, awaiting refund processing"),
    processing: t("退款处理中，等待支付渠道确认", "Refund processing, awaiting payment provider confirmation"),
    succeeded: t("已退款", "Refunded"), rejected: t("申请未通过", "Request declined"),
    withdrawn: t("申请已撤回", "Request withdrawn"), attention: t("退款正在核对，无需重复申请", "Your refund is being checked. No need to apply again"),
  };

  return <section aria-label={t("退款申请", "Refund request")} className="mx-auto my-6 max-w-2xl space-y-3 rounded-xl border border-current/20 p-5 text-sm print:hidden">
    <h2 className="font-semibold">{t("退款申请", "Refund request")}</h2>
    <p>{t("职业测试 94 题 · 本次订单", "94-question career assessment · This order")} · {view.currency} {(view.amount_cents / 100).toFixed(2)}</p>
    {status && <p role="status">{labels[status] ?? t("正在处理", "Processing")}{status === "succeeded" ? ` · ${view.currency} ${(view.amount_refunded / 100).toFixed(2)}` : ""}</p>}
    {view.request?.decision_note && <p>{view.request.decision_note}</p>}
    {view.can_request && !open && <button className="underline" type="button" onClick={() => setOpen(true)}>{t("申请退款", "Request a refund")}</button>}
    {view.request?.status === "pending" && <button className="underline" type="button" disabled={busy} onClick={() => void submit("DELETE")}>{t("撤回申请", "Withdraw request")}</button>}
    {open && view.can_request && <form className="space-y-3" onSubmit={event => { event.preventDefault(); void submit("POST"); }}>
      <label className="block">{t("退款原因", "Reason")}
        <select className="mt-1 block w-full rounded border border-current/30 bg-inherit p-2" value={reason} onChange={event => setReason(event.target.value)} disabled={busy}>
          <option value="access_problem">{t("报告无法打开", "Cannot access the report")}</option>
          <option value="duplicate_purchase">{t("重复购买", "Duplicate purchase")}</option>
          <option value="not_as_expected">{t("内容不符合预期", "Report did not meet expectations")}</option>
          <option value="other">{t("其他", "Other")}</option>
        </select>
      </label>
      <label className="block">{t("补充说明（选填）", "Additional details (optional)")}
        <textarea className="mt-1 block w-full rounded border border-current/30 bg-inherit p-2" maxLength={1000} value={detail} onChange={event => setDetail(event.target.value)} disabled={busy} />
      </label>
      <p>{t("申请将由工作人员审核，审核结果和退款进度可在此查看。款项按原支付方式退回，到账时间以支付渠道为准。", "Your request will be reviewed by our team. Check the decision and progress here. Refunds return to the original payment method; arrival time depends on the provider.")}</p>
      <label className="flex items-start gap-2"><input type="checkbox" required checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} disabled={busy} />
        {t("我理解退款成功后，本次付费报告将停止访问，免费结果保留。", "I understand that paid access to this report ends after a successful refund. Free results remain available.")}
      </label>
      <button className="rounded border border-current/30 px-4 py-2" type="submit" disabled={busy || !acknowledged}>{busy ? t("正在提交…", "Submitting…") : t("提交退款申请", "Submit refund request")}</button>{" "}
      <button type="button" className="underline" disabled={busy} onClick={() => setOpen(false)}>{t("取消", "Cancel")}</button>
    </form>}
    {error && <p role="alert">{t("暂时无法处理，请刷新进度后重试。", "Unable to complete this action. Refresh the status and try again.")}</p>}
  </section>;
}

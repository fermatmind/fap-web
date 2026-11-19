"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCheckoutOrOrder } from "@/lib/api/v0_3";
import { resolveCheckoutAction } from "@/lib/commerce/checkoutAction";
import { writePendingOrder } from "@/lib/commerce/pendingOrder";
import { buildApiUrl } from "@/lib/api-base";
import { careerGuestHeaders } from "@/lib/commerce/guestOwnership";
import { getFmToken } from "@/lib/auth/fmToken";
import { normalizeCommercePaymentRedirectUrl } from "@/lib/commerce/redirectUrls";
import styles from "./CareerAssessmentResult.module.css";
import type { Career94Market, Career94Offer, Career94Result } from "./career94-api";
import type { Locale } from "./CareerAssessmentForm";

function offerLabel(offer: Career94Offer, zh: boolean): string {
  const channel = offer.provider === "alipay" ? (zh ? "支付宝" : "Alipay")
    : offer.currency === "CNY" ? (zh ? "微信支付" : "WeChat Pay") : (zh ? "海外银行卡" : "International card");
  return `${channel} · ${offer.currency === "CNY" ? "¥" : "US$"}${(offer.amount_cents / 100).toFixed(2)}`;
}

async function launchCheckout(offer: Career94Offer, attemptId: string, locale: Locale, navigate: (href: string) => void) {
  const order = await createCheckoutOrOrder({ attemptId, sku: offer.sku, provider: offer.provider });
  const action = resolveCheckoutAction(order, "Checkout is unavailable.");
  if (action.kind === "error" || !action.orderNo) throw new Error("CHECKOUT_UNAVAILABLE");
  writePendingOrder({
    orderNo: action.orderNo, attemptId, sku: offer.sku, provider: action.provider,
    waitUrl: action.waitUrl, paymentRecoveryToken: action.paymentRecoveryToken, resultUrl: action.resultUrl,
  });
  if (offer.provider === "alipay") {
    const launchPath = action.kind === "redirect" ? action.url : action.payValue;
    if (!launchPath || !launchPath.startsWith(`/api/v0.3/orders/${encodeURIComponent(action.orderNo)}/pay/alipay?`)) {
      throw new Error("CHECKOUT_UNAVAILABLE");
    }
    const response = await fetch(buildApiUrl(launchPath), {
      cache: "no-store", credentials: "omit", redirect: "error",
      headers: { ...careerGuestHeaders(), Accept: "application/json", Authorization: `Bearer ${getFmToken() ?? ""}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("CHECKOUT_UNAVAILABLE");
    const redirect = normalizeCommercePaymentRedirectUrl((await response.json()).redirect_url, "alipay");
    if (!redirect) throw new Error("CHECKOUT_UNAVAILABLE");
    window.location.assign(redirect);
  } else if (action.kind === "redirect") window.location.assign(action.url);
  else if (action.payType === "html" && action.payValue) window.location.assign(action.payValue);
  else navigate(`/${locale}/pay/wait?order_no=${encodeURIComponent(action.orderNo)}`);
}

export function Career94SaveResult({ locale, offers, onSave }: {
  locale: Locale;
  offers: Career94Offer[];
  onSave: (market: Career94Market) => Promise<Career94Result>;
}) {
  const zh = locale === "zh";
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "failed">("idle");

  async function pay(offer: Career94Offer) {
    setState("busy");
    try {
      const saved = await onSave(offer.currency === "CNY" ? "CN_MAINLAND" : "INTERNATIONAL");
      if (saved.unlocked) {
        router.push(`/${locale}/career/assessment/result/${saved.attempt_id}`);
        return;
      }
      if (saved.order_no && saved.payment_state !== "canceled") {
        router.push(`/${locale}/pay/wait?order_no=${encodeURIComponent(saved.order_no)}`);
        return;
      }
      const available = saved.offers.find(item => item.sku === offer.sku && item.provider === offer.provider);
      if (!available) throw new Error("CHECKOUT_UNAVAILABLE");
      await launchCheckout(available, saved.attempt_id, locale, router.push);
    } catch {
      setState("failed");
    }
  }

  return <div className={styles.purchase}>
    {offers.map(offer => <button key={`${offer.sku}:${offer.provider}`} type="button" className={styles.cta}
      onClick={() => void pay(offer)} disabled={state === "busy"}>
      {state === "busy" ? (zh ? "正在打开收银台…" : "Opening checkout…") : offerLabel(offer, zh)}
    </button>)}
    <p>{zh ? "一次付款，解锁本次完整报告。" : "One payment unlocks this full report."}{" "}
      <Link href={`/${locale}/refund`}>{zh ? "退款政策" : "Refund policy"}</Link>
    </p>
    {state === "failed" && <p role="alert">{zh ? "暂时无法打开支付，请重试。" : "Checkout is unavailable. Please try again."}</p>}
  </div>;
}

export function Career94Checkout({ locale, attemptId, offers }: {
  locale: Locale;
  attemptId: string;
  offers: Career94Offer[];
}) {
  const zh = locale === "zh";
  const router = useRouter();
  const failure = zh ? "暂时无法发起支付。请重试或查看已有订单。" : "Checkout is unavailable. Try again or check your existing order.";
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function checkout(offer: Career94Offer) {
    setBusy(true);
    setFailed(false);
    try {
      await launchCheckout(offer, attemptId, locale, router.push);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return <div className={styles.purchase}>
    {offers.map(offer => {
      return <button key={offer.provider} type="button" className={styles.cta} onClick={() => void checkout(offer)} disabled={busy}>
        {busy ? (zh ? "正在打开收银台…" : "Opening checkout…") : offerLabel(offer, zh)}
      </button>;
    })}
    <p>{zh ? "一次付款，解锁本次报告。请在付款前查看" : "One payment unlocks this report. Before paying, review the"}{" "}
      <Link href={`/${locale}/refund`}>{zh ? "退款政策" : "refund policy"}</Link>
      {zh ? "。" : "."}
    </p>
    {offers.some(offer => offer.currency === "USD") && <p>{zh ? "发卡机构可能按本币结算。" : "Your card issuer may convert the charge to your local currency."}</p>}
    {failed && <p role="alert">{failure}{" "}<Link href={`/${locale}/account?section=orders`}>{zh ? "我的订单" : "My orders"}</Link></p>}
  </div>;
}

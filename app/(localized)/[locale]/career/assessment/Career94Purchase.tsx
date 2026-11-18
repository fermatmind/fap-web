"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAccountSession } from "@/lib/account/storage";
import { createCheckoutOrOrder } from "@/lib/api/v0_3";
import { resolveCheckoutAction } from "@/lib/commerce/checkoutAction";
import { writePendingOrder } from "@/lib/commerce/pendingOrder";
import styles from "./CareerAssessmentResult.module.css";
import type { Career94Market, Career94Offer } from "./career94-api";
import type { Locale } from "./CareerAssessmentForm";

export function Career94SaveResult({ locale, markets, onSave }: {
  locale: Locale;
  markets: Career94Market[];
  onSave: (market: Career94Market) => Promise<void>;
}) {
  const zh = locale === "zh";
  const [chosenMarket, setMarket] = useState<Career94Market>(markets.length === 1 ? markets[0] : zh ? "CN_MAINLAND" : "INTERNATIONAL");
  const [state, setState] = useState<"idle" | "busy" | "login" | "failed">("idle");

  async function save() {
    if (!isAccountSession()) {
      setState("login");
      return;
    }
    setState("busy");
    try {
      await onSave(chosenMarket);
    } catch (error) {
      setState(error instanceof Error && error.message === "ACCOUNT_REQUIRED" ? "login" : "failed");
    }
  }

  return <div className={styles.purchase}>
    <label>{zh ? "付款地区" : "Payment market"}
      <select value={chosenMarket} onChange={event => setMarket(event.target.value as Career94Market)} disabled={state === "busy"}>
        {markets.includes("CN_MAINLAND") && <option value="CN_MAINLAND">{zh ? "中国大陆 · ¥2.99" : "Mainland China · CNY 2.99"}</option>}
        {markets.includes("INTERNATIONAL") && <option value="INTERNATIONAL">{zh ? "其他地区 · US$2.99" : "Other markets · US$2.99"}</option>}
      </select>
    </label>
    <button type="button" className={styles.cta} onClick={() => void save()} disabled={state === "busy"}>
      {state === "busy" ? (zh ? "正在保存结果…" : "Saving your result…") : (zh ? "保存结果并选择付款方式" : "Save result and choose payment")}
    </button>
    {state === "login" && <p role="status">{zh ? "请先登录费马账户，再回此页继续。" : "Sign in to your FermatMind account, then return here."}{" "}
      <Link href={`/${locale}/account`} target="_blank" rel="noopener">{zh ? "登录账户" : "Sign in"}</Link>
    </p>}
    {state === "failed" && <p role="alert">{zh ? "结果暂未保存，请重试。" : "We couldn't save your result. Please try again."}</p>}
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
      const order = await createCheckoutOrOrder({ attemptId, sku: offer.sku, provider: offer.provider });
      const action = resolveCheckoutAction(order, failure);
      if (action.kind === "error" || !action.orderNo) throw new Error(failure);
      writePendingOrder({
        orderNo: action.orderNo,
        attemptId,
        sku: offer.sku,
        provider: action.provider,
        waitUrl: action.waitUrl,
        paymentRecoveryToken: action.paymentRecoveryToken,
        resultUrl: action.resultUrl,
      });
      if (action.kind === "redirect" && offer.provider === "waffo") window.location.assign(action.url);
      else router.push(`/${locale}/pay/wait?order_no=${encodeURIComponent(action.orderNo)}`);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return <div className={styles.purchase}>
    {offers.map(offer => {
      const title = offer.provider === "alipay" ? (zh ? "支付宝" : "Alipay")
        : offer.currency === "CNY" ? (zh ? "微信支付" : "WeChat Pay") : "Waffo";
      const price = `${offer.currency === "CNY" ? "¥" : "US$"}${(offer.amount_cents / 100).toFixed(2)}`;
      return <button key={offer.provider} type="button" className={styles.cta} onClick={() => void checkout(offer)} disabled={busy}>
        {title} · {price}
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

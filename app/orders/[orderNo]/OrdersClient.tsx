"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderStatus } from "@/lib/api/v0_3";
import { getAnonymousId, trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/observability/sentry";

type ViewStatus = "pending" | "paid" | "failed";

const POLL_MS = 2000;
const TIMEOUT_MS = 45000;

export default function OrdersClient({ orderNo }: { orderNo: string }) {
  const [status, setStatus] = useState<ViewStatus>("pending");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("Confirming your payment...");
  const isPolling = useRef(true);
  const startedAt = useRef(0);
  const reportedStatus = useRef<ViewStatus | null>(null);

  useEffect(() => {
    let active = true;
    startedAt.current = Date.now();

    const poll = async () => {
      try {
        const anonId = getAnonymousId();
        const response = await getOrderStatus({ orderNo, anonId });
        if (!active) return;

        if (response.status === "paid") {
          setStatus("paid");
          setAttemptId(response.attempt_id ?? null);
          setMessage("Payment confirmed.");
          isPolling.current = false;

          if (reportedStatus.current !== "paid") {
            const maskedOrder = `${orderNo.slice(0, 6)}...${orderNo.slice(-4)}`;
            const maskedAttempt = response.attempt_id
              ? `${response.attempt_id.slice(0, 6)}...${response.attempt_id.slice(-4)}`
              : "";
            trackEvent("payment_confirmed", {
              orderNoMasked: maskedOrder,
              attemptIdMasked: maskedAttempt,
            });
            trackEvent("purchase_success", {
              orderNoMasked: maskedOrder,
              attemptIdMasked: maskedAttempt,
            });
            reportedStatus.current = "paid";
          }
          return;
        }

        if (response.status === "failed") {
          setStatus("failed");
          setMessage(response.message ?? "Payment could not be confirmed.");
          isPolling.current = false;

          if (reportedStatus.current !== "failed") {
            trackEvent("payment_failed", {
              orderNoMasked: `${orderNo.slice(0, 6)}...${orderNo.slice(-4)}`,
              reason: response.message ?? "unknown",
            });
            reportedStatus.current = "failed";
          }
          return;
        }

        setStatus("pending");
        setMessage(response.message ?? "Confirming your payment...");
      } catch (cause) {
        if (!active) return;
        setStatus("failed");
        setMessage("Unable to check order status. Please try again.");
        isPolling.current = false;
        captureError(cause, {
          route: "/orders/[orderNo]",
          orderNo,
          stage: "poll_order_status",
        });
      }
    };

    void poll();

    const timer = window.setInterval(() => {
      if (!active || !isPolling.current) return;

      if (Date.now() - startedAt.current >= TIMEOUT_MS) {
        setStatus("failed");
        setMessage("Payment confirmation timed out. Please refresh or contact support.");
        isPolling.current = false;
        window.clearInterval(timer);
        return;
      }

      void poll();
    }, POLL_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [orderNo]);

  const icon = useMemo(() => {
    if (status === "paid") return <CheckCircle2 className="h-6 w-6 text-emerald-600" />;
    if (status === "failed") return <XCircle className="h-6 w-6 text-rose-600" />;
    return <Loader2 className="h-6 w-6 animate-spin text-slate-600" />;
  }, [status]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle>Order #{orderNo}</CardTitle>
          </div>
          <p className="m-0 text-sm text-slate-600">{message}</p>
        </CardHeader>

        <CardContent className="space-y-3">
          {status === "pending" ? (
            <Alert className="border-slate-200 bg-slate-50 text-slate-700">
              Confirming your payment. This may take a few seconds.
            </Alert>
          ) : null}

          {status === "paid" ? (
            <div className="space-y-3">
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                Payment confirmed. Your full report is ready.
              </Alert>
              {attemptId ? (
                <Link href={`/result/${attemptId}`} className="inline-flex w-full">
                  <Button className="w-full" type="button">
                    View Full Report
                  </Button>
                </Link>
              ) : (
                <Alert>Payment is confirmed but report id is missing. Contact support@example.com.</Alert>
              )}
            </div>
          ) : null}

          {status === "failed" ? (
            <div className="space-y-3">
              <Alert>{message}</Alert>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => window.location.reload()} variant="outline">
                  Try again
                </Button>
                <Link href="/support">
                  <Button type="button" variant="secondary">
                    Contact support
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

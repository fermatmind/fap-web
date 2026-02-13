"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lookupOrder } from "@/lib/api/v0_3";
import { captureError } from "@/lib/observability/sentry";

const COOLDOWN_MS = 4000;

export function OrderLookupForm() {
  const router = useRouter();
  const [orderNo, setOrderNo] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmitAt, setLastSubmitAt] = useState(0);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const now = Date.now();
    if (now - lastSubmitAt < COOLDOWN_MS) {
      setError("Please wait a moment before trying again.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setLastSubmitAt(now);

    try {
      const response = await lookupOrder({ orderNo: orderNo.trim(), email: email.trim() });
      const resolvedOrderNo = response.order_no || orderNo.trim();

      if (!resolvedOrderNo) {
        throw new Error("Order lookup failed.");
      }

      router.push(`/orders/${resolvedOrderNo}`);
    } catch (cause) {
      setError("We could not verify that request. Please check details or contact support.");
      captureError(cause, {
        route: "/orders/lookup",
        orderNo,
        stage: "lookup_order",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order lookup</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block space-y-1 text-sm text-slate-700">
            <span>Order number</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={orderNo}
              onChange={(event) => setOrderNo(event.target.value)}
              required
            />
          </label>

          <label className="block space-y-1 text-sm text-slate-700">
            <span>Purchase email</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={email}
              type="email"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          {error ? <Alert>{error}</Alert> : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Checking..." : "Find order"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

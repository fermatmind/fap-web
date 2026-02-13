import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { OrderLookupForm } from "@/components/support/OrderLookupForm";

export const metadata: Metadata = {
  title: "Order Lookup",
  description: "Find your order and continue to payment status.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function OrderLookupPage() {
  return (
    <Container as="main" className="max-w-2xl py-10">
      <div className="space-y-2 pb-4">
        <h1 className="m-0 text-2xl font-bold text-slate-900">Find your order</h1>
        <p className="m-0 text-sm text-slate-600">
          Enter your order number and purchase email to continue.
        </p>
      </div>
      <OrderLookupForm />
    </Container>
  );
}

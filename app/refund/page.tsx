import type { Metadata } from "next";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { getDictionarySync } from "@/lib/i18n/getDictionary";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund eligibility, processing, and anti-fraud terms.",
  alternates: {
    canonical: "/refund",
  },
};

export default async function RefundPage() {
  const localeHeaders = await headers();
  const dict = getDictionarySync(localeHeaders.get("x-locale"));

  return (
    <Container as="main" className="max-w-3xl py-10">
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <h1>{dict.legal.refund_title}</h1>
        <p>Last updated: February 13, 2026</p>

        <h2>Eligibility Window</h2>
        <p>
          Refund requests are generally accepted within 14 days from payment,
          subject to delivery and abuse review.
        </p>

        <h2>Required Information</h2>
        <ul>
          <li>Order number</li>
          <li>Purchase email or account identifier</li>
          <li>Brief reason for the request</li>
        </ul>

        <h2>Processing Time</h2>
        <p>
          Approved refunds are returned to the original payment method within
          5 to 10 business days.
        </p>

        <h2>Exceptions</h2>
        <p>
          We may reject requests involving chargeback abuse, repeated fraud
          patterns, policy manipulation, or violations of service terms.
        </p>

        <h2>Contact</h2>
        <p>
          Send refund requests to
          {" "}
          <a href="mailto:support@example.com">support@example.com</a> with your
          order information.
        </p>
      </article>
    </Container>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { getDictionarySync } from "@/lib/i18n/getDictionary";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How FermatMind collects, uses, stores, and deletes data.",
  alternates: {
    canonical: "/privacy",
  },
};

export default async function PrivacyPage() {
  const localeHeaders = await headers();
  const dict = getDictionarySync(localeHeaders.get("x-locale"));

  return (
    <Container as="main" className="max-w-3xl py-10">
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <h1>{dict.legal.privacy_title}</h1>
        <p>Last updated: February 13, 2026</p>
        <p>
          FermatMind provides assessment experiences for self-discovery. We use
          data only where needed to deliver the service and improve reliability.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>Anonymous identifiers, browser metadata, and basic device signals.</li>
          <li>Cookies and local storage values required for session continuity.</li>
          <li>Analytics events used to measure product quality and conversion.</li>
        </ul>

        <h2>Cookie and Consent Controls</h2>
        <p>
          On first visit we ask for analytics consent. You can accept or decline.
          Declining keeps non-essential analytics disabled.
        </p>

        <h2>How We Use Data</h2>
        <ul>
          <li>Generate reports and resume user progress during a test session.</li>
          <li>Process payments, validate orders, and support refund handling.</li>
          <li>Respond to support requests and service reliability incidents.</li>
        </ul>

        <h2>How We Share Data</h2>
        <ul>
          <li>Payment gateways for checkout and payment confirmation.</li>
          <li>Email and messaging providers for service notices and support replies.</li>
          <li>Infrastructure partners such as hosting, CDN, and monitoring vendors.</li>
        </ul>

        <h2>Retention and Deletion</h2>
        <p>
          We keep data only for operational, legal, and fraud-prevention needs.
          You can request export or deletion of eligible records.
        </p>

        <h2>Medical Disclaimer</h2>
        <p>{dict.legal.medical_disclaimer}</p>

        <h2>Contact</h2>
        <p>
          Contact us at <a href="mailto:support@example.com">support@example.com</a> or
          visit <a href="/support">/support</a>.
        </p>
      </article>
    </Container>
  );
}

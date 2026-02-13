import type { Metadata } from "next";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { getDictionarySync } from "@/lib/i18n/getDictionary";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms that govern your use of FermatMind services.",
  alternates: {
    canonical: "/terms",
  },
};

export default async function TermsPage() {
  const localeHeaders = await headers();
  const dict = getDictionarySync(localeHeaders.get("x-locale"));

  return (
    <Container as="main" className="max-w-3xl py-10">
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <h1>{dict.legal.terms_title}</h1>
        <p>Last updated: February 13, 2026</p>

        <h2>Acceptable Use</h2>
        <p>
          You must not abuse the service, run unauthorized scraping, reverse
          engineer protected systems, or perform security attacks.
        </p>

        <h2>Accounts and Payments</h2>
        <p>
          If checkout is available, you are responsible for accurate order data
          and lawful payment usage. Fraudulent activity may result in order hold,
          refund rejection, or account restrictions.
        </p>

        <h2>Service Changes</h2>
        <p>
          We may update product features, policies, and report formats to
          improve quality, security, or compliance.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          FermatMind is provided on an as-is basis to the extent permitted by
          law. Reports are for educational self-reflection only.
        </p>

        <h2>Medical Disclaimer</h2>
        <p>{dict.legal.medical_disclaimer}</p>

        <h2>Governing Law</h2>
        <p>
          Disputes are governed by the laws applicable in your jurisdiction,
          unless otherwise required by mandatory local law.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to
          {" "}
          <a href="mailto:support@example.com">support@example.com</a>.
        </p>
      </article>
    </Container>
  );
}

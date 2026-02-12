import { EmailCaptureForm } from "@/components/business/email-capture-form";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ marginTop: 0 }}>Result</h1>
      <section
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 20,
          background: "#ffffff",
        }}
      >
        <p style={{ margin: 0, color: "#475569" }}>
          Mock summary for attempt id: <code>{id}</code>
        </p>
      </section>

      <EmailCaptureForm attemptId={id} />
    </main>
  );
}

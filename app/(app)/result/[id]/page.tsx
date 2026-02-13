import { EmailCaptureForm } from "@/components/business/email-capture-form";
import ResultClient from "./ResultClient";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-4 mt-0 text-3xl font-bold text-slate-900">Result</h1>

      <ResultClient attemptId={id} />

      <EmailCaptureForm attemptId={id} />
    </main>
  );
}

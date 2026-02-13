import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import ResultClient from "./ResultClient";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container as="main" className="w-full max-w-4xl py-10">
      <h1 className="mb-4 mt-0 text-3xl font-bold text-slate-900">Result</h1>
      <ResultClient attemptId={id} />
    </Container>
  );
}

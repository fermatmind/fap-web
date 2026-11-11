import HistoryLanguageLinks from "../../HistoryLanguageLinks";
import { Suspense } from "react";
import Big5CompareClient from "./Big5CompareClient";

export default function Big5CompareContent({ traditional = false }: { traditional?: boolean }) {
  const Container = traditional ? "section" : "main";
  return (
    <Container className="mx-auto w-full max-w-5xl px-4 py-8">
      <Suspense fallback={<p className="text-sm text-slate-600">{traditional ? "正在載入比較資料…" : "Loading compare data..."}</p>}>
        <HistoryLanguageLinks comparisonOnly />
        <Big5CompareClient />
      </Suspense>
    </Container>
  );
}

export default function EqHistoryContent({ traditional = false }: { traditional?: boolean }) {
  const Container = traditional ? "section" : "main";
  return (
    <Container data-testid="eq-history-page" className="mx-auto w-full max-w-5xl px-4 py-8">
      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          {traditional ? "EQ 歷史紀錄" : "EQ History"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {traditional ? "你的 EQ 自陳測評結果屬於私人資料，不會被搜尋引擎索引。你可以從已儲存的報告重新開啟先前的結果。" : "Your EQ self-report results are private and not search-indexed. Re-enter a previous result from your saved reports."}
        </p>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
          {traditional ? "私人資料 · 不建立索引 · 不儲存" : "Private · No Index · No Store"}
        </p>
      </section>
    </Container>
  );
}

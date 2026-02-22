import type { Big5ReportBlock } from "@/lib/api/v0_3";

function resolveBlockText(block: Big5ReportBlock): { title: string; content: string } {
  const title = typeof block.title === "string" ? block.title.trim() : "";
  const contentCandidate =
    typeof block.content === "string" && block.content.trim().length > 0
      ? block.content
      : typeof block.body === "string"
        ? block.body
        : "";

  return {
    title,
    content: contentCandidate.trim(),
  };
}

export function MarkdownBlockRenderer({
  block,
}: {
  block: Big5ReportBlock;
}) {
  const { title, content } = resolveBlockText(block);

  if (!title && !content) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      {title ? <p className="m-0 mb-2 font-semibold text-slate-900">{title}</p> : null}
      {content ? <p className="m-0 whitespace-pre-wrap">{content}</p> : null}
    </div>
  );
}

import { Button } from "@/components/ui/button";

export function ModuleTransitionCard({
  locale,
  moduleCode,
  title,
  guidance,
  onContinue,
}: {
  locale: "en" | "zh";
  moduleCode: string;
  title?: string;
  guidance?: string;
  onContinue: () => void;
}) {
  const isZh = locale === "zh";

  return (
    <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50 p-5">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">{moduleCode}</p>
      <h3 className="m-0 text-lg font-semibold text-sky-900">{title || (isZh ? "下一模块" : "Next module")}</h3>
      {guidance ? <p className="m-0 text-sm text-sky-800">{guidance}</p> : null}
      <Button type="button" onClick={onContinue}>
        {isZh ? "继续作答" : "Continue"}
      </Button>
    </div>
  );
}

import { Progress } from "@/components/ui/progress";

export function QuizProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const safeTotal = Math.max(total, 1);
  const safeCurrent = Math.min(Math.max(current, 1), safeTotal);
  const percent = Math.round((safeCurrent / safeTotal) * 100);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">
        Step {safeCurrent} / {safeTotal}
      </p>
      <Progress value={percent} />
    </div>
  );
}

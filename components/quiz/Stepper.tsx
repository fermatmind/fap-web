import { QuizProgress } from "@/components/business/QuizProgress";

export function Stepper({ currentIndex, total }: { currentIndex: number; total: number }) {
  return <QuizProgress current={currentIndex + 1} total={total} />;
}

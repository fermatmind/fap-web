import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CTAStickyProps = {
  slug: string;
  title: string;
  questions: number;
  minutes: number;
};

export function CTASticky({ slug, title, questions, minutes }: CTAStickyProps) {
  return (
    <>
      <div className="hidden lg:block lg:sticky lg:top-24">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ready to start?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              {title}
              <br />
              {questions} questions · about {minutes} minutes.
            </p>
            <Link href={`/tests/${slug}/take`} className={buttonVariants({ className: "w-full" })}>
              Start this test
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3">
          <p className="line-clamp-2 text-xs font-medium text-slate-700">
            {title} · {questions}Q · {minutes}m
          </p>
          <Link href={`/tests/${slug}/take`} className={buttonVariants({ size: "sm" })}>
            Start
          </Link>
        </div>
      </div>
    </>
  );
}

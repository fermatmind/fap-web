import type { CareerDisplayFAQItem } from "@/lib/career/displaySurface";

type CareerFAQBlockProps = {
  heading: string;
  items: CareerDisplayFAQItem[];
};

export function CareerFAQBlock({ heading, items }: CareerFAQBlockProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5" data-testid="career-display-faq">
      <h2 className="m-0 text-2xl font-semibold tracking-normal text-slate-950">{heading}</h2>
      <div className="mt-4 divide-y divide-slate-100">
        {items.map((item) => (
          <article key={item.question} className="py-4 first:pt-0 last:pb-0">
            <h3 className="m-0 text-base font-semibold text-slate-950">{item.question}</h3>
            <p className="m-0 mt-2 text-sm leading-7 text-slate-700">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

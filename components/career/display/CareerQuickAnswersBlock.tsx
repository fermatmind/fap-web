import { CareerStructuredFieldsTable } from "@/components/career/display/CareerStructuredFieldsTable";
import type {
  CareerPublishedQuickAnswersBlock as QuickAnswersBlock,
  CareerPublishedUnavailableComponent,
} from "@/lib/career/publishedComponentContract";

type Props = {
  value: QuickAnswersBlock | CareerPublishedUnavailableComponent;
  locale: "en" | "zh";
};

export function CareerQuickAnswersBlock({ value, locale }: Props) {
  if (value.availability === "unavailable") return null;

  return (
    <section className="min-w-0 rounded-2xl border border-[#E5E9F2] bg-white p-5 shadow-[0_2px_12px_rgba(26,34,51,.05)] md:p-8" data-career-api-component="career_quick_answers_block" data-career-availability={value.availability} data-career-schema-version={value.schema_version}>
      <h2 className="m-0 text-[23px] font-bold leading-tight text-[#1A2233]" data-career-api-field="career_quick_answers_block.heading">{value.heading}</h2>
      <div className="mt-5 space-y-6">
        {value.items.map((item, index) => {
          const path = `career_quick_answers_block.items[${index}]`;
          return (
            <article key={item.key} data-career-quick-answer-key={item.key}>
              <h3 className="m-0 text-lg font-bold text-[#243049]" data-career-api-field={`${path}.question`}>{item.question}</h3>
              <p className="mb-0 mt-2 text-sm leading-7 text-[#2a3346]" data-career-api-field={`${path}.answer`}>{item.answer}</p>
              <CareerStructuredFieldsTable rows={item.table.rows} path={`${path}.table.rows`} label={item.question} locale={locale} />
            </article>
          );
        })}
      </div>
    </section>
  );
}

import { CareerStructuredFieldsTable } from "@/components/career/display/CareerStructuredFieldsTable";
import type {
  CareerPublishedOnetStructuredFieldsBlock as OnetBlock,
  CareerPublishedUnavailableComponent,
} from "@/lib/career/publishedComponentContract";

type Props = {
  value: OnetBlock | CareerPublishedUnavailableComponent;
  locale: "en" | "zh";
};

export function OnetStructuredFieldsBlock({ value, locale }: Props) {
  if (value.availability === "unavailable") return null;

  return (
    <section className="min-w-0 rounded-2xl border border-[#E5E9F2] bg-white p-5 shadow-[0_2px_12px_rgba(26,34,51,.05)] md:p-8" data-career-api-component="onet_structured_fields_block" data-career-availability={value.availability} data-career-schema-version={value.schema_version}>
      <h2 className="m-0 text-[23px] font-bold leading-tight text-[#1A2233]" data-career-api-field="onet_structured_fields_block.heading">{value.heading}</h2>
      <CareerStructuredFieldsTable rows={value.rows} path="onet_structured_fields_block.rows" label={value.heading} locale={locale} />
    </section>
  );
}

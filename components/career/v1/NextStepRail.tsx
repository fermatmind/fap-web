import Link from "next/link";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import type { CareerAttributionPayloadInput } from "@/lib/career/attribution";
import type { CareerTrackingEventName } from "@/lib/tracking/events";

export type NextStepRailItem = {
  title: string;
  description?: string;
  href: string;
  eventName?: CareerTrackingEventName;
  eventPayload?: CareerAttributionPayloadInput;
};

type NextStepRailProps = {
  title: string;
  description?: string;
  items: NextStepRailItem[];
  testId?: string;
};

export function NextStepRail({ title, description, items, testId }: NextStepRailProps) {
  const visibleItems = items.filter((item) => item.href).slice(0, 3);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
      data-testid={testId ?? "career-v1-next-step-rail"}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
          {description ? <p className="m-0 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {visibleItems.map((item) => {
          const className =
            "rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm transition hover:border-orange-200 hover:bg-orange-50/40";
          const content = (
            <>
              <span className="block font-medium text-slate-950">{item.title}</span>
              {item.description ? <span className="mt-1 block leading-6 text-slate-500">{item.description}</span> : null}
            </>
          );

          if (item.eventName && item.eventPayload) {
            return (
              <TrackedCareerLink
                key={`${item.href}:${item.title}`}
                href={item.href}
                eventName={item.eventName}
                eventPayload={item.eventPayload}
                className={className}
              >
                {content}
              </TrackedCareerLink>
            );
          }

          return (
            <Link key={`${item.href}:${item.title}`} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

import type { PersonalityCrossTypeSectionViewModel } from "@/lib/cms/personality";

export function CrossTypeDetailedSections({
  sections,
}: {
  sections: PersonalityCrossTypeSectionViewModel[];
}) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6" data-testid="personality-cross-type-detailed-sections">
      {sections.map((section) => (
        <section
          key={section.id}
          id={`comparison-${section.id.replaceAll("_", "-")}`}
          className="rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
          data-testid={`personality-cross-type-section-${section.id}`}
          data-authority-source="comparison_public_projection_v1"
        >
          <h2 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{section.title}</h2>

          {section.body.length > 0 ? (
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph, index) => (
                <p
                  key={`${section.id}-body-${index}`}
                  className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          {section.groups.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {section.groups.map((group, groupIndex) => (
                <article
                  key={`${section.id}-group-${groupIndex}`}
                  className="rounded-xl border border-[rgba(16,24,40,0.08)] bg-[var(--fm-surface-muted)] p-4"
                >
                  <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{group.title}</h3>
                  <ul className="mt-3 space-y-2 pl-5 text-sm leading-7 text-[var(--fm-text-muted)]">
                    {group.items.map((item, itemIndex) => (
                      <li key={`${section.id}-group-${groupIndex}-item-${itemIndex}`}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : null}

          {section.items.length > 0 ? (
            <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-[var(--fm-text-muted)]">
              {section.items.map((item, index) => (
                <li key={`${section.id}-item-${index}`}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}

import type { ReactNode } from "react";

type CiteableSectionProps = {
  id: "what-it-is" | "when-to-use" | "how-it-works" | "limitations" | "faq" | "references";
  title: ReactNode;
  children: ReactNode;
  className?: string;
};

export function CiteableSection({ id, title, children, className }: CiteableSectionProps) {
  return (
    <section id={id} className={className}>
      <h2 className="m-0 text-lg font-semibold text-[var(--fm-text)]">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

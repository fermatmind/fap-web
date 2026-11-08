import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  ariaLabel?: string;
};

export function Breadcrumb({ items, ariaLabel = "Breadcrumb" }: BreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label={ariaLabel} className="text-sm text-[var(--fm-text-muted)]">
      <ol className="m-0 flex flex-wrap items-center gap-2 p-0">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-[var(--fm-accent)]">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--fm-text)]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

"use client";

import Link from "next/link";

export default function SiteHeaderDropdownPanel({
  id,
  triggerId,
  items,
  onSelect,
}: {
  id: string;
  triggerId: string;
  items: Array<{ href: string; label: string }>;
  onSelect: () => void;
}) {
  return (
    <div id={id} role="menu" aria-labelledby={triggerId} className="fm-header-dropdown-panel">
      {items.map((item, index) => (
        <Link
          key={`${item.href}-${index}`}
          href={item.href}
          prefetch={false}
          role="menuitem"
          className="fm-header-dropdown-link"
          onClick={onSelect}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

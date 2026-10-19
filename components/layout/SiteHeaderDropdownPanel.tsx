"use client";

import { PublicNavigationLink } from "@/components/navigation/PublicNavigationPendingIndicator";

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
    <div
      id={id}
      role="menu"
      aria-labelledby={triggerId}
      className="fm-header-dropdown-panel"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onSelect();
          document.getElementById(triggerId)?.focus();
          return;
        }
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const links = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
        const index = links.indexOf(document.activeElement as HTMLElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
        links[next]?.focus();
      }}
    >
      {items.map((item, index) => (
        <PublicNavigationLink
          key={`${item.href}-${index}`}
          href={item.href}
          prefetch={false}
          role="menuitem"
          className="fm-header-dropdown-link"
          onClick={onSelect}
        >
          {item.label}
        </PublicNavigationLink>
      ))}
    </div>
  );
}

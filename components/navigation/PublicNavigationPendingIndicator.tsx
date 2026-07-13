"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useState,
} from "react";
import type { Locale } from "@/lib/i18n/locales";

const PUBLIC_NAVIGATION_PENDING_EVENT = "fermatmind:public-navigation-pending";
const PENDING_SAFETY_TIMEOUT_MS = 15_000;

type PublicNavigationLinkProps = ComponentProps<typeof Link>;

function shouldStartPending(event: ReactMouseEvent<HTMLAnchorElement>): boolean {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }

  const anchor = event.currentTarget;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (typeof window === "undefined") return false;

  const destination = new URL(anchor.href, window.location.href);
  if (destination.origin !== window.location.origin) return false;

  return destination.href !== window.location.href;
}

export function PublicNavigationLink({
  onClick,
  ...props
}: PublicNavigationLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!shouldStartPending(event)) return;

        window.dispatchEvent(new Event(PUBLIC_NAVIGATION_PENDING_EVENT));
      }}
    />
  );
}

export function PublicNavigationPendingIndicator({
  locale,
}: {
  locale: Locale;
}) {
  const pathname = usePathname() ?? "/";
  const currentRouteKey = pathname;
  const [pendingOriginRouteKey, setPendingOriginRouteKey] = useState<string | null>(null);

  useEffect(() => {
    const startPending = () => {
      setPendingOriginRouteKey(currentRouteKey);
    };

    window.addEventListener(PUBLIC_NAVIGATION_PENDING_EVENT, startPending);
    return () => window.removeEventListener(PUBLIC_NAVIGATION_PENDING_EVENT, startPending);
  }, [currentRouteKey]);

  const pending = pendingOriginRouteKey === currentRouteKey;

  useEffect(() => {
    if (!pending) return;

    const timeoutId = window.setTimeout(() => {
      setPendingOriginRouteKey(null);
    }, PENDING_SAFETY_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [pending]);

  if (!pending) return null;

  const label = locale === "zh" ? "页面加载中" : "Loading page";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      data-public-navigation-pending="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-slate-200/80"
    >
      <span
        aria-hidden="true"
        className="block h-full w-1/2 animate-pulse bg-[var(--fm-lime-strong,#84cc16)]"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

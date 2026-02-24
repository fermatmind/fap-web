"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

type CrisisResourceItem = Record<string, unknown>;

type NormalizedResource = {
  id: string;
  label: string;
  href?: string;
  phone?: string;
  external?: boolean;
};

function firstString(node: CrisisResourceItem, keys: string[]): string {
  for (const key of keys) {
    const value = node[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function normalizeResource(node: unknown, index: number): NormalizedResource | null {
  if (!node || typeof node !== "object" || Array.isArray(node)) return null;

  const item = node as CrisisResourceItem;
  const label =
    firstString(item, ["title", "label", "name", "text", "display", "value"]) || `Resource ${index + 1}`;
  const url = firstString(item, ["url", "href", "link"]);
  const phoneRaw = firstString(item, ["phone", "tel", "hotline"]);
  const phone = phoneRaw ? normalizePhone(phoneRaw) : "";

  if (url) {
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return {
      id: `url-${index}`,
      label,
      href,
      external: true,
    };
  }

  if (phone) {
    return {
      id: `phone-${index}`,
      label: `${label}: ${phoneRaw}`,
      href: `tel:${phone}`,
      phone: phoneRaw,
      external: false,
    };
  }

  return {
    id: `text-${index}`,
    label,
  };
}

async function copyPhone(phone: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(phone);
      return true;
    }
  } catch {
    // no-op
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = phone;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

function isLikelyMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function ResourceList({
  locale,
  resources,
  mobileDevice,
  onCopy,
  copiedResourceId,
  scaleCode,
}: {
  locale: "en" | "zh";
  resources: NormalizedResource[];
  mobileDevice: boolean;
  onCopy: (resource: NormalizedResource) => void;
  copiedResourceId: string | null;
  scaleCode?: string;
}) {
  const isZh = locale === "zh";

  return (
    <div className="grid gap-2">
      {resources.map((resource) => (
        <div key={resource.id} className="rounded-xl border border-amber-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            {resource.href ? (
              <a
                href={resource.href}
                target={resource.external ? "_blank" : undefined}
                rel={resource.external ? "noreferrer" : undefined}
                className="font-semibold text-[var(--fm-trust-blue)] underline"
                onClick={() => {
                  trackEvent("clinical_crisis_resource_action", {
                    action: resource.phone ? "call" : "open_link",
                    locale,
                    scale_code: scaleCode ?? "",
                  });
                }}
              >
                {resource.label}
              </a>
            ) : (
              <span className="font-medium text-slate-900">{resource.label}</span>
            )}
            {!mobileDevice && resource.phone ? (
              <span className="inline-flex items-center gap-2">
                <Button type="button" variant="outline" className="h-7 px-2 text-xs" onClick={() => onCopy(resource)}>
                  {isZh ? "复制热线" : "Copy hotline"}
                </Button>
                {copiedResourceId === resource.id ? (
                  <span className="text-xs font-medium text-amber-700">{isZh ? "已复制" : "Copied"}</span>
                ) : null}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CrisisOverlay({
  locale,
  resources,
  reasons,
  scaleCode,
}: {
  locale: "en" | "zh";
  resources?: Array<Record<string, unknown>>;
  reasons?: string[];
  scaleCode?: string;
}) {
  const isZh = locale === "zh";
  const mobileDevice = isLikelyMobile();
  const [dismissedFullscreen, setDismissedFullscreen] = useState(false);
  const [copiedResourceId, setCopiedResourceId] = useState<string | null>(null);
  const normalizedResources = Array.isArray(resources)
    ? resources
        .map((item, index) => normalizeResource(item, index))
        .filter((item): item is NormalizedResource => item !== null)
    : [];
  const normalizedReasons = Array.isArray(reasons)
    ? reasons.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  const handleCopy = async (resource: NormalizedResource) => {
    if (!resource.phone) return;
    const copied = await copyPhone(resource.phone);
    if (copied) {
      setCopiedResourceId(resource.id);
      trackEvent("clinical_crisis_resource_action", {
        action: "copy",
        locale,
        scale_code: scaleCode ?? "",
      });
      window.setTimeout(() => {
        setCopiedResourceId((prev) => (prev === resource.id ? null : prev));
      }, 1800);
    }
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 border-b border-amber-200 bg-amber-100/95 px-4 py-2 text-center text-sm font-semibold text-amber-950 backdrop-blur">
        {isZh
          ? "关怀提示：请优先联系支持资源，我们已为你切换到安全模式。"
          : "Care notice: please prioritize support resources. Safety mode is now active."}
      </div>

      {!dismissedFullscreen ? (
        <div className="fixed inset-0 z-30 bg-slate-900/55 px-4 pb-6 pt-16 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full w-full max-w-3xl items-center">
            <div className="w-full space-y-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-5 text-sm text-slate-900 shadow-2xl">
              <h3 className="m-0 text-xl font-bold text-[var(--fm-trust-blue-strong)]">
                {isZh ? "请先照顾好自己" : "Please take care of yourself first"}
              </h3>
              <p className="m-0">
                {isZh
                  ? "我们注意到你近期的状态可能非常疲惫或承受着较大压力。请先联系家人、朋友或专业支持热线。"
                  : "We noticed you may be carrying intense fatigue or pressure recently. Please contact trusted people or professional support lines first."}
              </p>

              {normalizedReasons.length > 0 ? (
                <ul className="m-0 list-disc space-y-1 pl-5 text-slate-700">
                  {normalizedReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}

              {normalizedResources.length > 0 ? (
                <ResourceList
                  locale={locale}
                  resources={normalizedResources}
                  mobileDevice={mobileDevice}
                  onCopy={handleCopy}
                  copiedResourceId={copiedResourceId}
                  scaleCode={scaleCode}
                />
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" onClick={() => setDismissedFullscreen(true)}>
                  {isZh ? "我已知晓，继续查看免费内容" : "I understand, continue to free content"}
                </Button>
                <p className="m-0 text-xs text-amber-900">
                  {isZh ? "在关怀模式下，购买与升级入口已暂停。" : "Purchase and upsell are paused while care mode is active."}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/90 via-white to-sky-50 p-4 pt-12 text-sm text-slate-900">
        <h3 className="m-0 text-base font-semibold text-[var(--fm-trust-blue-strong)]">
          {isZh ? "重要：请优先连接支持资源" : "Important: please prioritize support resources"}
        </h3>
        <p className="m-0">
          {isZh
            ? "当前结果触发了关怀提示。请优先联系你信任的人或专业支持渠道。"
            : "Your report includes a care alert. Please prioritize trusted contacts or professional support channels."}
        </p>

        {normalizedReasons.length > 0 ? (
          <ul className="m-0 list-disc space-y-1 pl-5 text-slate-700">
            {normalizedReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}

        {normalizedResources.length > 0 ? (
          <ResourceList
            locale={locale}
            resources={normalizedResources}
            mobileDevice={mobileDevice}
            onCopy={handleCopy}
            copiedResourceId={copiedResourceId}
            scaleCode={scaleCode}
          />
        ) : null}
      </div>
    </>
  );
}

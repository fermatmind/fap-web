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
    <ul className="m-0 list-disc space-y-2 pl-5">
      {resources.map((resource) => (
        <li key={resource.id}>
          {resource.href ? (
            <a
              href={resource.href}
              target={resource.external ? "_blank" : undefined}
              rel={resource.external ? "noreferrer" : undefined}
              className="font-semibold text-rose-900 underline"
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
            <span>{resource.label}</span>
          )}
          {!mobileDevice && resource.phone ? (
            <span className="ml-2 inline-flex items-center gap-2">
              <Button type="button" variant="outline" className="h-7 px-2 text-xs" onClick={() => onCopy(resource)}>
                {isZh ? "复制热线" : "Copy hotline"}
              </Button>
              {copiedResourceId === resource.id ? (
                <span className="text-xs font-medium text-rose-700">{isZh ? "已复制" : "Copied"}</span>
              ) : null}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
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
      <div className="fixed inset-x-0 top-0 z-40 border-b border-rose-300 bg-rose-700 px-4 py-2 text-center text-sm font-semibold text-white">
        {isZh ? "危机提示：优先联系支持资源，当前页面已进入安全模式" : "Crisis alert: prioritize support resources. Safety mode is active."}
      </div>

      {!dismissedFullscreen ? (
        <div className="fixed inset-0 z-30 bg-rose-950/80 px-4 pb-6 pt-16 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full w-full max-w-3xl items-center">
            <div className="w-full space-y-4 rounded-2xl border border-rose-300 bg-rose-50 p-5 text-sm text-rose-950 shadow-2xl">
              <h3 className="m-0 text-xl font-bold">
                {isZh ? "请先处理安全风险" : "Please prioritize immediate safety"}
              </h3>
              <p className="m-0">
                {isZh
                  ? "检测到危机信号。请优先联系家人、朋友或专业热线支持。"
                  : "A crisis signal is detected. Please contact trusted people or hotline resources first."}
              </p>

              {normalizedReasons.length > 0 ? (
                <ul className="m-0 list-disc space-y-1 pl-5">
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
                  {isZh ? "我已知晓，继续查看免费报告" : "I understand, continue to free report"}
                </Button>
                <p className="m-0 text-xs text-rose-800">
                  {isZh ? "危机状态下已禁用购买与升级入口。" : "Purchase and upsell are disabled during crisis state."}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 pt-12 text-sm text-rose-900">
        <h3 className="m-0 text-base font-semibold">
          {isZh ? "重要：请优先关注安全与支持资源" : "Important: prioritize immediate safety and support"}
        </h3>
        <p className="m-0">
          {isZh
            ? "当前结果触发了危机提示。请优先联系可信任的人或专业支持渠道。"
            : "This report includes a crisis alert. Please prioritize trusted contacts or professional support channels."}
        </p>

        {normalizedReasons.length > 0 ? (
          <ul className="m-0 list-disc space-y-1 pl-5">
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

import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, it} from "vitest";
import TraditionalLayout from "@/app/(traditional)/zh-TW/layout";
import {getDict, getDictSync, resolveLocale} from "@/lib/i18n/getDict";
import en from "@/lib/i18n/locales/en";
import zh from "@/lib/i18n/locales/zh";
import traditional from "@/lib/i18n/locales/zh-TW";
import {apiLocaleForDisplay, toApiLocale} from "@/lib/i18n/locales";

function leaves(value: unknown, prefix = "", result: Record<string, string> = {}) {
  if (typeof value === "string") result[prefix] = value;
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) leaves(child, `${prefix}/${key}`, result);
  }
  return result;
}

describe("Taiwan display dictionary", () => {
  it("selects the exact display variant without folding reader copy into simplified Chinese", async () => {
    for (const locale of ["zh-TW", "zh-tw", " ZH-TW "]) {
      expect(getDictSync(locale)).toBe(traditional);
      expect(await getDict(locale)).toBe(traditional);
    }
    expect(getDictSync("zh")).toBe(zh);
    expect(getDictSync("zh-CN")).toBe(zh);
    expect(getDictSync("en")).toBe(en);
    expect(getDictSync(null)).toBe(zh);
    expect(getDictSync("unknown")).toBe(en);
  });

  it("covers every source leaf and preserves variables, numbers, code, URLs and email targets", () => {
    const source = leaves(zh), target = leaves(traditional);
    expect(Object.keys(target).sort()).toEqual(Object.keys(source).sort());
    expect(Object.keys(target)).toHaveLength(324);
    const protectedTokens = /https?:\/\/[^\s<>）)]+|[\w.+-]+@[\w.-]+|`[^`]*`|\{\{[^}]*\}\}|\$?\{[^}]*\}|%\d*\$?[sdif]|\d+(?:[.,:/-]\d+)*/g;
    for (const [key, value] of Object.entries(source)) {
      expect(target[key].match(protectedTokens) ?? [], key).toEqual(value.match(protectedTokens) ?? []);
      expect(Boolean(target[key].trim()), key).toBe(Boolean(value.trim()));
    }
    expect(target["/email/preferences/description"]).toContain("郵件類型");
    expect(target["/header/profile"]).toBe("我的帳戶");
    expect(target["/orders/qrCodeGenerating"]).toContain("QR Code");
  });

  it("keeps form/report locale behavior separate and does not make Taiwan forms available", () => {
    expect(resolveLocale("zh-TW")).toBe("zh");
    expect(toApiLocale("zh-TW")).toBe("zh-CN");
    expect(apiLocaleForDisplay("zh-TW")).toBeNull();
  });

  it("uses the dictionary in the existing server-rendered Taiwan shell without opening unpublished pages", () => {
    const html = renderToStaticMarkup(<TraditionalLayout><p>測試內容</p></TraditionalLayout>);
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(document.documentElement.lang).toBe("zh-TW");
    expect(document.querySelector('a[href="/zh-TW"]')?.textContent).toBe(traditional.header.brand);
    for (const slug of ["privacy", "terms", "science", "method-boundaries"]) {
      expect(document.querySelector(`a[href="/zh-TW/${slug}"]`)).toBeNull();
    }
    expect(document.body.textContent).toContain("測試內容");
  });
});

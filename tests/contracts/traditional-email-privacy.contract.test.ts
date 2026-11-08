import {describe,expect,it} from "vitest";
import {emailTokenSwitchHref,emailDisplayPath} from "@/lib/i18n/emailDisplayRoutes";
import {traditionalPath,TRADITIONAL_PUBLIC_PATHS,traditionalEquivalent} from "@/lib/i18n/traditionalRoutes";
import {getBrowserAnalyticsSuppressionDecision} from "@/lib/tracking/browserAnalyticsSuppression";
import {shouldNoindex,shouldIncludeInSitemap} from "@/lib/seo/indexingPolicy";
import {resolveLocaleSwitchHref} from "@/components/i18n/useLocaleSwitchHref";
import {NextRequest} from "next/server";
import {proxy} from "@/proxy";

describe("Taiwan private email boundary",()=>{
  it.each(["preferences","unsubscribe"])("applies private response headers and analytics suppression to Taiwan %s",async page=>{
    const response = await proxy(new NextRequest(`https://example.com/zh-TW/email/${page}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-middleware-request-x-fm-private-analytics-suppressed")).toBe("true");
  });
  it.each(["preferences","unsubscribe"])("keeps %s private across all display locales",page=>{
    for (const locale of ["en","zh","zh-TW"] as const) {
      const path=emailDisplayPath(`/email/${page}` as "/email/preferences"|"/email/unsubscribe",locale);
      expect(getBrowserAnalyticsSuppressionDecision({pathname:path,search:""}).suppressed).toBe(true);
      expect(shouldNoindex(path,null)).toBe(true);
      expect(shouldIncludeInSitemap(path)).toBe(false);
      expect(traditionalPath(path)).toBe(`/zh-TW/email/${page}`);
      expect(traditionalEquivalent(path)).toBeNull();
      expect(TRADITIONAL_PUBLIC_PATHS).not.toContain(`/email/${page}`);
    }
  });
  it("carries only the opaque token between private email routes, never into public fallbacks",()=>{
    const search="?token=a%2Fb%2Bc%3D&email=private%40example.test&utm_source=mail";
    expect(emailTokenSwitchHref("/en/email/preferences","/zh-TW/email/preferences",search)).toBe("/zh-TW/email/preferences?token=a%2Fb%2Bc%3D");
    expect(resolveLocaleSwitchHref("/en/email/preferences","zh",undefined,search)).toBe("/zh/email/preferences?token=a%2Fb%2Bc%3D");
    expect(emailTokenSwitchHref("/en/email/preferences","/zh-TW/tests",search)).toBe("/zh-TW/tests");
    expect(emailTokenSwitchHref("/en/articles/example","/zh-TW/tests",search)).toBe("/zh-TW/tests");
  });
});

type LlmsFullResponseCache = {
  siteUrl: string;
  text: string;
  cachedAtMs: number;
};

let llmsFullResponseCache: LlmsFullResponseCache | null = null;
let llmsFullBuildPromise: Promise<string | null> | null = null;

export function clearLlmsFullResponseCache(): void {
  llmsFullResponseCache = null;
  llmsFullBuildPromise = null;
}

export function getCachedLlmsFullText(siteUrl: string, maxAgeMs: number): string | null {
  if (!llmsFullResponseCache || llmsFullResponseCache.siteUrl !== siteUrl) {
    return null;
  }

  return Date.now() - llmsFullResponseCache.cachedAtMs <= maxAgeMs ? llmsFullResponseCache.text : null;
}

export function getOrStartLlmsFullBuild(
  siteUrl: string,
  buildText: (siteUrl: string) => Promise<string | null>
): Promise<string | null> {
  if (!llmsFullBuildPromise) {
    llmsFullBuildPromise = buildText(siteUrl)
      .then((text) => {
        if (text !== null) {
          llmsFullResponseCache = {
            siteUrl,
            text,
            cachedAtMs: Date.now(),
          };
        }

        return text;
      })
      .catch(() => null)
      .finally(() => {
        llmsFullBuildPromise = null;
      });
  }

  return llmsFullBuildPromise;
}

export function articleDetailCacheTag(locale: string, slug: string): string {
  return `article-detail:${locale}:${slug}`;
}

export function articleSeoCacheTag(locale: string, slug: string): string {
  return `article-seo:${locale}:${slug}`;
}

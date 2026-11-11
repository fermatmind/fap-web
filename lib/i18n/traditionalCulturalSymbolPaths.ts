const profiles = {
  "life-path-number": ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "eleven", "twenty-two", "thirty-three"],
  "nakshatra-spica-reference": ["ashwini", "bharani", "krittika", "rohini", "mrigashira", "ardra", "punarvasu", "pushya", "ashlesha", "magha", "purva-phalguni", "uttara-phalguni", "hasta", "chitra", "swati", "vishakha", "anuradha", "jyeshtha", "mula", "purva-ashadha", "uttara-ashadha", "shravana", "dhanishta", "shatabhisha", "purva-bhadrapada", "uttara-bhadrapada", "revati"],
  "natal-chart": ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"],
  "nine-star-ki": ["one-white-water", "two-black-earth", "three-jade-wood", "four-green-wood", "five-yellow-earth", "six-white-metal", "seven-red-metal", "eight-white-earth", "nine-purple-fire"],
  "weton-story-preferences": ["senin-legi", "senin-pahing", "senin-pon", "senin-wage", "senin-kliwon", "selasa-legi", "selasa-pahing", "selasa-pon", "selasa-wage", "selasa-kliwon", "rabu-legi", "rabu-pahing", "rabu-pon", "rabu-wage", "rabu-kliwon", "kamis-legi", "kamis-pahing", "kamis-pon", "kamis-wage", "kamis-kliwon", "jumat-legi", "jumat-pahing", "jumat-pon", "jumat-wage", "jumat-kliwon", "sabtu-legi", "sabtu-pahing", "sabtu-pon", "sabtu-wage", "sabtu-kliwon", "minggu-legi", "minggu-pahing", "minggu-pon", "minggu-wage", "minggu-kliwon"],
} as const;

export function hasTraditionalCulturalSymbol(slug: string): boolean {
  return Object.hasOwn(profiles, slug);
}

export function traditionalCulturalSymbolRoute(path: string) {
  const match = /^\/tests\/explore\/([a-z0-9-]+)(?:\/(take)|\/results\/([a-z0-9-]+))?$/.exec(path);
  if (!match || !hasTraditionalCulturalSymbol(match[1])) return null;
  const [, slug, take, profile] = match;
  if (take && slug !== "weton-story-preferences") return null;
  const allowed: readonly string[] = profiles[slug as keyof typeof profiles];
  if (profile && !allowed.includes(profile)) return null;
  return { slug, take: Boolean(take), profile };
}

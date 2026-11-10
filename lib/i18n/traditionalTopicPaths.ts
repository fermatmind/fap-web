const topics = new Set(["mbti", "big-five", "iq-eq", "england-post16-options"]);

export function isTraditionalTopicSlug(slug: string): boolean {
  return topics.has(slug);
}

export function isTraditionalTopicPath(path: string): boolean {
  return path === "/topics" || (path.startsWith("/topics/") && isTraditionalTopicSlug(path.slice("/topics/".length)));
}

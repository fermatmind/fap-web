const legacyHelpPath = /^(\/(?:(?:en|zh|zh-TW)\/)?)help\/(about|contact|data-deletion|faq|for-business-and-research|payment-refund|privacy-data|result-recovery|team|unlock-failure|used-and-mentioned)(?=[?#]|$)/u;

export function supportDetailPath(path: string): string {
  return path.replace(legacyHelpPath, "$1support/$2");
}

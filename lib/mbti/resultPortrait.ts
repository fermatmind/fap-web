export function getMbtiResultPortrait(typeCode: string): string | undefined {
  const baseCode = /^([IE][NS][TF][JP])(?:-[AT])?$/i.exec(typeCode.trim())?.[1];
  return baseCode ? `/images/mbti/result-portraits/${baseCode.toLowerCase()}.webp` : undefined;
}

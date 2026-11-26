import { miniVirtuesDefinitions, type MiniVirtuesDualResult } from "./miniVirtues";

/** A local image is a projection of the completed scores, never a new classification. */
export function sevenSinsCardRows(result: MiniVirtuesDualResult) {
  if (result.status !== "complete" || result.model !== "dual" || result.answered !== 28
    || result.miniVirtues.length !== 7 || new Set(result.miniVirtues.map(part => part.id)).size !== 7) return null;
  const rows = miniVirtuesDefinitions.map(definition => {
    const score = result.miniVirtues.find(part => part.id === definition.id);
    return score ? { ...definition, scores: { sin: score.sin, virtue: score.virtue } } : null;
  });
  if (rows.some(row => !row || Object.values(row.scores).some(value => !Number.isFinite(value) || value < 0 || value > 100))) return null;
  const complete = rows.filter(row => row !== null);
  const highestSin = Math.max(...complete.map(row => row.scores.sin));
  const highestVirtue = Math.max(...complete.map(row => row.scores.virtue));
  return complete.map(row => ({ ...row, leadingSin: row.scores.sin === highestSin, leadingVirtue: row.scores.virtue === highestVirtue }));
}

export type SevenSinsCardRow = NonNullable<ReturnType<typeof sevenSinsCardRows>>[number];
export type SevenSinsTrack = "sin" | "virtue";

export function sevenSinsCardPeaks(rows: readonly SevenSinsCardRow[]) {
  const sin = rows.filter(row => row.leadingSin);
  const virtue = rows.filter(row => row.leadingVirtue);
  const difference = virtue[0].scores.virtue - sin[0].scores.sin;
  const bothHigh = sin[0].scores.sin >= 75 && virtue[0].scores.virtue >= 75;
  const samePair = bothHigh && sin.some(shadow => virtue.some(light => shadow.id === light.id));
  const tied = sin.length > 1 || virtue.length > 1;
  const pattern: "same" | "cross" | "tied" | "light" | "shadow" | "even" = samePair ? "same" : tied ? "tied" : bothHigh ? "cross" : difference >= 15 ? "light" : difference <= -15 ? "shadow" : "even";
  return { sin, virtue, tied, bothHigh, pattern };
}

export function sevenSinsRadarPoint(index: number, radius: number, x: number, y: number) {
  const angle = index * 2 * Math.PI / miniVirtuesDefinitions.length - Math.PI / 2;
  return { x: x + radius * Math.cos(angle), y: y + radius * Math.sin(angle) };
}

export const sevenSinsPosterSize = { width: 1080, height: 1440 };

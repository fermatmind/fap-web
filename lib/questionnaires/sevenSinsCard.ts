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

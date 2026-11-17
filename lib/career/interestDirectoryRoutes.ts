export const RIC_INTEREST_PATH = "/career/interests/ric";
export const RIC_INTEREST_ARTICLE = "ric-holland-code-career-exploration";

export const BILINGUAL_INTEREST_DIRECTORY_CODES = [
  "icr", "ces", "scr", "cei", "cer", "cir", "ecr", "sic", "cre",
  "iec", "rac", "rce", "rcs", "sir", "cri", "eci", "sce", "sec",
] as const;

const bilingualPaths = new Set<string>(BILINGUAL_INTEREST_DIRECTORY_CODES.map((code) => `/career/interests/${code}`));

export function isBilingualInterestDirectoryPath(path: string): boolean {
  return bilingualPaths.has(path);
}

const upgradedInterestPaths = new Set([RIC_INTEREST_PATH, "/career/interests/rci", "/career/interests/irc", "/career/interests/ecs"]);

export function hasInterestDirectory(path: string): boolean {
  return upgradedInterestPaths.has(path) || isBilingualInterestDirectoryPath(path);
}

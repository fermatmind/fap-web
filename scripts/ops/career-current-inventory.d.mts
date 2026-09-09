export type CareerCurrentInventory = { manifestSha256: string; paths: string[] };
export function parseCareerCurrentInventory(payload: unknown): CareerCurrentInventory;
export function hasExactCareerPaths(actual: readonly string[], expected: readonly string[]): boolean;

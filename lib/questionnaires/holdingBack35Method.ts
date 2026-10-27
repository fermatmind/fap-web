/** FermatMind original35 method. Not the IPRS/IDR-HYBT instrument or scoring. */
export const HOLDING_BACK_DOMAINS = [
  { id: 'emotion-recovery', itemIds: ['emotion-recovery-1', 'emotion-recovery-2', 'emotion-recovery-3', 'emotion-recovery-4', 'emotion-recovery-5'] },
  { id: 'self-doubt', itemIds: ['self-doubt-1', 'self-doubt-2', 'self-doubt-3', 'self-doubt-4', 'self-doubt-5'] },
  { id: 'direction-attention', itemIds: ['direction-attention-1', 'direction-attention-2', 'direction-attention-3', 'direction-attention-4', 'direction-attention-5'] },
  { id: 'outward-actions', itemIds: ['outward-actions-1', 'outward-actions-2', 'outward-actions-3', 'outward-actions-4', 'outward-actions-5'] },
  { id: 'rigid-standards', itemIds: ['rigid-standards-1', 'rigid-standards-2', 'rigid-standards-3', 'rigid-standards-4', 'rigid-standards-5'] },
  { id: 'imagined-scenarios', itemIds: ['imagined-scenarios-1', 'imagined-scenarios-2', 'imagined-scenarios-3', 'imagined-scenarios-4', 'imagined-scenarios-5'] },
  { id: 'interest-engagement', itemIds: ['interest-engagement-1', 'interest-engagement-2', 'interest-engagement-3', 'interest-engagement-4', 'interest-engagement-5'] },
] as const;

export type HoldingBackDomainId = (typeof HOLDING_BACK_DOMAINS)[number]['id'];
export type HoldingBackItemId = (typeof HOLDING_BACK_DOMAINS)[number]['itemIds'][number];
export type HoldingBackAnswer = 1 | 2 | 3 | 4 | 5 | 'na';
export type HoldingBackDomainScore = Readonly<{
  domainId: HoldingBackDomainId;
  numericCount: number;
  requiredNumeric: 5;
  mean: number | null;
}>;
export type HoldingBackReport = Readonly<{
  method: 'fermatmind-original35-four-week-frequency-v1';
  domains: readonly HoldingBackDomainScore[];
}>;

const ITEM_IDS = HOLDING_BACK_DOMAINS.flatMap((domain) => [...domain.itemIds]);
const KNOWN_IDS = new Set<string>(ITEM_IDS);

/** All35 explicit choices are required; NA is a choice, never an imputed number. */
export function scoreHoldingBackOriginal35(input: unknown): HoldingBackReport | null {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null;
  const prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) return null;
  const keys = Reflect.ownKeys(input);
  if (keys.length !== ITEM_IDS.length) return null;
  const answers = new Map<string, HoldingBackAnswer>();
  for (const key of keys) {
    if (typeof key !== 'string' || !KNOWN_IDS.has(key)) return null;
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) return null;
    const value: unknown = descriptor.value;
    if (value !== 'na' && (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5)) return null;
    answers.set(key, value as HoldingBackAnswer);
  }
  const domains: HoldingBackDomainScore[] = HOLDING_BACK_DOMAINS.map((domain) => {
    const values: number[] = [];
    for (const id of domain.itemIds) {
      const value = answers.get(id);
      if (typeof value === 'number') values.push(value);
    }
    return {
      domainId: domain.id,
      numericCount: values.length,
      requiredNumeric: 5,
      mean: values.length === 5 ? Math.round((values.reduce((sum, value) => sum + value, 0) / 5) * 10) / 10 : null,
    };
  });
  return { method: 'fermatmind-original35-four-week-frequency-v1', domains };
}

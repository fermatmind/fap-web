import { parseCareerCurrentInventory } from '../../scripts/ops/career-current-inventory.mjs';

// Deployment-only waiting must not change the shared LLMS generator identity.
export async function readCareerCurrentInventoryForDeployment({
  fetchImpl = globalThis.fetch,
  wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
  now = Date.now,
} = {}) {
  const deadline = now() + 90_000;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const remaining = deadline - now();
    if (remaining <= 0) throw new Error('CAREER_CURRENT_INVENTORY_FALLBACK_EXHAUSTED');
    const response = await fetchImpl('https://api.fermatmind.com/api/v0.5/seo/sitemap-source', {
      signal: AbortSignal.timeout(Math.min(60_000, remaining)),
    });
    if (!response.ok) throw new Error('CAREER_CURRENT_INVENTORY_UNAVAILABLE');
    const payload = await response.json();
    if (payload?.ok !== true || payload.source !== 'backend_sitemap_generator_fallback') {
      return parseCareerCurrentInventory(payload);
    }
    if (attempt === 5 || now() + 15_000 >= deadline) {
      throw new Error('CAREER_CURRENT_INVENTORY_FALLBACK_EXHAUSTED');
    }
    await wait(15_000);
  }
}

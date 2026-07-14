/**
 * The backend owns current/LKG selection. Keep one short frontend request budget
 * so a slow authority read reaches the route error boundary instead of stacking
 * a second client-side retry behind the backend resilience layer.
 */
export const PERSONALITY_PUBLIC_READ_TIMEOUT_MS = 8_000;

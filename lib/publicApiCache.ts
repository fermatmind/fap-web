export const PUBLIC_API_REVALIDATE_SECONDS = 300;

export const PUBLIC_API_CACHE_OPTIONS = {
  next: {
    revalidate: PUBLIC_API_REVALIDATE_SECONDS,
  },
} as const;

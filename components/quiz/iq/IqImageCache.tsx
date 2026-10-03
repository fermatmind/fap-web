"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createIqImageCache } from "@/lib/iq/imageAsset";

const IqImageCacheContext = createContext<ReturnType<typeof createIqImageCache> | null>(null);

export function IqImageCacheProvider({ children }: { children: ReactNode }) {
  const [cache] = useState(createIqImageCache);
  useEffect(() => () => cache.dispose(), [cache]);
  return <IqImageCacheContext.Provider value={cache}>{children}</IqImageCacheContext.Provider>;
}

export function useIqImageCache() {
  return useContext(IqImageCacheContext);
}

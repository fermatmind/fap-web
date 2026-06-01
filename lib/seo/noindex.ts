import type { Metadata } from "next";
import {
  isNoindexAnalyticsSuppressedPath,
  isPrivateAnalyticsSuppressedPath,
} from "@/lib/tracking/browserAnalyticsSuppression";

export const NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  nocache: true,
  noarchive: true,
};

export { isNoindexAnalyticsSuppressedPath, isPrivateAnalyticsSuppressedPath };

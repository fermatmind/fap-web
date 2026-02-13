import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import ShareClient from "./ShareClient";

export const metadata: Metadata = {
  title: "Shared Summary",
  robots: NOINDEX_ROBOTS,
};

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShareClient shareId={id} />;
}

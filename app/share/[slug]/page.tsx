import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Not Found",
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default function SharePreviewPage() {
  return notFound();
}

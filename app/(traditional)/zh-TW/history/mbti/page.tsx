import { Suspense } from "react";
import MbtiHistoryClient from "@/app/(localized)/[locale]/(app)/history/mbti/MbtiHistoryClient";

export const metadata = { title: "MBTI Workspace Lite" };

export default function TraditionalHistoryPage() {
  return <Suspense fallback={null}><MbtiHistoryClient /></Suspense>;
}

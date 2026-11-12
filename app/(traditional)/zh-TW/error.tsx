"use client";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
export default function TraditionalError({ reset }: { reset: () => void }) {
  return <Container as="main" className="space-y-5 py-10"><h1 className="text-2xl font-bold">暫時無法載入繁體內容</h1><p>請稍後再試。</p><button type="button" onClick={reset} className="min-h-11 rounded-full border px-6 py-3">重新載入</button><Link href="/zh-TW/tests" className="ml-5 inline-block min-h-11 py-3 underline">返回繁體測評目錄</Link></Container>;
}

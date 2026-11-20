import { RiasecReportSample } from "@/components/result/riasec/RiasecReportSample";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default function SamplePage() { return <RiasecReportSample locale="zh-TW" />; }

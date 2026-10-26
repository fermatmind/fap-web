"use client";
export function PrintButton({ locale }: { locale: "en" | "zh" }) { return <button className="fq-print-button" onClick={() => window.print()}>{locale === "zh" ? "打印活动单 / 保存 PDF" : "Print activity sheet / Save PDF"}</button>; }

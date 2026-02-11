import Link from "next/link";
import { listTests } from "@/lib/content";

export const metadata = {
  title: "测试列表",
  description: "当前可用的心理测评列表。",
};

export default function TestsPage() {
  const tests = listTests();

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      <h1>测试列表</h1>
      <p>选择一个测试进入详情页。</p>

      <ul style={{ marginTop: 16, display: "grid", gap: 16 }}>
        {tests.map((test) => (
          <li key={test.slug} style={{ border: "1px solid #e5e5e5", padding: 16 }}>
            <h2 style={{ marginBottom: 8 }}>{test.title}</h2>
            <p style={{ marginBottom: 8 }}>{test.description}</p>
            <p style={{ marginBottom: 8 }}>
              <strong>分类：</strong>{test.category} · <strong>题量：</strong>{test.questionCount} 题 ·
              <strong> 用时：</strong>{test.estTime}
            </p>
            <Link href={`/test/${test.slug}`} style={{ textDecoration: "none" }}>
              查看详情
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

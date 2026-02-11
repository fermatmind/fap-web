import Link from "next/link";
import { getAllTests } from "@/lib/content";

export const metadata = {
  title: "Tests",
  description: "Browse all available tests.",
};

export default function TestsPage() {
  const tests = getAllTests();

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      <h1>Tests</h1>
      <p>Pick a test to view details and start assessment.</p>

      <ul style={{ marginTop: 16, display: "grid", gap: 16 }}>
        {tests.map((test) => (
          <li key={test.slug} style={{ border: "1px solid #e5e5e5", padding: 16 }}>
            <h2 style={{ marginBottom: 8 }}>{test.title}</h2>
            <p style={{ marginBottom: 8 }}>{test.description}</p>
            <p style={{ marginBottom: 8 }}>
              <strong>Questions:</strong> {test.questions_count} · <strong>Time:</strong>{" "}
              {test.time_minutes} min
            </p>
            <Link href={`/tests/${test.slug}`} style={{ textDecoration: "none" }}>
              View details
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

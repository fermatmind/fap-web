import type { ReactNode } from "react";

export function QuizShell({
  children,
  minHeight = 520
}: {
  children: ReactNode;
  minHeight?: number;
}) {
  return (
    <section
      style={{
        minHeight,
        padding: 24,
        border: "1px solid #e2e2e2",
        borderRadius: 16,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}
    >
      {children}
    </section>
  );
}

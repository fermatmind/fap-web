import type { ReactNode } from "react";
import "@/components/tests/tests-design.css";
import "@/components/tests/explore-landing.css";

export default function FriendshipDesignLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="tests-friendship-shell">{children}</div>;
}

import type { ReactNode } from "react";
import { DiscoveryCardArt } from "./DiscoveryCardArt";
import "./tests-design.css";
import "./explore-landing.css";
import "./explore-hero.css";

/** One visual shell for native questionnaires and authored stories; engines stay independent. */
export function ExploreTestShell({
  children,
  category = "framework",
  guide = false,
  slug = "",
}: {
  children: ReactNode;
  category?: string;
  guide?: boolean;
  slug?: string;
}) {
  return (
    <div
      className={`explore-test-shell${guide ? " explore-guide-shell" : " explore-landing"}`}
    >
      {!guide && (
        <div className="explore-art" aria-hidden="true">
          <DiscoveryCardArt slug={slug} category={category} />
        </div>
      )}
      {children}
    </div>
  );
}

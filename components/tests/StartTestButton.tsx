import type { ReactNode } from "react";

export function StartTestButton({ href, children, className = "explore-intro-entry", edition, characterLanding }: { href: string; children: ReactNode; className?: string; edition?: string; characterLanding?: boolean }) {
  const target = new URL(href, "https://fermatmind.com");
  return <form action={target.pathname} method="get" data-ent-start={characterLanding ? "" : undefined} className={characterLanding ? "inline-flex" : "contents"}>
    {[...target.searchParams].map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
    <button type="submit" className={className} data-explore-start data-cognitive-method={edition}>{children}</button>
  </form>;
}

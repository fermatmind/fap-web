import type { ReactNode } from "react";

export function StartTestButton({ href, children, className = "explore-intro-entry", edition }: { href: string; children: ReactNode; className?: string; edition?: string }) {
  const target = new URL(href, "https://fermatmind.com");
  return <form action={target.pathname} method="get" className="contents">
    {[...target.searchParams].map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
    <button type="submit" className={className} data-explore-start data-cognitive-method={edition}>{children}</button>
  </form>;
}

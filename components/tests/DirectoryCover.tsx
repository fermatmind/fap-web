import Image from "next/image";
import type { ReactNode } from "react";
import coverSlugs from "./directory-cover-slugs.json";

const illustratedTests = new Set(coverSlugs);

export function DirectoryCover({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  return (
    <div className="catalog-cover" data-directory-cover={slug} aria-hidden="true">
      {illustratedTests.has(slug) ? (
        <Image
          src={`/images/test-covers/${slug}.webp`}
          alt=""
          fill
          unoptimized
        />
      ) : children}
    </div>
  );
}

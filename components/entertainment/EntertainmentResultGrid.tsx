import Image from "next/image";
import Link from "next/link";

type ResultCard = {
  id: string;
  name: string;
  title: string;
  summary: string;
  href: string;
  portrait?: { src: string; width: number; height: number; alt: string };
};

export function EntertainmentResultGrid({
  title,
  cards,
  className,
}: {
  title: string;
  cards: readonly ResultCard[];
  className: string;
}) {
  return (
    <section id="characters" aria-labelledby="characters-heading">
      <h2 id="characters-heading">{title}</h2>
      <ul className={className}>
        {cards.map(card => (
          <li key={card.id}>
            <Link prefetch={false} href={card.href}>
              {card.portrait && (
                <Image
                  unoptimized
                  loading="lazy"
                  src={card.portrait.src}
                  alt={card.portrait.alt}
                  width={card.portrait.width}
                  height={card.portrait.height}
                />
              )}
              <div>
                <h3>{card.name}</h3>
                <strong>{card.title}</strong>
                <p>{card.summary}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

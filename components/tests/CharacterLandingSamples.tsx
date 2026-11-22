import Image from "next/image";
import Link from "next/link";
import { ExploreLandingSamples } from "./ExploreLandingSamples";
import styles from "./explore-landing-samples.module.css";

type CharacterSample = {
  id: string;
  range: string;
  title: string;
  lead: string;
  badges?: readonly string[];
  image: { src: string; alt: string };
  link: { href: string; label: string };
};

export function CharacterLandingSamples({ label, profiles, tone }: {
  label: string;
  profiles: readonly CharacterSample[];
  tone?: "neon" | "night" | "plum";
}) {
  return <ExploreLandingSamples label={label} names={profiles.map(profile => profile.range)} tone={tone}>
    {profiles.map(profile => <figure className={styles.character} data-ent-sample-result-id={profile.id} key={profile.id}>
      <Image src={profile.image.src} alt={profile.image.alt} width={tone === "neon" ? 480 : 176} height={tone === "neon" ? 270 : 176} unoptimized />
      <figcaption>
        <p className={styles.characterTitle} data-ent-sample-title>{profile.title}</p>
        {profile.badges && <ul>{profile.badges.map(badge => <li key={badge}>{badge}</li>)}</ul>}
        <p>{profile.lead}</p>
        <Link href={profile.link.href} prefetch={false} data-ent-guide>{profile.link.label}<span aria-hidden> →</span></Link>
      </figcaption>
    </figure>)}
  </ExploreLandingSamples>;
}

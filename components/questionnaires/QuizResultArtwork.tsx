import { auraColors as aura } from "@/lib/questionnaires/auraColors";
import {
  Axe, BookOpen, BowArrow, CircleDot, Compass, Crown, Eye, Feather, Flame,
  Globe, Hammer, HandHeart, Heart, Hourglass, Key, LampDesk, Landmark, Link2,
  Moon, Mountain, Music, Orbit, Scale, ScrollText, Shield, ShieldHalf, Skull,
  Snowflake, Sprout, Star, Sun, Swords, TowerControl, WandSparkles,
  Waves, Zap, type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import styles from "./PortraitResultLead.module.css";

const tarot: Record<string, LucideIcon> = {
  fool: Compass, magician: WandSparkles, "high-priestess": Eye, empress: Sprout,
  emperor: Crown, hierophant: Key, lovers: Heart, chariot: Zap, strength: Flame,
  hermit: LampDesk, "wheel-of-fortune": Orbit, justice: Scale, "hanged-man": Hourglass,
  death: Skull, temperance: Waves, devil: Link2, tower: TowerControl, star: Star,
  moon: Moon, sun: Sun, judgement: Feather, world: Globe,
};

const fieldGuides: Record<string, { style: string; symbols: Record<string, LucideIcon> }> = {
  "philosopher-personality-test": {
    style: "folio",
    symbols: {
      socrates: LampDesk, aristotle: ScrollText, confucius: BookOpen, laozi: Waves,
      epicurus: Sprout, epictetus: Key, nietzsche: Mountain, "simone-de-beauvoir": Feather,
      "marcus-aurelius": Landmark,
    },
  },
  "dungeons-dragons-class": {
    style: "guild",
    symbols: {
      barbarian: Axe, bard: Music, cleric: HandHeart, druid: Sprout, fighter: Swords,
      monk: CircleDot, paladin: Shield, ranger: BowArrow, rogue: Key, sorcerer: Flame,
      warlock: Moon, wizard: WandSparkles,
    },
  },
  "space-marine-chapter": {
    style: "dossier",
    symbols: {
      ultramarines: ShieldHalf, "imperial-fists": Hammer, "iron-hands": Shield,
      salamanders: Flame, "raven-guard": Feather, "white-scars": Zap,
    },
  },
};

const animalContours: Record<string, string> = {
  wolf: "M13 27 11 11l12 8 9-2 11-8-2 17 9 8-5 6-12 1-5 10-8-3-3-10Z",
  owl: "M17 21 12 12l13 5h10l13-5-5 9c8 13-1 28-13 28S9 34 17 21Z M18 29h6m12 0h6m-15 5 3 4 3-4",
  fox: "m13 12 14 10h6l14-10-3 18 8 7-13 2-9 9-9-9-13-2 8-7Z",
  lion: "M30 9c5 0 8 4 12 4l5 8 4 8-4 8-5 9-12 5-12-5-5-9-4-8 4-8 5-8c4 0 7-4 12-4Z M20 24l4 5m16-5-4 5m-12 7 6 5 6-5",
  dolphin: "M8 39c6-14 15-18 23-18l6-10 4 11c7 2 12 6 14 9l-9 2-7-3c-6 2-13 6-18 13l-8 1-5 5 1-7-4-3Z",
  deer: "M27 20 21 9m-2 11L13 9m20 11 6-11m2 11 6-11M24 24l-12-4 5 12 6 1 3 12 4 5 4-5 3-12 6-1 5-12-12 4Z",
  bear: "M15 25a7 7 0 1 1 9-9 23 23 0 0 1 12 0 7 7 0 1 1 9 9 18 18 0 1 1-30 0Z M25 37q5-5 10 0-5 8-10 0Z",
  eagle: "M6 18l17 7 4-4 3-7 3 7 4 4 17-7-7 10-10 7-2 7-5 6-5-6-2-7-10-7Z",
  otter: "M10 39c1-5 6-7 11-6 0-6 4-11 10-13 6-2 11 0 13 5 3 0 6 1 7 4-4 4-8 4-11 3-3 7-12 13-20 13-5 0-8-1-10-6Z M42 26h1",
};

export function hasQuizResultArtwork(slug: string) {
  return slug === "aura-color" || slug === "which-tarot-card-are-you" ||
    slug === "spirit-animal" || Object.hasOwn(fieldGuides, slug);
}

export function QuizResultArtwork({ slug, id }: { slug: string; id: string }) {
  if (slug === "aura-color" && aura[id]) {
    return <div aria-hidden="true" data-quiz-artwork={id} className={styles.auraArtwork}>
      <div className={styles.auraHalo} style={{ "--aura-color": aura[id] } as CSSProperties} />
      <div className={styles.auraSpectrum}>{Object.entries(aura).map(([key, color]) =>
        <span key={key} data-active={key === id ? "" : undefined} style={{ backgroundColor: color }} />
      )}</div>
    </div>;
  }

  if (slug === "spirit-animal" && animalContours[id]) {
    return <div aria-hidden="true" data-quiz-artwork={id} data-artwork-style="field" className={styles.symbolArtwork}>
      <svg viewBox="0 0 60 60" width="96" height="96" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
        <path d={animalContours[id]} />
      </svg>
    </div>;
  }

  const guide = fieldGuides[slug];
  const Icon = slug === "which-tarot-card-are-you" ? tarot[id] : guide?.symbols[id];
  if (!Icon) return null;

  return <div aria-hidden="true" data-quiz-artwork={id} data-artwork-style={guide?.style ?? "tarot"} className={styles.symbolArtwork}>
    {slug === "which-tarot-card-are-you" && <Star className={styles.cardStar} size={14} strokeWidth={1.5} />}
    <Icon size={64} strokeWidth={1.35} />
    {slug === "which-tarot-card-are-you" && <Snowflake className={styles.cardStar} size={14} strokeWidth={1.5} />}
  </div>;
}

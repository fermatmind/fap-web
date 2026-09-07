import Image from "next/image";
import styles from "./assessment-hero-artwork.module.css";

/** Decorative, frontend-owned artwork; it carries no assessment or scoring data. */
export function AssessmentHeroArtwork({ src }: { src: string }) {
  return (
    <div className={styles.scene} aria-hidden="true" data-testid="assessment-hero-artwork">
      <Image src={src} alt="" width={1774} height={887} sizes="100vw" priority className={styles.artwork} />
    </div>
  );
}

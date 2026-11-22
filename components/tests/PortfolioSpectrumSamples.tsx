import Link from "next/link";
import { ExploreLandingSamples } from "./ExploreLandingSamples";
import styles from "./portfolio-landing-preview.module.css";

type SpectrumSample = {
  id: string;
  title: string;
  score: number;
  mean: string;
  guides: readonly { href: string; title: string }[];
};

export function PortfolioSpectrumSamples({ label, samples, minimum, maximum, scoreLabel, endpoints }: {
  label: string;
  samples: readonly SpectrumSample[];
  minimum: number;
  maximum: number;
  scoreLabel: string;
  endpoints: readonly [string, string];
}) {
  return <ExploreLandingSamples label={label} names={samples.map(sample => sample.title)} tone="night">
    {samples.map(sample => <figure key={sample.id} className={styles.spectrum} data-ent-chart data-ent-sample-id={sample.id}>
      <figcaption data-ent-chart-label><strong>{sample.score}</strong> <span>{scoreLabel} · {sample.mean}</span></figcaption>
      <div className={styles.spectrumPlot} data-ent-chart-plot aria-hidden="true">
        <div className={styles.spectrumFill} style={{ inlineSize: `${(sample.score - minimum) * 100 / (maximum - minimum)}%` }} />
      </div>
      <div className={styles.spectrumEnds}>
        <span data-ent-chart-label>{minimum} · {endpoints[0]}</span>
        <span data-ent-chart-label>{maximum} · {endpoints[1]}</span>
      </div>
      <ul className={styles.spectrumGuides}>
        {sample.guides.map(guide => <li key={guide.href}><Link href={guide.href} prefetch={false}>{guide.title}<span aria-hidden> →</span></Link></li>)}
      </ul>
    </figure>)}
  </ExploreLandingSamples>;
}

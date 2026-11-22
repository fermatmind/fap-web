import { ExploreLandingSamples } from "./ExploreLandingSamples";
import styles from "./portfolio-landing-preview.module.css";

export type AxisSample = {
  id: string;
  title: string;
  guideSummary?: string;
  axes: readonly { id: string; title: string; value: number; maximum: number; score: string }[];
};

export function PortfolioAxisBarSamples({ label, legend, samples }: {
  label: string;
  legend: string;
  samples: readonly AxisSample[];
}) {
  return <ExploreLandingSamples label={label} names={samples.map(sample => sample.title)} tone="night">
    {samples.map(sample => <figure key={sample.id} data-ent-chart data-ent-sample-id={sample.id} className={styles.pairedSample}>
      <figcaption data-ent-chart-legend>{legend}</figcaption>
      <div className={styles.pairedGrid}>
        <div data-ent-chart-plot className={styles.pairedPlot} aria-hidden="true">
          {sample.axes.map(axis => <div className={styles.pairedPlotRow} key={axis.id}>
            <div className={styles.pairedTrack}><span style={{ inlineSize: `${100 * axis.value / axis.maximum}%` }} /></div>
          </div>)}
        </div>
        <dl className={styles.pairedLegend}>
          {sample.axes.map(axis => <div key={axis.id} data-ent-chart-label>
            <dt>{axis.title}</dt><dd>{axis.score}</dd>
          </div>)}
        </dl>
      </div>
      {sample.guideSummary && <p className="text-sm leading-6">{sample.guideSummary}</p>}
    </figure>)}
  </ExploreLandingSamples>;
}

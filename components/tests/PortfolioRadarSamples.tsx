import Link from "next/link";
import { ExploreLandingSamples } from "./ExploreLandingSamples";
import styles from "./portfolio-landing-preview.module.css";

type RadarSample = {
  id: string;
  title: string;
  guideHref: string;
  axes: readonly { id: string; title: string; value: number; maximum: number }[];
};

export function PortfolioRadarSamples({ samples, label, legend, guideLabel }: {
  samples: readonly RadarSample[];
  label: string;
  legend: string;
  guideLabel: string;
}) {
  return <ExploreLandingSamples label={label} names={samples.map(sample => sample.title)} tone="night">
    {samples.map(sample => {
      const coordinate = (index: number, fraction: number) => {
        const angle = -Math.PI / 2 + index * 2 * Math.PI / sample.axes.length;
        return [110 + 78 * fraction * Math.cos(angle), 110 + 78 * fraction * Math.sin(angle)];
      };
      const grid = [0.25, 0.5, 0.75, 1].map(level => sample.axes.map((_, index) => coordinate(index, level).join(",")).join(" "));
      const points = sample.axes.map((axis, index) => coordinate(index, axis.value / axis.maximum).join(",")).join(" ");
      return <figure key={sample.id} data-ent-sample-id={sample.id} data-ent-chart className={styles.radar}>
        <figcaption data-ent-chart-legend>{legend}</figcaption>
        <svg data-ent-chart-plot viewBox="0 0 220 208" aria-hidden="true">
          {grid.map(polygon => <polygon key={polygon} points={polygon} fill="none" stroke="#9eaacf" strokeOpacity="0.55" />)}
          {sample.axes.map((axis, index) => {
            const [x2, y2] = coordinate(index, 1);
            return <line key={axis.id} x1={110} y1={110} x2={x2} y2={y2} stroke="#9eaacf" strokeOpacity="0.55" />;
          })}
          <polygon points={points} fill="#f3c878" fillOpacity="0.34" stroke="#f3c878" strokeWidth="2" />
        </svg>
        <dl className={styles.radarStats}>{sample.axes.map(axis => <div key={axis.id} data-ent-chart-label>
          <dt>{axis.title}</dt><dd>{axis.value} / {axis.maximum}</dd>
        </div>)}</dl>
        <Link href={sample.guideHref} prefetch={false}>{guideLabel}<span aria-hidden> →</span></Link>
      </figure>;
    })}
  </ExploreLandingSamples>;
}

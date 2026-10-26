import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireColorSwatch } from "@/lib/questionnaires/types";

export function QuestionnairePaletteSwatches({ swatches, locale, showLabels = true }: { swatches: QuestionnaireColorSwatch[]; locale: Locale; showLabels?: boolean }) {
  return <span className="mt-3 flex flex-wrap gap-3" data-palette-swatches="" aria-hidden={showLabels ? undefined : true}>
    {swatches.map(swatch => <span key={swatch.hex} className={showLabels ? "min-w-20 flex-1" : "flex-1"}>
      <span data-palette-colour={swatch.hex} className="block h-12 rounded border border-slate-300" style={{ backgroundColor: swatch.hex }} />
      {showLabels && <span className="mt-1 block text-sm leading-6 text-slate-800">{swatch.name[locale]}<br /><span className="font-mono">{swatch.hex}</span></span>}
    </span>)}
  </span>;
}

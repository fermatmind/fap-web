import type { DisplayLocale } from "@/lib/i18n/locales";
import { historyPeople, type HistoryPerson } from "./people";
import generated from "@/lib/i18n/zh-TW/global-history-roster.generated.json";

const source = "lib/entertainment/global-history/people.json";
const fields = ["name", "region", "field", "bio"] as const;
const units: Record<string, { text: string }> = generated.units;
const byId = new Map(historyPeople.map((person, index) => [person.id, index]));

export function displayHistoryPerson(person: HistoryPerson, locale: DisplayLocale): HistoryPerson {
  if (locale !== "zh-TW") return person;
  const index = byId.get(person.id);
  if (index === undefined) throw new Error("Unknown public history figure");
  const display = { ...person };
  for (const field of fields) {
    const unit = units[`${source}/${index}/${field}`];
    if (!unit) throw new Error(`Missing Taiwan history copy for ${person.id}: ${field}`);
    display[field] = { ...person[field], zh: unit.text };
  }
  return display;
}

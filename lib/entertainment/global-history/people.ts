import roster from "./people.json";
import type { Copy } from "../types";

export type HistoryPerson = {
  id: string;
  name: Copy;
  region: Copy;
  field: Copy;
  bio: Copy;
  qid: string;
  vector: readonly number[];
};

export const historyPeople: readonly HistoryPerson[] = roster;
const peopleById = new Map(historyPeople.map(person => [person.id, person]));
export const findHistoryPerson = (id: string) => peopleById.get(id);

export const HISTORY_GALLERY_PAGE_SIZE = 24;

export function getHistoryGalleryPage(input: string | string[] | undefined) {
  const total = Math.ceil(historyPeople.length / HISTORY_GALLERY_PAGE_SIZE);
  const page = typeof input === "string" && /^[1-9]\d{0,3}$/.test(input)
    ? Math.min(Number(input), total) : 1;
  const start = (page - 1) * HISTORY_GALLERY_PAGE_SIZE;
  return { page, total, people: historyPeople.slice(start, start + HISTORY_GALLERY_PAGE_SIZE) };
}

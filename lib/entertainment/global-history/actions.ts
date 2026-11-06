"use server";

import { closestHistoryPerson, historyAnswerVector } from "./matching";
import { historyPeople } from "./people";

export async function matchGlobalHistory(choices: unknown) {
  const vector = historyAnswerVector(choices);
  if (!vector) return null;
  const person = closestHistoryPerson(vector, historyPeople);
  return person ? { id: person.id, vector } : null;
}

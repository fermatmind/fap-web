import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { traditionalLikertMetadata } from "@/components/i18n/zh-TW/LikertQuestionnairePage";
import { TraditionalObservationPage } from "@/components/i18n/zh-TW/TraditionalObservationPage";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { loadTraditionalObservation } from "@/lib/i18n/zh-TW/observationQuestionnaires";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { recordCareFeelings20 } from "@/lib/questionnaires/careFeelings20";
import { recordConnectionCheckIn21 } from "@/lib/questionnaires/connectionCheckIn21";
import { recordDisconnection20 } from "@/lib/questionnaires/disconnection20";
import { recordEmotionsConnections21 } from "@/lib/questionnaires/emotionsConnections21";
import { recordFeelingsConnection8 } from "@/lib/questionnaires/feelingsConnection8";
import { recordSocialContext20 } from "@/lib/questionnaires/socialContext20";

import { recordCommunicationRoutines20 } from "@/lib/questionnaires/communicationRoutines20";
import { recordFocusContext16 } from "@/lib/questionnaires/focusContext16";
import { recordNumberContext20 } from "@/lib/questionnaires/numberContext20";
import { recordSpatialContext4 } from "@/lib/questionnaires/spatialContext4";
import { recordUnfamiliar20 } from "@/lib/questionnaires/unfamiliar20";
import { recordWrittenLanguage20 } from "@/lib/questionnaires/writtenLanguage20";

import { recordBirthContext16 } from "@/lib/questionnaires/birthContext16";
import { recordCycleContext16 } from "@/lib/questionnaires/cycleContext16";
import { recordSeasonContext16 } from "@/lib/questionnaires/seasonContext16";
import { recordSleepExperiences20 } from "@/lib/questionnaires/sleepExperiences20";
import { recordEatingExperiences20 } from "@/lib/questionnaires/eatingExperiences20";
import { recordDrinkingExperiences20 } from "@/lib/questionnaires/drinkingExperiences20";

afterEach(cleanup);

it.each([
  ["care-feelings-reflection", recordCareFeelings20],
  ["connection-belonging-check-in", recordConnectionCheckIn21],
  ["disconnection-experiences-reflection", recordDisconnection20],
  ["emotions-connections-reflection", recordEmotionsConnections21],
  ["feelings-connection-reflection", recordFeelingsConnection8],
  ["social-context-reflection", recordSocialContext20],
  ["communication-routines-context", recordCommunicationRoutines20],
  ["focus-energy-context-reflection", recordFocusContext16],
  ["number-context-reflection", recordNumberContext20],
  ["spatial-thinking-reflection", recordSpatialContext4],
  ["unfamiliar-experiences-reflection", recordUnfamiliar20],
  ["written-language-context-reflection", recordWrittenLanguage20],
  ["after-childbirth-context-reflection", recordBirthContext16],
  ["menstrual-cycle-context-reflection", recordCycleContext16],
  ["time-of-year-context-reflection", recordSeasonContext16],
  ["sleep-experiences-reflection", recordSleepExperiences20],
  ["eating-experiences-reflection", recordEatingExperiences20],
  ["drinking-experiences-reflection", recordDrinkingExperiences20],
] as const)("keeps the authoritative category recorder and full Taiwan readings for %s", async (slug, record) => {
  const item = (await loadTraditionalObservation(slug))!;
  const { source, quiz } = item;
  expect(quiz.source).toEqual(source.source);
  expect(quiz.questions.map(({ id, options }) => [id, options.map(option => [option.id, option.directionId, option.score])]))
    .toEqual(source.questions.map(({ id, options }) => [id, options.map(option => [option.id, option.directionId, option.score])]));
  const all = Object.fromEntries(quiz.questions.map(question => [question.id, question.options.at(-1)!.id]));
  expect(record(source, all).status).toBe("complete");
  const partial = { ...all };
  delete partial[quiz.questions[0].id];
  expect(record(source, partial).status).not.toBe("complete");

  const entry = questionnairePath("zh-TW", slug);
  expect(traditionalPath(questionnairePath("zh", slug))).toBe(entry);
  expect(traditionalPath(entry + "/results/unknown")).toBeNull();
  expect(await traditionalLikertMetadata({ slug, take: true })).toMatchObject({
    alternates: { canonical: entry }, robots: { index: false, follow: false },
  });
  const { container } = render(await TraditionalObservationPage({ slug, take: false }));
  expect(screen.getByRole("heading", { level: 1, name: quiz.title.zh })).toBeVisible();
  expect(container.textContent).not.toMatch(/24小時|二十四小時/);
  for (const [index, profile] of quiz.profiles.entries()) {
    const original = prepareResultProfile(slug, source.profiles[index]);
    expect(profile.sections.map(section => [section.id, section.paragraphs.length]))
      .toEqual(original.sections.map(section => [section.id, section.paragraphs.length]));
    expect(container.querySelector(`a[href="${entry}/results/${profile.id}"]`)).toBeTruthy();
  }
  cleanup();
  const profile = quiz.profiles[0];
  render(await TraditionalObservationPage({ slug, take: false, profile: profile.id }));
  expect(screen.getByRole("heading", { level: 1, name: profile.title.zh })).toBeVisible();
  expect(screen.getAllByText(profile.sections.at(-1)!.paragraphs.at(-1)!.zh, { exact: false }).length).toBeGreaterThan(0);
});

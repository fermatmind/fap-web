import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { EnneagramResultShell } from "@/components/result/enneagram/EnneagramResultShell";
import { assembleEnneagramResultViewModel } from "@/lib/enneagram/resultAssembler";
import { createSevenChapterReport } from "@/tests/contracts/helpers/enneagramSevenChapterFixture";

expect.extend(toHaveNoViolations);
const api = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("@/lib/api/v0_3", async () => ({ ...(await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3")), fetchEnneagramObservation: api.fetch }));
vi.mock("@/components/big5/pdf/PdfDownloadButton", () => ({ PdfDownloadButton: () => null }));

test("the canonical seven-chapter Enneagram result has no basic accessibility violations", async () => {
  api.fetch.mockResolvedValue({ observation_state_v1: null });
  const viewModel = assembleEnneagramResultViewModel({ reportData: createSevenChapterReport(), locale: "en", gate: { isFreeVariant: false } });
  const { container } = render(<EnneagramResultShell locale="en" attemptId="attempt-a11y" reportLocked={false} viewModel={viewModel} />);
  expect(await axe(container)).toHaveNoViolations();
});

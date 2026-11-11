import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RiasecCareerNextSteps } from "@/components/result/riasec/RiasecCareerNextSteps";
import release from "@/lib/career/interestRelease.json";
import traditionalCopy from "@/lib/career/interestRelease.zh-TW.json";
import { rankRiasecCareers } from "@/lib/career/riasecProfileMatch";

const scores = (values: number[]) => ["R", "I", "A", "S", "E", "C"].map((code, i) => ({
  code, label: code, score: values[i], scoreAvailable: true,
}));

describe("Holland result to occupational interests", () => {
  it("ranks the same six-dimensional shape first independently of score order and language", () => {
    const entry = release.careers["industrial-designers"];
    const profile = scores(entry.interestVector.map(value => (value - 1) / 6 * 100));
    const en = rankRiasecCareers(profile, "en");
    const zh = rankRiasecCareers([...profile].reverse(), "zh");
    expect(en.jobs[0]).toMatchObject({ slug: "industrial-designers", similarity: 1000000 });
    expect(zh.jobs.map(job => job.slug)).toEqual(en.jobs.map(job => job.slug));
    const markup = renderToStaticMarkup(<RiasecCareerNextSteps locale="zh" scores={profile} />);
    expect(markup).toContain('data-testid="riasec-profile-careers"');
    expect(markup).toContain('/zh/career/jobs/industrial-designers');
  });

  it("keeps every Taiwan candidate tied to the existing occupational identity and ranking", () => {
    expect(Object.keys(traditionalCopy)).toEqual(Object.keys(release.careers));
    for (const career of Object.values(release.careers)) {
      const profile = scores(career.interestVector.map(value => (value - 1) / 6 * 100));
      const ranked = rankRiasecCareers(profile, "zh-TW");
      const source = rankRiasecCareers(profile, "zh");
      expect(ranked.state).toBe(source.state);
      expect(ranked.jobs.map(({ slug, similarity }) => [slug, similarity])).toEqual(
        source.jobs.map(({ slug, similarity }) => [slug, similarity]),
      );
      for (const job of ranked.jobs) {
        expect(job).toMatchObject(traditionalCopy[job.slug as keyof typeof traditionalCopy]);
      }
    }
    const flat = renderToStaticMarkup(<RiasecCareerNextSteps locale="zh" displayLocale="zh-TW" scores={scores([60, 60, 60, 60, 60, 60])} />);
    expect(flat).toContain("你的六向度分數較接近");
    expect(flat).not.toContain('data-testid="riasec-profile-careers"');
  });

  it("does not rank flat, near-flat, missing or unverified scores", () => {
    expect(rankRiasecCareers(scores([65, 65, 65, 65, 65, 65]), "en").state).toBe("flat");
    expect(rankRiasecCareers(scores([61, 60, 59, 60, 61, 59]), "en").state).toBe("flat");
    expect(rankRiasecCareers(scores([80, 70, 50, 30, 20, 10]).slice(1), "en").state).toBe("unavailable");
    const profile = scores([80, 80, 30, 20, 40, 20]);
    profile[2].scoreAvailable = false;
    expect(rankRiasecCareers(profile, "en").jobs).toEqual([]);
    expect(renderToStaticMarkup(<RiasecCareerNextSteps locale="en" scores={profile} />))
      .not.toContain('data-testid="riasec-profile-careers"');
  });

  it("keeps a stable order for profiles with tied dimensions and does not emit negative correlations", () => {
    const profile = scores([80, 80, 30, 20, 40, 20]);
    const ranked = rankRiasecCareers(profile, "en");
    expect(ranked.jobs.length).toBeGreaterThan(0);
    expect(ranked.jobs.every(job => job.similarity > 0)).toBe(true);
    expect(ranked.jobs).toEqual(rankRiasecCareers([...profile].reverse(), "en").jobs);
  });
});

import Image from "next/image";
import Link from "next/link";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { getAllTests } from "@/lib/content";

export default function Home() {
  const featuredTests = getAllTests().slice(0, 6);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AnalyticsPageViewTracker eventName="view_landing" />

      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
            FermatMind
          </Link>
          <Link
            href="/tests"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
          >
            Tests
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div className="flex flex-col justify-center gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">
            Evidence-informed personality assessments
          </p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Free Personality Tests With Actionable Insights
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Take research-backed tests, get clear results, and choose the next assessment that fits your goals in minutes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tests/personality-mbti-test/take"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Start free test
            </Link>
            <Link
              href="/tests"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
            >
              Browse tests
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Popular test</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <Image
              src="/share/mbti_square_600x600.png"
              alt="MBTI personality test"
              width={600}
              height={600}
              className="h-auto w-full"
            />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">MBTI Personality Test</h2>
          <p className="mt-2 text-sm text-slate-600">
            Complete all 144 questions and unlock your type profile with axis-level interpretation.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Tests</h2>
            <p className="mt-1 text-sm text-slate-600">Choose a test and start immediately.</p>
          </div>
          <Link href="/tests" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
            View all
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredTests.map((test) => (
            <article
              key={test.slug}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Image
                  src={test.cover_image}
                  alt={test.title}
                  width={600}
                  height={600}
                  className="h-44 w-full object-cover"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{test.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{test.description}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                {test.questions_count} questions · {test.time_minutes} min
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/tests/${test.slug}/take`}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  Start
                </Link>
                <Link
                  href={`/tests/${test.slug}`}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500"
                >
                  Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Trust & Credibility</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Methodology-first test design with transparent scoring logic.</li>
              <li>Privacy-conscious handling for sensitive psychology-related responses.</li>
              <li>Secure transport for data in transit and controlled access to results.</li>
              <li>Results support self-understanding and do not replace clinical judgment.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">What You Get</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Structured test flow with progress visibility.</li>
              <li>Clear result summary tied to the selected scale.</li>
              <li>Optional report load for deeper interpretation.</li>
              <li>Easy navigation to related tests from one homepage hub.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="text-xl font-bold text-amber-900">隐私与免责声明</h2>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-amber-900">隐私声明</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900/90">
            <li>参与测评不要求实名，你可以匿名完成测试流程。</li>
            <li>数据传输过程使用 HTTPS 保护，降低传输链路泄露风险。</li>
            <li>心理测评数据属于敏感信息，平台按敏感数据标准进行处理。</li>
          </ul>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-amber-900">免责声明</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900/90">
            <li>本测评结果不构成医疗诊断，也不构成治疗建议。</li>
            <li>如有严重心理困扰，请及时寻求专业心理或医疗帮助。</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

import { TestCard } from "@/components/business/TestCard";
import { Container } from "@/components/layout/Container";
import { getAllTests } from "@/lib/content";

export const metadata = {
  title: "Tests",
  description: "Browse all available tests.",
};

export default function TestsPage() {
  const tests = getAllTests();

  return (
    <Container as="main" className="py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tests</h1>
        <p className="text-slate-600">
          Pick a test to view details and start assessment.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tests.map((test) => (
          <TestCard
            key={test.slug}
            slug={test.slug}
            title={test.title}
            description={test.description}
            coverImage={test.cover_image}
            questions={test.questions_count}
            timeMinutes={test.time_minutes}
            scaleCode={test.scale_code}
          />
        ))}
      </div>
    </Container>
  );
}

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listTypes } from "@/lib/content";

export const metadata = {
  title: "Types",
  description: "Browse available personality type explainers.",
};

export default function TypesPage() {
  const types = listTypes();

  return (
    <Container as="main" className="py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Types</h1>
        <p className="text-slate-600">
          Explore personality type profiles and practical interpretation notes.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {types.map((type) => (
          <Card key={type.code}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge>{type.code}</Badge>
                <CardTitle>{type.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{type.description}</p>
              <Link
                href={`/types/${type.code}`}
                className="text-sm font-semibold text-sky-700 hover:text-sky-800"
              >
                View details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}

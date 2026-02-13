import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTypeByCode, listTypes } from "@/lib/content";

export function generateStaticParams() {
  return listTypes().map((type) => ({ code: type.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const type = getTypeByCode(code.toUpperCase());

  if (!type) {
    return {
      title: "Type Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${type.code} - ${type.name}`,
    description: type.description,
  };
}

export default async function TypeDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const type = getTypeByCode(code.toUpperCase());

  if (!type) return notFound();

  return (
    <Container as="main" className="py-10">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{type.code}</Badge>
            <CardTitle>{type.name}</CardTitle>
          </div>
          <p className="text-sm text-slate-600">{type.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {type.traits?.length ? (
            <div className="flex flex-wrap gap-2">
              {type.traits.map((trait) => (
                <Badge key={trait}>{trait}</Badge>
              ))}
            </div>
          ) : null}
          {type.updatedAt ? (
            <p className="text-sm text-slate-500">Updated: {type.updatedAt}</p>
          ) : null}
          <Link href="/types" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
            Back to types
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}

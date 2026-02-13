import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type TestCardProps = {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  questions: number;
  timeMinutes: number;
  scaleCode?: string;
};

export function TestCard({
  slug,
  title,
  description,
  coverImage,
  questions,
  timeMinutes,
  scaleCode,
}: TestCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="overflow-hidden border-b border-slate-200">
        <Image
          src={coverImage}
          alt={title}
          width={600}
          height={600}
          className="h-48 w-full object-cover"
        />
      </div>

      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{questions} questions</Badge>
          <Badge>{timeMinutes} min</Badge>
          {scaleCode ? <Badge>{scaleCode}</Badge> : null}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="mt-auto" />

      <CardFooter className="gap-2">
        <Link href={`/tests/${slug}/take`} className={buttonVariants({ size: "sm" })}>
          Start
        </Link>
        <Link
          href={`/tests/${slug}`}
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          Details
        </Link>
      </CardFooter>
    </Card>
  );
}

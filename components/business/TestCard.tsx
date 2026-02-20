import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictSync } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

type TestCardProps = {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  questions: number;
  timeMinutes: number;
  scaleCode?: string;
  locale?: Locale;
};

export function TestCard({
  slug,
  title,
  description,
  coverImage,
  questions,
  timeMinutes,
  scaleCode,
  locale = "en",
}: TestCardProps) {
  const dict = getDictSync(locale);

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
          <Badge>{questions} {dict.common.questions_unit}</Badge>
          <Badge>{timeMinutes} {dict.common.minutes_unit}</Badge>
          {scaleCode ? <Badge>{scaleCode}</Badge> : null}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="mt-auto" />

      <CardFooter className="gap-2">
        <Link href={localizedPath(`/tests/${slug}/take`, locale)} className={buttonVariants({ size: "sm" })}>
          {dict.common.start}
        </Link>
        <Link
          href={localizedPath(`/tests/${slug}`, locale)}
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          {dict.common.details}
        </Link>
      </CardFooter>
    </Card>
  );
}

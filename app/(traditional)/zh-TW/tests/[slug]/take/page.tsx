import { LocaleProvider } from "@/components/i18n/LocaleContext";
import TakePage, { generateMetadata as takeMetadata } from "@/app/(localized)/[locale]/tests/[slug]/take/page";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function traditionalParams(params: Props["params"]) {
  return params.then(({ slug }) => ({ locale: "zh-TW", slug }));
}

export function generateMetadata({ params }: Props) {
  return takeMetadata({ params: traditionalParams(params) });
}

export default async function TraditionalTakePage({ params, searchParams }: Props) {
  const page = await TakePage({ params: traditionalParams(params), searchParams });
  return <LocaleProvider locale="zh">{page}</LocaleProvider>;
}

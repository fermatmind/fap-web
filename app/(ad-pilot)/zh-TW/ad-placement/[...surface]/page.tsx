import Page, { generateMetadata as adMetadata } from "@/app/(ad-pilot)/[locale]/ad-placement/[...surface]/page";

type Props = { params: Promise<{ surface: string[] }> };

function traditionalProps({ params }: Props) {
  return { params: params.then(({ surface }) => ({ locale: "zh-TW", surface })) };
}

export function generateMetadata(props: Props) {
  return adMetadata(traditionalProps(props));
}

export default function TraditionalAdPage(props: Props) {
  return Page(traditionalProps(props));
}

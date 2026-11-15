import CareerInterestPage, {
  generateMetadata as interestMetadata,
  generateStaticParams,
} from "@/app/(localized)/[locale]/career/interests/[code]/page";

export const dynamicParams = false;
export { generateStaticParams };

type Props = { params: Promise<{ code: string }> };

function traditionalParams(params: Props["params"]) {
  return params.then(({ code }) => ({ code, locale: "zh-TW" }));
}

export function generateMetadata({ params }: Props) {
  return interestMetadata({ params: traditionalParams(params) });
}

export default function TraditionalCareerInterestPage({ params }: Props) {
  return CareerInterestPage({ params: traditionalParams(params) });
}

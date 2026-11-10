import { CareerInterestPilotPage, careerInterestPilotMetadata } from "@/components/career/CareerInterestPilotPage";

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return careerInterestPilotMetadata(params, "ac");
}

export default function Page({ params }: Props) {
  return CareerInterestPilotPage({ params, code: "ac" });
}

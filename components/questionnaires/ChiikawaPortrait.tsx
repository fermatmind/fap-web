import Image from "next/image";

/** The profile ID comes from the published Chiikawa roster. */
export function ChiikawaPortrait({ id, className }: { id: string; className: string }) {
  return <Image className={className} src={`/images/quiz-portraits/chiikawa/${id}.webp`} width={640} height={640} unoptimized alt="" />;
}

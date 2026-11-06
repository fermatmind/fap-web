import Image from "next/image";

/** The caller supplies a profile from the validated Edgerunners questionnaire. */
export function EdgerunnersPortrait({ id, className }: { id: string; className: string }) {
  return <Image className={className} src={`/images/quiz-portraits/cyberpunk-edgerunners/${id}.webp`} width={640} height={640} unoptimized alt="" />;
}

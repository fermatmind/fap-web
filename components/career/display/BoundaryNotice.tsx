import type { CareerDisplayReviewValidity } from "@/lib/career/displaySurface";

type BoundaryNoticeProps = {
  heading: string;
  notices: string[];
  reviewValidity: CareerDisplayReviewValidity | null;
};

export function BoundaryNotice({ heading, notices, reviewValidity }: BoundaryNoticeProps) {
  if (notices.length === 0 && !reviewValidity) {
    return null;
  }

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5" data-testid="boundary-notice">
      <h2 className="m-0 text-2xl font-semibold tracking-normal text-amber-950">{heading}</h2>
      {notices.length > 0 ? (
        <ul className="m-0 mt-4 space-y-2 pl-5 text-sm leading-6 text-amber-950">
          {notices.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      ) : null}
      {reviewValidity ? (
        <p className="m-0 mt-4 text-xs leading-5 text-amber-900">
          {reviewValidity.lastReviewed ? `Last reviewed: ${reviewValidity.lastReviewed}. ` : null}
          {reviewValidity.nextReviewDue ? `Next review due: ${reviewValidity.nextReviewDue}. ` : null}
          {reviewValidity.marketSignalExpiry ? `Market signal expires: ${reviewValidity.marketSignalExpiry}.` : null}
        </p>
      ) : null}
    </section>
  );
}

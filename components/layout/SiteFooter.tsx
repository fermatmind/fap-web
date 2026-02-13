import Link from "next/link";
import { Container } from "@/components/layout/Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="space-y-4 py-8">
        <p className="text-sm text-slate-600">
          Assessments are for self-discovery and education. They are not medical
          diagnoses or treatment advice.
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            Privacy
          </Link>
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            Terms
          </Link>
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} FermatMind. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

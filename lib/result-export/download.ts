/** Check real bytes before requesting a file download. JSON/HTML errors are never PDF. */
export async function downloadResultPdf(blob: Blob, filename = "FermatMind-MBTI-report.pdf"): Promise<void> {
  if (blob.type.toLowerCase().split(";")[0].trim() !== "application/pdf" || blob.size < 5 || await blob.slice(0, 5).text() !== "%PDF-") {
    throw new Error("PDF unavailable");
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

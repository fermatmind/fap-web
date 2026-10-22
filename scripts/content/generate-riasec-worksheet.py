"""Render the public worksheet from the same JSON used by its HTML preview."""
import argparse
import json
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, PageBreak


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--font", required=True, help="Path to a Unicode TTF with Chinese glyphs")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    source = json.loads((root / "lib/marketing/riasecWorksheet.json").read_text())
    output = root / "public/resources/riasec"
    output.mkdir(parents=True, exist_ok=True)
    pdfmetrics.registerFont(TTFont("WorksheetSans", args.font))
    ink = colors.HexColor("#17243A")

    for locale, copy in source.items():
        target = output / f"fermatmind-career-exploration-{locale}.pdf"
        body = ParagraphStyle("body", fontName="WorksheetSans", fontSize=10, leading=16,
                              textColor=ink, wordWrap="CJK" if locale == "zh" else None)
        title = ParagraphStyle("title", parent=body, fontSize=18, leading=25, spaceAfter=12)
        section = ParagraphStyle("section", parent=body, fontSize=12, leading=18, spaceBefore=13, spaceAfter=6)
        small = ParagraphStyle("small", parent=body, fontSize=8, leading=12)
        doc = SimpleDocTemplate(str(target), pagesize=A4, rightMargin=45, leftMargin=45,
                                topMargin=43, bottomMargin=42, title=copy["title"], author="FermatMind")
        story = []
        for index, page in enumerate(copy["pages"]):
            if index:
                story.append(PageBreak())
            heading = escape(copy["title"] if index == 0 else page["title"])
            if locale == "en" and index == 0:
                heading = heading.replace("Interest: ", "Interest:<br/>")
            story.append(Paragraph(heading, title))
            if index == 0:
                story.append(Paragraph(escape(copy["intro"]), small))
                story.append(Spacer(1, 10))
                story.append(Paragraph(escape(page["title"]), section))
            for item in page["sections"]:
                story.append(Paragraph(escape(item["heading"]), section))
                story.append(Paragraph(escape(item["body"]), body))
                story.append(Spacer(1, 8))
                for prompt in item["prompts"]:
                    story.append(Paragraph(escape(prompt), body))
                    story.append(Spacer(1, 4))
            if index == len(copy["pages"]) - 1:
                story.append(Spacer(1, 14))
                for line in copy["sources"]:
                    story.append(Paragraph(escape(line), small))

        def footer(canvas, document):
            canvas.saveState()
            canvas.setFont("WorksheetSans", 8)
            canvas.setFillColor(ink)
            canvas.drawString(45, 23, "FermatMind | fermatmind.com")
            canvas.drawRightString(A4[0] - 45, 23, str(document.page))
            canvas.restoreState()

        doc.build(story, onFirstPage=footer, onLaterPages=footer)
        print(target.relative_to(root))


if __name__ == "__main__":
    main()

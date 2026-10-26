"""Render the four public activity packs from the existing friendship-v1 preview.

Requires reportlab. Pass a static Noto Sans SC Regular TTF via --font.
Font source: google/fonts ofl/notosanssc (SIL OFL, copied with the PDFs).
Example: python printable.py --font /path/NotoSansSC-Regular.ttf
No runtime API or private answer data is used. No font download runs in CI.
"""
import argparse
import hashlib
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[2]
PACK = json.loads((ROOT / 'lib/friendship/preview.json').read_text())
INK = colors.HexColor('#262046')
MUTED = colors.HexColor('#625a70')
ACCENT = colors.HexColor('#6d28d9')


def render(out, locale, size):
    zh = locale == 'zh'
    width, height = size
    margin = 38
    usable = width - 2 * margin
    c = canvas.Canvas(str(out), pagesize=size, invariant=1)
    c.setTitle('朋友默契打印活动包' if zh else 'Printable Friendship Quiz - 24 This or That Questions')
    c.setAuthor('FermatMind Editorial')
    c.setSubject(f"{PACK['version']}; original public prompts; {locale}; four-page host pack")
    font = 'Noto' if zh else 'Helvetica'
    def txt(text, x, y, w=usable, point=10, color=INK, bg=None):
        style = ParagraphStyle('body', fontName=font, fontSize=point, leading=point*1.45,
                               textColor=color, wordWrap='CJK' if zh else None,
                               backColor=bg, spaceAfter=0)
        p = Paragraph(escape(text).replace('\n', '<br/>'), style)
        _, h = p.wrap(w, height)
        if y - h < 42:
            raise ValueError(f'Page overflow: {text[:70]}')
        p.drawOn(c, x, y-h)
        return y-h
    def header(page, title, subtitle):
        c.setFillColor(ACCENT); c.rect(margin, height-35, 25, 3, fill=1, stroke=0)
        txt('费马测试  /  FERMATMIND' if zh else 'FERMATMIND  /  FRIENDSHIP QUIZ', margin, height-43, point=9, color=ACCENT)
        y = txt(title, margin, height-72, point=22)
        y = txt(subtitle, margin, y-10, point=10, color=MUTED)
        c.setStrokeColor(colors.HexColor('#ddd7e6'));c.line(margin,32,width-margin,32)
        c.setFont(font,8);c.setFillColor(MUTED)
        c.drawString(margin,19,f"friendship-v1 | fermatmind.com/{locale}/tests/play/friendship-quiz/questions")
        c.drawRightString(width-margin,19,f'{page} / 4')
        return y-22
    def section(label, body, y):
        y=txt(label,margin,y,point=12,color=ACCENT)
        return txt(body,margin,y-5,point=10)-17
    y=header(1,'朋友默契 · 主持操作卡' if zh else 'How well do you know me?',
             '4页活动包：主持说明 / 24题 / 私人答案卡 / 好友猜测卡' if zh else 'Four pages: host guide / 24 questions / private creator key / friend guess sheet')
    sections = [
      ('01  准备' if zh else '01  Set up', '准备纸笔。每轮打印1份题单、1份答案卡，每位好友1份猜测卡。先玩第1至6题或全部24题。' if zh else 'Bring pens. Print one question list and creator key per round, plus one guess sheet per friend. Start with questions 1-6 or use all 24.'),
      ('02  统一题号' if zh else '02  Agree on the set', '开局前选好相同题号，未用题全部划掉。任何人可提出跳过；该题对全组取消。不要比较不同题组的分数。' if zh else 'Agree on the same numbers before guessing. Cross out unused prompts. Anyone may request a skip; remove that question for everyone. Do not compare different sets.'),
      ('03  保密作答' if zh else '03  Keep the key private', '出题者按自己的当前偏好圈A或B，折起答案卡。开始猜测后不再改答案。好友独立猜出题者的选择，不是选自己的偏好。' if zh else "The creator circles A or B for their current preferences and folds the key. Keep it fixed. Friends independently guess the creator's choices, not their own favorites."),
      ('04  收齐再揭晓' if zh else '04  Collect, then reveal', '收齐所有猜测卡，再一起揭晓。每猜中1题得1分；猜错或空白0分。同一有效题数为分母，同分并列。轮换出题者，新开一轮。' if zh else 'Collect every sheet before revealing. A match earns one point; a miss or blank earns zero. Use the same included total for everyone. Ties share a place. Rotate the creator for a fresh round.'),
      ('计分例子' if zh else 'Worked scoring example', '只用第1至4题：答案A、B、A、B；猜测A、A、B、B。第1和4题猜中，2/4 = 50%。另一人也猜中2题就并列。若开局前取消第3题，所有人分母统一为3。' if zh else 'Use questions 1-4: key A, B, A, B; guesses A, A, B, B. Questions 1 and 4 match: 2/4 = 50%. Another two-point score ties. If question 3 is removed before play, everyone uses a total of three.'),
      ('读给玩家听' if zh else 'Read this to players', '“猜这位朋友会选什么。不想谈的题可以跳过。分数只表示这一轮猜中多少，不评价友情。”揭晓后问：哪个答案最意外？' if zh else '“Guess what this friend would pick. We can skip anything uncomfortable. Your score counts guesses in this round, not the value of a friendship.” After revealing, ask: Which answer surprised you?'),
    ]
    for label,body in sections:y=section(label,body,y)
    txt('线下可自行选题；线上从30题开始，六类等量并逐题揭晓。扫描或输入页脚网址开始在线版。' if zh else 'Offline you choose the set. Online rounds start at 30 balanced questions with immediate reveals. Use the footer URL to make an online quiz.',margin,y,point=9,color=MUTED)
    c.showPage()
    y=header(2,'24道原创二选一题单' if zh else '24 original this-or-that questions',
             '每题猜出题者会选A还是B。号码与第3、4页对应；本页可由全组共用。' if zh else 'For each question, guess what the creator would choose. Numbers match pages 3 and 4. Share this list.')
    gap=22; col=(usable-gap)/2
    for ci,(cat,labels) in enumerate(PACK['categories'].items()):
        x=margin+(ci%2)*(col+gap)
        top=y-(ci//2)*185
        bottom=txt(labels[locale],x,top,col,12,ACCENT)-10
        for i,q in [(i,q) for i,q in enumerate(PACK['questions']) if q['category']==cat]:
            a,b=q[locale]['options']
            bottom=txt(f'{i+1:02d}   A. {a}\n       B. {b}',x,bottom,col,9.5)-6
        if bottom < top-182:raise ValueError('Question column overflow')
    c.showPage()
    for page in [3,4]:
        creator=page==3
        y=header(page,('出题者 · 私人答案卡' if creator else '好友 · 猜测卡') if zh else ('Creator - private answer key' if creator else 'Friend - guess sheet'),
                 ('按自己当前偏好圈A或B。折起保密，猜测开始后不改答。' if creator else '猜出题者的选择。独立完成，揭晓前不看答案卡。') if zh else ('Circle your current choices. Fold and keep private; do not change them once guessing starts.' if creator else "Guess the creator's choices independently. Do not look at the key before the reveal."))
        y=txt('化名：________________    出题者：________________    轮次：________' if zh else 'Nickname: ______________   Creator: ______________   Round: ______',margin,y,point=10)-17
        y=txt('本轮使用题号：________________________  全组统一取消题号：________________' if zh else 'Included numbers: __________________    Removed for everyone: ______________',margin,y,point=10)-22
        row=27
        for col_i in [0,1]:
            x=margin+col_i*(usable/2+5); w=usable/2-10
            c.setFont(font,10);c.setFillColor(ACCENT)
            c.drawString(x,y-12,'题号' if zh else 'No.');c.drawString(x+45,y-12,'圈选' if zh else 'Circle')
            c.drawString(x+140,y-12,('保密' if creator else '揭晓得分') if zh else ('Private' if creator else 'Reveal point'))
            for j in range(12):
                n=col_i*12+j+1;yy=y-30-j*row
                c.setStrokeColor(colors.HexColor('#ddd7e6'));c.line(x,yy-20,x+w,yy-20)
                c.setFont(font,11);c.setFillColor(INK);c.drawString(x,yy-13,f'{n:02d}');c.drawString(x+45,yy-13,'A  /  B')
                c.drawString(x+140,yy-13,('保密' if zh else 'private') if creator else '1  /  0')
        bottom=y-30-12*row-10
        bottom=txt('未用题开局前划掉。所有人用同一答案卡、同一组题号。' if zh else 'Cross out unused questions before play. Everyone uses this key and the same set.',margin,bottom,point=10)-18
        if not creator:
            bottom=txt('猜中数：______ / 有效题数：______ × 100 = ______%（四舍五入）。' if zh else 'Matches: ______ / included total: ______ x 100 = ______% (round to whole %).',margin,bottom,point=11)-18
            bottom=txt('同分共享名次；空白或猜错得0分。不要比较不同题组。' if zh else 'Equal scores tie; a blank or miss earns zero. Do not rank different question sets.',margin,bottom,point=9)-18
        txt('想聊的一题：________  我想问：____________________________________' if zh else 'One surprise: ________   I want to ask: __________________________________',margin,bottom,point=10)
        c.showPage()
    c.save()


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--font',type=Path,required=True);ap.add_argument('--output',type=Path,default=ROOT/'public/resources/friendship');args=ap.parse_args()
    pdfmetrics.registerFont(TTFont('Noto',str(args.font)))
    args.output.mkdir(parents=True,exist_ok=True)
    assert len(PACK['questions'])==24 and PACK['version']=='friendship-v1'
    for locale in ['en','zh']:
        for name,size in [('a4',A4),('letter',letter)]:
            dest=args.output/f'friendship-quiz-{locale}-{name}.pdf';render(dest,locale,size)
            print(dest.name,dest.stat().st_size,hashlib.sha256(dest.read_bytes()).hexdigest())

if __name__=='__main__':main()

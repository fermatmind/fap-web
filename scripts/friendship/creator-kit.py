"""Two-page bilingual creator guide and standalone live cue card.
Render with reportlab and --font /path/to/static/NotoSansSC-Regular.ttf.
Public demonstration data only. Private management access must never enter this pack.
"""
from pathlib import Path
from xml.sax.saxutils import escape
import argparse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4,letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics import renderPDF
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.barcode.qr import QrCodeWidget
ROOT=Path(__file__).resolve().parents[2]
ID='19321012-afb1-43b9-8ccd-22139abc5ca1'

def render(path,lang,size):
    zh=lang=='zh';font='Noto' if zh else 'Helvetica';w,h=size;m=38;usable=w-2*m
    c=canvas.Canvas(str(path),pagesize=size,invariant=1);c.setTitle('朋友默契创作者包与直播操作卡' if zh else 'FermatMind Friendship Quiz Creator Guide and Live Cue Card');c.setAuthor('FermatMind Editorial')
    def text(s,x,y,width=usable,point=10,color='#262046'):
        p=Paragraph(escape(s).replace('\n','<br/>'),ParagraphStyle('p',fontName=font,fontSize=point,leading=point*1.45,wordWrap='CJK' if zh else None,textColor=colors.HexColor(color)));_,ph=p.wrap(width,h)
        if y-ph<43:raise ValueError(f'Overflow: {s[:40]}')
        p.drawOn(c,x,y-ph);return y-ph
    def header(page,title,sub):
        y=text('FERMATMIND  /  CREATOR KIT',m,h-38,point=9,color='#6d28d9');y=text(title,m,y-18,point=22);y=text(sub,m,y-10,point=10,color='#625a70')-24
        c.setStrokeColor(colors.HexColor('#ddd7e6'));c.line(m,32,w-m,32);c.setFont(font,8);c.drawString(m,19,f'fermatmind.com/{lang}/tests/play/friendship-quiz/how-to-play#creators');c.drawRightString(w-m,19,f'{page} / 2');return y
    def section(title,body,y):
        y=text(title,m,y,point=12,color='#6d28d9');return text(body,m,y-6,point=10)-18
    y=header(1,'创作者使用说明' if zh else 'A round worth sharing', '第1页使用说明；第2页可单独打印为直播操作卡。' if zh else 'Page 1: usage guide. Print page 2 on its own as a live-stream cue card.')
    items=[
     ('先创建自己的邀请' if zh else 'Make your own invitation first','主持人在镜头外完成30题，保存私人管理文件。题目与答案生成后冻结。只把公共邀请交给观众；每份挑战90天、最多1000条记录。' if zh else 'Have one host answer 30 questions off camera and save the private management file. Questions and answers then freeze. Give viewers the public invitation only. Each quiz lasts 90 days and holds up to 1,000 entries.'),
     ('录制真实反应' if zh else 'Record real reactions','先取得出镜者同意，用化名，展示已同意公开的结果。官方演示化名不是用户见证；自我预演不计榜。可按三支演示结构录制自己的片段。' if zh else "Ask featured players before filming, use made-up names and show only agreed results. Official Demo players are not testimonials. Creator previews do not enter the board. Use the three supplied clip structures for your own reactions."),
     ('导流要可用' if zh else 'Make the destination usable','Stories上传图片后添加Link贴纸并粘贴公共邀请。Shorts描述与评论的网址不可点击，使用频道个人资料链接。TikTok网站入口取决于账号资格和地区；发布后用手机实际点开核对。' if zh else "For Stories, upload the image and add a Link sticker with the public invite. Shorts description/comment URLs are not clickable; use a channel profile link. TikTok website access depends on account eligibility and location. Test the published destination on a phone."),
     ('使用与署名' if zh else 'Use and credit','可录制和剪辑自己的费马游玩，包括商业化视频；须取得同场出镜同意，保留FermatMind与公共邀请或主工具链接。保留演示标注，不把题库复制成独立产品，也不暗示费马赞助。' if zh else 'You may record and edit your own FermatMind play, including monetized videos, with featured players\' permission. Keep FermatMind and a public invite or tool link visible. Retain demo labels; this does not license a standalone copy of the question bank or imply sponsorship.'),
    ]
    for title,body in items:y=section(title,body,y)
    q=QrCodeWidget(f'https://fermatmind.com/{lang}/share/friendship/{ID}');b=q.getBounds();k=115/(b[2]-b[0]);drawing=Drawing(115,115,transform=[k,0,0,k,0,0]);drawing.add(q);renderPDF.draw(drawing,c,w-m-115,y-115)
    text('试玩演示挑战' if zh else 'Play the demonstration quiz',m,y,usable-145,12,'#6d28d9')
    text('演示化名，不是用户见证。到期：2027年1月24日13:19 UTC；也可能提前关闭或满员。正式活动另建邀请。' if zh else 'Demonstration names, not testimonials. Expires 24 Jan 2027 at 13:19 UTC; it can close or fill earlier. Create a separate invitation for your event.',m,y-26,usable-145,9)
    c.linkURL(f'https://fermatmind.com/{lang}/share/friendship/{ID}',(w-m-115,y-115,w-m,y),relative=0)
    c.showPage()
    y=header(2,'直播操作卡 · 一人出题，大家来猜' if zh else 'Live cue card - one host, many guesses','无需安装；30题；即时揭晓；同分并列。私人管理界面始终留在镜头外。' if zh else 'Browser play. 30 questions. Immediate feedback. Equal scores tie. Keep all management access off camera.')
    steps=[
      ('开播前' if zh else 'BEFORE LIVE','镜头外创建自己的30题邀请，保存管理文件，用另一浏览器测试公共入口。确定谁出题、拍摄同意、化名与结束方式。' if zh else 'Create your own 30-question invitation off camera, save management access and test the public link in another browser. Agree on the host, filming permission, nicknames and wrap-up.'),
      ('开场原话' if zh else 'OPEN - SAY THIS','“猜我会怎么选，不是选你自己的偏好。分数只表示这轮猜中多少，不评价友情。”展示公共邀请二维码，让观众独立作答。' if zh else '“Guess what I would choose, not your own preference. This score counts matches in one round, not the value of a friendship.” Show the public invite QR and let people answer independently.'),
      ('参与阶段' if zh else 'WHILE PEOPLE PLAY','暂不播出答案与逐题对照。每位观众作答后立即揭晓；提前在节目中展示会提示后来者。本游戏无同步倒计时或延迟揭晓模式。' if zh else 'Keep answers and full comparisons off stream. Each player sees immediate feedback; broadcasting it gives later viewers clues. There is no synchronized timer or delayed-reveal mode.'),
      ('揭晓与榜单' if zh else 'REVEAL & BOARD','参与者完成后才展示已同意公开的结果。同分共享名次；每浏览器保留首次完成记录，换设备无法可靠识别。不同题组不混排。' if zh else 'After the group finishes, show agreed results. Ties share a rank; the first completed record is kept per browser, and another device cannot be reliably identified. Do not mix different question sets.'),
      ('聊天提示' if zh else 'TALK - THREE SURPRISES','“这题是你最近变了，还是我一直没注意？”玩家不想讨论的内容直接略过。猜错或低分不代表不在乎。' if zh else '“Is this a recent change, or something I had not noticed?” Leave uncomfortable topics out. A miss or low score does not prove someone does not care.'),
      ('再创建与收尾' if zh else 'RECREATE & CLOSE','“继续挑战我的邀请，或者创建一份关于你的题，让朋友猜。”回顾结束后再决定是否关闭，关闭也会阻止读取结果。镜头外隐藏不当昵称。' if zh else '“Play my invitation, or make a quiz about you for your friends to guess.” Decide whether to close after the recap; closing also blocks result access. Moderate inappropriate names off camera.'),
    ]
    for title,body in steps:y=section(title,body,y)
    text('活动前填写：公共邀请 __________________  出题者 ________  收尾时间 ________' if zh else 'Before the event: public invite ______________  Host ________  Wrap-up ________',m,y,point=9)
    c.showPage();c.save()

def main():
    p=argparse.ArgumentParser();p.add_argument('--font',type=Path,required=True);a=p.parse_args();pdfmetrics.registerFont(TTFont('Noto',str(a.font)))
    for lang in ['en','zh']:
      for name,size in [('a4',A4),('letter',letter)]:
        path=ROOT/f'public/resources/friendship/friendship-creator-kit-{lang}-{name}.pdf';render(path,lang,size);print(path.name,path.stat().st_size)
if __name__=='__main__':main()

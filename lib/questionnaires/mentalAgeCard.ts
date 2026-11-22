import type { Locale } from "@/lib/i18n/locales";

export const mentalAgeCardDimensions = { landscape: [1200, 630], portrait: [1080, 1920] } as const;
export type MentalAgeCardFormat = keyof typeof mentalAgeCardDimensions;

type MentalAgeCardOptions = {
  age: number;
  sum: number;
  locale: Locale;
  actualAge: number | null;
  year: number;
  styleTitle: string;
  traditional: boolean;
  displayText: (text: string) => string;
  format: MentalAgeCardFormat;
};

export function drawMentalAgeCard(canvas: HTMLCanvasElement, {
  age, sum, locale, actualAge, year, styleTitle, traditional, displayText, format,
}: MentalAgeCardOptions) {
  const [w, h] = mentalAgeCardDimensions[format];
  canvas.lang = traditional ? "zh-TW" : locale === "zh" ? "zh-CN" : "en";
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const zh = locale === "zh", tall = format === "portrait", pad = 72, top = tall ? 220 : 58;
  const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"#102d32");g.addColorStop(1,"#214e48");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  const line=(value:string,y:number,size:number,color="#ffffff",weight=500)=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px system-ui, sans-serif`;ctx.fillText(value,pad,y,w-pad*2);};
  line(zh?displayText("费马测试 · 经典趣味版"):"FERMATMIND · CLASSIC QUIZ",top,26,"#a7f3d0",600);
  line(zh?displayText("我的娱乐心理年龄"):"My playful mental age",top+70,44,"#ffffff",600);
  line(String(age),top+(tall?320:244),tall?190:148,"#ffffff",700);
  line(`${zh?displayText("本次风格"):"Quiz style"}: ${styleTitle}`,top+(tall?400:300),32,"#d1fae5");
  const barY=tall?900:400,bw=w-pad*2;ctx.fillStyle="#52706b";ctx.fillRect(pad,barY,bw,8);ctx.fillStyle="#a7f3d0";ctx.fillRect(pad,barY,bw*sum/60,8);ctx.beginPath();ctx.arc(pad+bw*sum/60,barY+4,10,0,Math.PI*2);ctx.fill();
  line("10",barY+42,23,"#a7f3d0");ctx.textAlign="right";ctx.fillText("70",w-pad,barY+42);ctx.textAlign="left";
  const detailY=tall?1080:490;line(zh?displayText(`娱乐年龄对应年份：${year-age}（以${year}年为基准）`):`Playful equivalent year: ${year-age} (reference year ${year})`,detailY,25,"#d1fae5");
  if(actualAge!==null){const gap=age-actualAge;line(zh?displayText(`实际年龄 ${actualAge} · 游戏数字差 ${gap>0?"+":""}${gap}`):`Actual age ${actualAge} · Game-number gap ${gap>0?"+":""}${gap}`,detailY+(tall?70:38),25,"#d1fae5");}
  if(tall){line(zh?displayText("30道原创偏好题 · 七种娱乐风格"):"30 original preferences · Seven playful styles",1300,29,"#d1fae5");line(zh?displayText("你的结果呢？"):"What about yours?",1370,36,"#ffffff",600);}
  const footer=tall?1590:572;line(zh?displayText("仅供娱乐，不是智力、成熟度或年龄评估"):"For fun. Not an IQ, maturity or age assessment.",footer,24);line(`fermatmind.com/${traditional && zh ? "zh-TW" : locale}/tests/explore/mental-age`,footer+36,23,"#a7f3d0");
 }

"use client";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { drawMentalAgeCard, mentalAgeCardDimensions as dimensions, type MentalAgeCardFormat as Format } from "@/lib/questionnaires/mentalAgeCard";
export function MentalAgeShareCard({age,sum,locale,actualAge=null,year=new Date().getUTCFullYear(),styleTitle=""}:{age:number;sum:number;locale:Locale;actualAge?:number|null;year?:number;styleTitle?:string}) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
 const zh=locale==="zh",[format,setFormat]=useState<Format>("landscape"),[includeAge,setIncludeAge]=useState(false),[preview,setPreview]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 const objectUrl=useRef(""),file=useRef<File|null>(null);
 useEffect(()=>()=>{if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);},[]);
 function invalidate(){if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);objectUrl.current="";file.current=null;setPreview("");setMessage("");}
 async function generate(){if(busy)return;setBusy(true);setMessage("");try{
  await document.fonts.ready;const canvas=document.createElement("canvas");
  drawMentalAgeCard(canvas,{age,sum,locale,actualAge:includeAge?actualAge:null,year,styleTitle,traditional,displayText,format});
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("PNG unavailable")),"image/png"));invalidate();const url=URL.createObjectURL(blob);objectUrl.current=url;file.current=new File([blob],`fermatmind-mental-age-${locale}-${format}.png`,{type:"image/png"});setPreview(url);setMessage(zh?displayText("预览已生成。确认内容后再保存或分享。"):"Preview ready. Check its contents before saving or sharing.");
 }catch{setMessage(zh?displayText("图片暂时无法生成，请重试；也可以截图或复制公开入口。"):"Could not create the image. Try again, take a screenshot or copy the public entry.");}finally{setBusy(false);}}
 function save(){if(!file.current||!preview)return;const a=document.createElement("a");a.href=preview;a.download=file.current.name;a.click();setMessage(zh?displayText("若未下载，请长按预览图片保存。"):"If the download did not start, save the preview image.");}
 async function share(){const image=file.current;if(!image)return;try{if(!navigator.canShare?.({files:[image]})||!navigator.share)throw Error("Unsupported");await navigator.share({files:[image]});setMessage(zh?displayText("分享已完成。"):"Shared.");}catch(error){setMessage(error instanceof Error&&error.name==="AbortError"?(zh?displayText("已取消分享，仍可保存预览。"):"Sharing canceled. You can still save the preview."):(zh?displayText("此浏览器无法直接分享图片，请保存预览。"):"Image sharing is unavailable here. Save the preview."));}}
 return <section aria-label={zh?displayText("预览和分享卡片"):"Preview and share card"} data-mental-age-sharing className="space-y-4 rounded-xl border bg-white p-5 sm:p-6">
  <h3 className="text-xl font-semibold">{zh?displayText("先预览，再保存或分享"):"Preview before saving or sharing"}</h3><p className="text-sm leading-7 text-slate-600">{zh?displayText("卡片在本浏览器生成，不含答案或附加资料。实际年龄与差值默认不加入；只有主动勾选后才出现在预览和所选图片中。"):"Cards are created in your browser, without answers or optional information. Actual age and the gap are excluded unless you explicitly select them for the preview and image."}</p>
  <label className="flex flex-wrap items-center gap-3">{zh?displayText("图片尺寸"):"Image size"}<select className="min-h-11 rounded border p-2" disabled={busy} value={format} onChange={e=>{setFormat(e.target.value as Format);invalidate();}}><option value="landscape">{zh?displayText("横版"):"Landscape"} · 1200 × 630</option><option value="portrait">{zh?displayText("竖版"):"Portrait"} · 1080 × 1920</option></select></label>
  {actualAge!==null&&<label className="flex min-h-11 items-center gap-3"><input type="checkbox" className="size-5" checked={includeAge} disabled={busy} onChange={e=>{setIncludeAge(e.target.checked);invalidate();}}/>{zh?displayText("在图片中加入实际年龄与差值"):"Include actual age and gap in the image"}</label>}
  <button className="min-h-11 rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white disabled:opacity-50" disabled={busy} onClick={()=>void generate()}>{busy?(zh?displayText("正在生成…"):"Creating…"):(zh?displayText("预览分享卡"):"Preview share card")}</button>
  {preview&&<><Image unoptimized width={dimensions[format][0]} height={dimensions[format][1]} className="h-auto max-h-[42rem] max-w-full rounded-lg" src={preview} alt={zh?displayText(`娱乐年龄${age}岁，${styleTitle}。${includeAge?`包含实际年龄${actualAge}。`:"不含实际年龄。"}`):`Playful age ${age}, ${styleTitle}. ${includeAge?`Includes actual age ${actualAge}.`:"Excludes actual age."}`}/><div className="flex flex-wrap gap-3"><button className="min-h-11 rounded-lg border px-5 py-3 font-semibold" onClick={save}>{zh?displayText("保存年龄分享卡"):"Save age card"}</button><button className="min-h-11 rounded-lg border px-5 py-3 font-semibold" onClick={()=>void share()}>{zh?displayText("分享年龄图片"):"Share age image"}</button><a href={preview} download={file.current?.name} className="inline-flex min-h-11 items-center underline">{zh?displayText("下载预览图片"):"Download preview image"}</a></div></>}
  {message&&<p role="status" className="text-sm leading-7">{message}</p>}
 </section>;
}

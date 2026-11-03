import {renderToStaticMarkup} from "react-dom/server";
import {describe,expect,it} from "vitest";
import {ThriftShelfPanel} from "@/components/entertainment/ThriftShelfPanel";
describe("original secondhand-shelf illustration",()=>{
 it.each(["en","zh"] as const)("provides the three fictional props and equivalent %s description without a transaction",locale=>{
  const dom=document.createElement("div");dom.innerHTML=renderToStaticMarkup(<ThriftShelfPanel locale={locale}/>);
  const image=dom.querySelector('svg')!;expect(image.getAttribute('role')).toBe('img');const label=image.getAttribute('aria-label')!;
  expect(dom.querySelector('figcaption')?.textContent).toContain(label);
  for(const word of locale==='zh'?['盒','框','笔记本','不提供价格']:['box','frame','notebook','no price'])expect(label).toContain(word);
  expect(dom.querySelectorAll('input,button,a,img,script,animate')).toHaveLength(0);
 });
});

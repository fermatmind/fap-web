import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { CreatorToolkit } from "@/components/friendship/CreatorToolkit";
import { PublicResource } from "@/components/friendship/PublicContent";
afterEach(cleanup);
describe("friendship creator handoffs and actual media", () => {
  it.each(["en", "zh"] as const)("ships usable %s media, caption tracks, creator PDFs and a public-only demonstration", locale => {
    const { container } = render(<CreatorToolkit locale={locale} />);
    expect(container.querySelectorAll('video')).toHaveLength(3);
    for (const v of container.querySelectorAll('video')) {
      expect(v).toHaveAttribute('controls'); expect(v).toHaveAttribute('preload', 'none');expect(v).not.toHaveAttribute('autoplay');
      const src = v.querySelector('source')!.getAttribute('src')!;
      expect(readFileSync(`public${src}`).subarray(4,8).toString()).toBe('ftyp');
      expect(readFileSync(`public${v.getAttribute('poster')!}`).byteLength).toBeGreaterThan(1000);
      const track = v.querySelector('track')!;expect(track).toHaveAttribute('kind','captions');
      expect(readFileSync(`public${track.getAttribute('src')!}`, 'utf8')).toMatch(/^WEBVTT\n/);
    }
    for (const a of container.querySelectorAll('a[download]')) {
      const src=a.getAttribute('href')!;expect(readFileSync(`public${src}`).byteLength).toBeGreaterThan(100);
    }
    const invites=Array.from(container.querySelectorAll('a[href*="/share/friendship/"]'),a=>a.getAttribute('href')!);
    expect(invites).toEqual([`/${locale}/share/friendship/19321012-afb1-43b9-8ccd-22139abc5ca1`]);
    expect(invites.every(url=>!/[?#]|\/manage/.test(url))).toBe(true);
  });
  it("keeps English creator claims aligned to the actual product and platform boundaries", () => {
    const { container } = render(<CreatorToolkit locale="en" />);const text=container.textContent!;
    for(const part of ['made-up player names rather than customer testimonials','24 January 2027','1,000 entries','not recorded on the friendboard','no synchronized timer or delayed-reveal live mode','first completed record','not clickable','Registered Business Account','does not license copying the question bank'])expect(text).toContain(part);
    expect(text).not.toMatch(/[\u4e00-\u9fff]|guaranteed views|unlimited players/);
  });
  it("puts the kit on the existing how-to identity and keeps questions and scores focused", () => {
    const { container, unmount }=render(<PublicResource locale="en" kind="how-to-play"/>);
    expect(container.querySelector('a[href="#creators"]')).not.toBeNull();expect(container.querySelectorAll('#creators')).toHaveLength(1);unmount();
    for(const kind of ['questions','scores'] as const){const p=render(<PublicResource locale="en" kind={kind}/>);expect(p.container.querySelector('#creators')).toBeNull();p.unmount();}
  });
});

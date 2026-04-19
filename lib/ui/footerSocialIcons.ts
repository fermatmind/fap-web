import * as simpleIcons from "simple-icons";
import type { SimpleIcon } from "simple-icons";
import { backendStaticMediaUrl } from "@/lib/cms/media";

type FooterIcon = Pick<SimpleIcon, "title" | "slug" | "path">;

export type FooterSocialItem = {
  key: string;
  kind?: "link" | "qr";
  href?: string;
  qrImageSrc?: string;
  qrFallbackSrc?: string;
  icon: FooterIcon;
  labels: {
    zh: string;
    en: string;
  };
};

function requireSimpleIcon(exportName: string): FooterIcon {
  const icon = (simpleIcons as Record<string, SimpleIcon | undefined>)[exportName];
  if (icon) {
    return { title: icon.title, slug: icon.slug, path: icon.path };
  }
  throw new Error(`Missing simple-icons export: ${exportName}`);
}

export const FOOTER_SOCIAL_ITEMS: FooterSocialItem[] = [
  {
    key: "fb",
    href: "https://www.facebook.com/share/187MVbQteV/?mibextid=wwXIfr",
    icon: requireSimpleIcon("siFacebook"),
    labels: { zh: "Facebook", en: "Facebook" },
  },
  {
    key: "x",
    href: "https://x.com/fermatmind?s=21",
    icon: requireSimpleIcon("siX"),
    labels: { zh: "X", en: "X" },
  },
  {
    key: "yt",
    href: "https://youtube.com/@fermatmind?si=ey5H_jcts0qcvgha",
    icon: requireSimpleIcon("siYoutube"),
    labels: { zh: "YouTube", en: "YouTube" },
  },
  {
    key: "ig",
    href: "https://www.instagram.com/fermatmind?igsh=MWZkYmMzbDUwMG5lbA%3D%3D&utm_source=qr",
    icon: requireSimpleIcon("siInstagram"),
    labels: { zh: "Instagram", en: "Instagram" },
  },
  {
    key: "reddit",
    href: "https://www.reddit.com/u/Fermatmind/s/Crmp7aBDwl",
    icon: requireSimpleIcon("siReddit"),
    labels: { zh: "Reddit", en: "Reddit" },
  },
  {
    key: "wx",
    kind: "qr",
    qrImageSrc: backendStaticMediaUrl("/static/social/wechat-qr-official-258.jpg"),
    qrFallbackSrc: backendStaticMediaUrl("/static/social/wechat-qr.jpg"),
    icon: requireSimpleIcon("siWechat"),
    labels: { zh: "微信", en: "WeChat" },
  },
  {
    key: "weibo",
    href: "https://weibo.com/u/8337437164",
    icon: requireSimpleIcon("siSinaweibo"),
    labels: { zh: "微博", en: "Weibo" },
  },
  {
    key: "xhs",
    href: "https://xhslink.com/m/2U3LsFiOnJp",
    icon: requireSimpleIcon("siXiaohongshu"),
    labels: { zh: "小红书", en: "Xiaohongshu" },
  },
  {
    key: "b",
    href: "https://space.bilibili.com/3690991607351687?spm_id_from=333.1007.0.0",
    icon: requireSimpleIcon("siBilibili"),
    labels: { zh: "B站", en: "Bilibili" },
  },
  {
    key: "dy",
    href: "https://www.douyin.com/user/self?from_tab_name=main&modal_id=7592567325989074811&showTab=post",
    icon: requireSimpleIcon("siTiktok"),
    labels: { zh: "抖音", en: "Douyin" },
  },
  {
    key: "tt",
    href: "https://www.tiktok.com/@fermatmind?_r=1&_t=ZS-94ywEJb7ofZ",
    icon: requireSimpleIcon("siTiktok"),
    labels: { zh: "TikTok", en: "TikTok" },
  },
];

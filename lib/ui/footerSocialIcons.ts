import * as simpleIcons from "simple-icons";
import type { SimpleIcon } from "simple-icons";

type FooterIcon = Pick<SimpleIcon, "title" | "slug" | "path">;

export type FooterSocialItem = {
  key: string;
  href: string;
  icon: FooterIcon;
  labels: {
    zh: string;
    en: string;
  };
};

const LINKEDIN_FALLBACK_ICON: FooterIcon = {
  title: "LinkedIn",
  slug: "linkedin",
  path: "M20.447 20.452h-3.554V14.86c0-1.333-.027-3.05-1.86-3.05-1.863 0-2.148 1.455-2.148 2.955v5.687H9.332V9h3.413v1.561h.05c.476-.9 1.636-1.85 3.367-1.85 3.6 0 4.265 2.37 4.265 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 .001-4.124 2.062 2.062 0 0 1-.001 4.124zM7.119 20.452H3.554V9h3.565v11.452z",
};

const DOUYIN_FALLBACK_ICON: FooterIcon = {
  title: "Douyin",
  slug: "douyin",
  path: "M13.6 4.5v7.6a3.55 3.55 0 1 1-2.3-3.3V5.9l6.3-1.25V7l-3.99.8v4.3a3.55 3.55 0 1 1-2.3-3.3v-.02l2.3-.46V4.5h2.3Z",
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
    href: "#",
    icon: requireSimpleIcon("siFacebook"),
    labels: { zh: "Facebook", en: "Facebook" },
  },
  {
    key: "x",
    href: "#",
    icon: requireSimpleIcon("siX"),
    labels: { zh: "X", en: "X" },
  },
  {
    key: "yt",
    href: "#",
    icon: requireSimpleIcon("siYoutube"),
    labels: { zh: "YouTube", en: "YouTube" },
  },
  {
    key: "ig",
    href: "#",
    icon: requireSimpleIcon("siInstagram"),
    labels: { zh: "Instagram", en: "Instagram" },
  },
  {
    key: "in",
    href: "#",
    icon: LINKEDIN_FALLBACK_ICON,
    labels: { zh: "LinkedIn", en: "LinkedIn" },
  },
  {
    key: "wx",
    href: "#",
    icon: requireSimpleIcon("siWechat"),
    labels: { zh: "微信公众号", en: "WeChat Official Account" },
  },
  {
    key: "xhs",
    href: "#",
    icon: requireSimpleIcon("siXiaohongshu"),
    labels: { zh: "小红书", en: "Xiaohongshu" },
  },
  {
    key: "b",
    href: "#",
    icon: requireSimpleIcon("siBilibili"),
    labels: { zh: "B站", en: "Bilibili" },
  },
  {
    key: "dy",
    href: "#",
    icon: DOUYIN_FALLBACK_ICON,
    labels: { zh: "抖音", en: "Douyin" },
  },
  {
    key: "tt",
    href: "#",
    icon: requireSimpleIcon("siTiktok"),
    labels: { zh: "TikTok", en: "TikTok" },
  },
];

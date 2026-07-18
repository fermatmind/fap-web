import {
  siBilibili,
  siFacebook,
  siInstagram,
  siReddit,
  siSinaweibo,
  siTiktok,
  siWechat,
  siX,
  siXiaohongshu,
  siYoutube,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";
import { backendStaticMediaUrl } from "@/lib/cms/media";
import { appendGovernedUtmParamsToHref } from "@/lib/tracking/utmGovernance";

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

const footerIcon = ({ title, slug, path }: SimpleIcon): FooterIcon => ({ title, slug, path });

export const FOOTER_SOCIAL_ITEMS: FooterSocialItem[] = [
  {
    key: "fb",
    href: appendGovernedUtmParamsToHref("https://www.facebook.com/share/187MVbQteV/?mibextid=wwXIfr", "facebook_social"),
    icon: footerIcon(siFacebook),
    labels: { zh: "Facebook", en: "Facebook" },
  },
  {
    key: "x",
    href: appendGovernedUtmParamsToHref("https://x.com/fermatmind?s=21", "x_social"),
    icon: footerIcon(siX),
    labels: { zh: "X", en: "X" },
  },
  {
    key: "yt",
    href: appendGovernedUtmParamsToHref("https://youtube.com/@fermatmind?si=ey5H_jcts0qcvgha", "youtube_video"),
    icon: footerIcon(siYoutube),
    labels: { zh: "YouTube", en: "YouTube" },
  },
  {
    key: "ig",
    href: appendGovernedUtmParamsToHref(
      "https://www.instagram.com/fermatmind?igsh=MWZkYmMzbDUwMG5lbA%3D%3D&utm_source=qr",
      "instagram_social"
    ),
    icon: footerIcon(siInstagram),
    labels: { zh: "Instagram", en: "Instagram" },
  },
  {
    key: "reddit",
    href: appendGovernedUtmParamsToHref("https://www.reddit.com/u/Fermatmind/s/Crmp7aBDwl", "reddit_social"),
    icon: footerIcon(siReddit),
    labels: { zh: "Reddit", en: "Reddit" },
  },
  {
    key: "wx",
    kind: "qr",
    qrImageSrc: backendStaticMediaUrl("/static/social/wechat-qr-official-258.jpg"),
    qrFallbackSrc: backendStaticMediaUrl("/static/social/wechat-qr.jpg"),
    icon: footerIcon(siWechat),
    labels: { zh: "微信", en: "WeChat" },
  },
  {
    key: "weibo",
    href: appendGovernedUtmParamsToHref("https://weibo.com/u/8337437164", "weibo_social"),
    icon: footerIcon(siSinaweibo),
    labels: { zh: "微博", en: "Weibo" },
  },
  {
    key: "xhs",
    href: appendGovernedUtmParamsToHref("https://xhslink.com/m/2U3LsFiOnJp", "xiaohongshu_social"),
    icon: footerIcon(siXiaohongshu),
    labels: { zh: "小红书", en: "Xiaohongshu" },
  },
  {
    key: "b",
    href: appendGovernedUtmParamsToHref(
      "https://space.bilibili.com/3690991607351687?spm_id_from=333.1007.0.0",
      "bilibili_video"
    ),
    icon: footerIcon(siBilibili),
    labels: { zh: "B站", en: "Bilibili" },
  },
  {
    key: "dy",
    href: appendGovernedUtmParamsToHref(
      "https://www.douyin.com/user/self?from_tab_name=main&modal_id=7592567325989074811&showTab=post",
      "douyin_social"
    ),
    icon: footerIcon(siTiktok),
    labels: { zh: "抖音", en: "Douyin" },
  },
  {
    key: "tt",
    href: appendGovernedUtmParamsToHref("https://www.tiktok.com/@fermatmind?_r=1&_t=ZS-94ywEJb7ofZ", "tiktok_social"),
    icon: footerIcon(siTiktok),
    labels: { zh: "TikTok", en: "TikTok" },
  },
];

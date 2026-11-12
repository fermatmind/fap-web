import localFont from "next/font/local";

const fmSans = localFont({
  src: [{ path: "../../public/fonts/manrope/Manrope-Variable.woff2", weight: "200 800", style: "normal" }],
  variable: "--font-fm-sans",
  display: "swap",
  fallback: ["Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
});

const fmSerif = localFont({
  src: [{ path: "../../public/fonts/fraunces/Fraunces-Variable.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-fm-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const fmMono = localFont({
  src: [
    {
      path: "../../public/fonts/jetbrains-mono/JetBrainsMono-Variable.woff2",
      weight: "100 800",
      style: "normal",
    },
  ],
  variable: "--font-fm-mono",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const siteFontClassName = `${fmSans.variable} ${fmSerif.variable} ${fmMono.variable} antialiased`;

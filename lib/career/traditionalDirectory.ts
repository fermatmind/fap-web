import { cache } from "react";

export const loadTraditionalDirectoryLanguage = cache(async () => {
  const [traditional, simplified] = await Promise.all([import("opencc-js/cn2t"), import("opencc-js/t2cn")]);
  const display = traditional.Converter({ from: "cn", to: "twp" });
  const search = simplified.Converter({ from: "twp", to: "cn" });
  return {
    display: (source: string) => display(source).replaceAll("搜尋職業、英文名", "搜尋職業或英文名稱"),
    search,
  };
});

export function traditionalPortraitCopy(convert?: (text: string) => string) {
  if (!convert) return (text: string) => text;
  return (text: string) => convert(text)
    .replaceAll("《死神》", "《BLEACH 死神》")
    .replaceAll("測試", "測驗")
    .replaceAll("新標籤頁", "新分頁")
    .replaceAll("小樣", "小型試作")
    .replaceAll("原創人物意象插畫", "原創人物意象插圖");
}

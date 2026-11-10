import type { CareerInterestPilot } from "./explorationPilot";

export const CAREER_INTEREST_TAIWAN_COPY = {
  ari: {
    title: "霍蘭德 ARI 代碼與職涯探索：從工業設計開始",
    summary: "ARI 依序代表藝術型、實作型、研究型。你可以用同一項任務觀察三個環節：構思不同方案、做出可試用的模型，再查證哪一種方案更合用。",
    evidence: "在 O*NET 31.0 的美國職業興趣表中，商業與工業設計師是代碼完全相符的 ARI 範例。平面設計師的官方代碼是 AC，這裡用它來對照實體產品設計與視覺版面設計的工作差異。",
    exercise: "為一個可重複使用的水杯畫兩種杯蓋。設定兩個條件，例如能單手打開、容易清洗。標出你打算怎麼測試握法，再寫下一個必須透過模型或使用者回饋才能確認的問題。",
  },
  ac: {
    title: "霍蘭德 AC 代碼與職涯探索：平面設計與影視剪輯",
    summary: "AC 依序代表藝術型、事務型。先看你是否喜歡創作，再觀察自己是否也願意整理素材、核對交付要求和處理修訂。",
    evidence: "在 O*NET 31.0 的美國職業興趣表中，平面設計師和影視剪輯師的官方高點代碼都是兩個字母的 AC。費馬的職業檔案可用來查閱工作任務，其中的 O*NET 對照目前是目錄候選。",
    exercise: "把同一份清洗說明分別做成一頁海報草圖，以及一段 15 秒影片的三鏡頭分鏡。請一個人複述步驟，再記下你比較想反覆調整版面，還是整理鏡頭、節奏與聲音。",
  },
} satisfies Record<CareerInterestPilot, { title: string; summary: string; evidence: string; exercise: string }>;

export const CAREER_INTEREST_TAIWAN_JOBS = {
  "industrial-designers": { name: "工業設計師", task: "畫產品草圖，用可操作的模型修改設計，再核對安全、成本與製造條件。" },
  "graphic-designers": { name: "平面設計師", task: "編排文字和圖片，依照回饋修改版面，再準備可交付的印刷或數位檔案。" },
  "film-and-video-editors": { name: "影視剪輯師", task: "挑選並排列素材，讓鏡頭順序符合腳本或製作需求，並檢查畫面和聲音是否同步。" },
} as const;

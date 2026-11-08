import type { SiteDictionary } from "@/lib/i18n/types";

// Taiwan reader copy; display language does not select form, report or market.
const traditional: SiteDictionary = {
  "articles": {
    "allArticles": "全部文章",
    "backToArticles": "返回費馬部落格",
    "categories": "部落格分類",
    "configurationError": "編輯精選和分類暫時無法載入。",
    "configurationPending": "編輯精選和分類尚未配置。",
    "empty": "暫無已發布文章",
    "featured": "編輯精選",
    "groupedByTestTitle": "按測評分組",
    "kicker": "洞察文章",
    "latest": "最新文章",
    "nextPage": "下一頁",
    "onThisPage": "本文目錄",
    "pagination": "文章分頁",
    "previousPage": "上一頁",
    "readArticle": "閱讀全文",
    "retry": "重試",
    "stale": "最新內容暫時無法載入，目前顯示此前可用的文章。",
    "subtitle": "按測評主題整理的工具說明、成長引導與敘事畫像。",
    "title": "費馬部落格",
    "unavailable": "文章暫時無法載入，請稍後重試。",
    "updatedLabel": "更新於",
    "voiceLabels": {
      "growth": "成長引導版",
      "narrative": "敘事畫像版",
      "tool": "工具說明版"
    }
  },
  "card": {
    "a11yVisualDescriptions": {
      "bars_ocean": "代表 OCEAN 五維高低起伏的柱狀圖。",
      "grid_nine": "代表九型結構關係的九宮格矩陣。",
      "ring_four": "代表四象限行為維度模式的環形圖。",
      "spark_minimal": "代表結構化測評分析的極簡資料火花圖。",
      "wave_clinical": "表達多維臨床趨勢變化的波形圖。"
    },
    "a11yVisualFallback": "結構化測評視覺圖形。",
    "compactLabel": "精簡視覺"
  },
  "commerce": {
    "guarantee": "100% 滿意保障",
    "price": "價格",
    "privacy_first": "隱私優先",
    "processing": "處理中...",
    "secure_payment": "安全支付",
    "trust_badges": [
      "SSL 安全支付",
      "資料雜湊脫敏",
      "科學演算法引擎"
    ],
    "unlock_button": "立即解鎖",
    "unlock_subtitle": "一次性解鎖更深入的解讀與行動建議。",
    "unlock_title": "解鎖完整報告"
  },
  "common": {
    "details": "詳情",
    "minutes_unit": "分鐘",
    "questions_unit": "題",
    "start": "開始"
  },
  "cookie": {
    "accept": "接受",
    "decline": "拒絕",
    "message": "我們使用 Cookie 和分析工具來提升服務品質。你可以接受或拒絕分析追蹤。"
  },
  "email": {
    "preferences": {
      "ctas": {
        "help": "檢視說明中心",
        "orderLookup": "去訂單找回頁"
      },
      "description": "選擇你想繼續接收的 FermatMind 郵件類型。",
      "emailLabel": "目前電子信箱",
      "fields": {
        "marketing_updates": {
          "description": "接收 FermatMind 的產品與行銷更新，不影響報告恢復郵件。",
          "title": "行銷更新"
        },
        "product_updates": {
          "description": "接收功能更新和產品改進通知，這類資訊不同於行銷更新。",
          "title": "產品更新"
        },
        "report_recovery": {
          "description": "接收用於恢復報告、補發連結和交付相關的郵件。",
          "title": "報告找回"
        }
      },
      "invalidDescription": "如需新的報告郵件，請前往訂單找回；也可以去說明中心檢視說明。",
      "invalidTitle": "此連結無效或已過期。",
      "loading": "正在載入郵件偏好...",
      "metadataDescription": "透過郵件中的專屬連結檢視或更新你的 FermatMind 郵件偏好。",
      "metadataTitle": "管理郵件偏好",
      "missingDescription": "請從郵件中的專屬連結進入此頁面，檢視或更新你的郵件偏好。",
      "missingRecoveryHint": "如果你需要新的報告郵件，請前往訂單找回。",
      "save": "儲存偏好",
      "saveError": "暫時無法儲存郵件偏好，請稍後再試。",
      "saving": "儲存中...",
      "statusDescription": "這裡會明確顯示行銷更新、報告恢復和產品更新 3 個開關的目前狀態。",
      "statusDisabled": "未開啟",
      "statusEnabled": "已開啟",
      "statusTitle": "目前訂閱基礎狀態",
      "successMessage": "訂閱偏好已儲存。下方會明確顯示行銷更新、報告恢復郵件和產品更新的最新狀態。",
      "title": "管理郵件偏好",
      "unsubscribeCta": "退訂全部郵件"
    },
    "unsubscribe": {
      "backToPreferences": "返回偏好設定",
      "confirm": "確認退訂",
      "confirmDescription": "這是對目前訂閱基礎的全域退訂操作。",
      "confirmEffects": [
        "行銷更新將停止傳送。",
        "報告恢復與交付相關郵件也會停止傳送。",
        "之後仍可回到偏好頁重新調整這些設定。"
      ],
      "confirmTitle": "確認退訂",
      "confirming": "退訂中...",
      "ctas": {
        "help": "檢視說明中心",
        "orderLookup": "去訂單找回頁",
        "preferences": "管理郵件偏好"
      },
      "description": "請從郵件中的退訂連結進入繼續操作。",
      "invalidDescription": "這個退訂連結無效或已過期。你可以從有效郵件連結進入偏好頁，去訂單找回頁繼續恢復報告，或檢視說明中心瞭解下一步。",
      "invalidTitle": "此連結無效或已過期。",
      "metadataDescription": "透過郵件中的退訂連結停止接收相關的 FermatMind 郵件。",
      "metadataTitle": "退訂郵件",
      "missingDescription": "請從郵件中的退訂連結進入此頁面。",
      "statusLabel": "訂閱狀態",
      "statusValues": {
        "unsubscribed": "已退訂"
      },
      "submitError": "暫時無法完成退訂，請稍後再試。",
      "successDescription": "目前訂閱基礎已完成退訂。",
      "successNextSteps": [
        "行銷更新已關閉。",
        "報告恢復郵件已關閉，直到你再次調整偏好。",
        "你可以前往偏好頁重新調整，也可以去訂單找回頁繼續恢復報告。"
      ],
      "successTitle": "已退訂",
      "title": "退訂郵件"
    }
  },
  "footer": {
    "allTestsTitle": "全部測評",
    "articlesTitle": "費馬部落格",
    "contactLabel": "聯絡",
    "copyright": "保留所有權利。",
    "groupTitles": {
      "articles": "費馬部落格",
      "company": "公司",
      "policies": "條款與政策",
      "tests": "熱門測評"
    },
    "localesTitle": "FermatMind",
    "manageEmailPreferences": "管理郵件偏好",
    "privacy": "隱私",
    "ratingLabel": "綜合評分 4.8/5",
    "refund": "退款",
    "reviewsTitle": "使用者口碑",
    "socialTitle": "追蹤我們",
    "support": "說明",
    "tailnote": "測量自己，看見職業，訓練未來。",
    "terms": "條款",
    "unsubscribeFromEmails": "退訂郵件"
  },
  "header": {
    "articles": "部落格",
    "brand": "費馬測試",
    "business": "企業版",
    "career": "職業",
    "closeMenu": "關閉選單",
    "completedPrefix": "累計測試人數：",
    "completedSuffix": "",
    "help": "說明",
    "home": "首頁",
    "menu": "選單",
    "personality": "認識自己",
    "profile": "我的帳戶",
    "search": "搜尋",
    "start": "開始",
    "switchToChinese": "中文",
    "switchToEnglish": "EN",
    "tests": "測試"
  },
  "history": {
    "mbti": {
      "completedLabel": "結果入口",
      "deliveryLabel": "交付",
      "descriptionPrimary": "這裡是你目前身分下的 MBTI Workspace Lite 回訪入口，可繼續已儲存的結果入口。",
      "descriptionRecovery": "需要跨裝置找回已儲存結果時，輸入綁定電子信箱；若目前會話無法直接顯示結果，請從該電子信箱收到的安全連結繼續。",
      "descriptionWorkspaceEntry": "這裡現在就是你的 MBTI Workspace Lite 入口：繼續檢視目前結果，或用電子信箱找回已儲存結果。",
      "emptyDescription": "你目前身分下還沒有可再次進入的 MBTI 結果入口。已儲存結果可透過綁定電子信箱重新進入。",
      "emptyRecoverCta": "用電子信箱找回結果",
      "emptyStartCta": "去做 MBTI 測試",
      "emptyTitle": "目前身分下還沒有 MBTI Workspace Lite 入口",
      "kicker": "Workspace Lite",
      "listSubtitle": "每一行都會顯示目前結果入口的預覽、完整開放與交付狀態，再決定如何繼續。",
      "listTitle": "已儲存的結果入口",
      "loading": "正在載入 MBTI 結果...",
      "metadataTitle": "MBTI Workspace Lite",
      "nextPage": "下一頁",
      "previousPage": "上一頁",
      "recoverCta": "用電子信箱找回結果",
      "statusLabel": "狀態",
      "statusValue": "可再次檢視",
      "submittedAtLabel": "提交時間",
      "surface": {
        "cta": {
          "downloadPdf": "下載 PDF",
          "latestCheckStatus": "檢視最新狀態",
          "latestContinueFull": "繼續最新完整結果",
          "latestContinueLocked": "繼續最新鎖定入口",
          "latestContinuePreview": "繼續最新免費預覽",
          "latestContinueProcessing": "繼續最新準備中入口",
          "latestContinueReady": "繼續最新結果入口",
          "latestContinueRestoring": "繼續最新恢復中入口",
          "rowContinueLocked": "繼續鎖定入口",
          "rowContinuePreview": "繼續免費預覽",
          "rowContinueProcessing": "繼續準備中入口",
          "rowContinueRestoring": "繼續恢復中入口",
          "rowDisabledProcessing": "結果準備中",
          "rowDisabledRestoring": "結果恢復中",
          "rowDisabledSyncing": "狀態同步中",
          "rowDisabledUnavailable": "目前不可進入",
          "rowOpenFull": "開啟完整結果",
          "rowOpenReady": "開啟結果入口"
        },
        "delivery": {
          "onlineAccess": "線上存取",
          "pdfNotReady": "PDF 未就緒",
          "pdfReady": "PDF 已就緒",
          "pdfUnavailable": "PDF 未提供",
          "syncing": "交付待同步"
        },
        "detail": {
          "freePreview": "這個 Workspace Lite 入口仍處於免費預覽，完整解鎖繼續在結果頁完成。",
          "fullUnlocked": "這是完整結果的 Workspace Lite 回訪入口。",
          "lockedEntry": "這個 Workspace Lite 入口目前仍未完全開放。可回到結果頁檢視最新狀態，或使用訂單找回恢復存取。",
          "processing": "這個 Workspace Lite 入口仍在準備中，請透過等待入口繼續回到目前結果頁。",
          "readyEntry": "這個 Workspace Lite 入口會回到目前結果頁，並保留目前回訪路徑。",
          "restoring": "這個 Workspace Lite 入口正在恢復中，請透過等待入口繼續回到目前結果頁。",
          "syncing": "這個 Workspace Lite 入口的目前存取狀態仍在同步，請稍後重新整理；若你已購買報告，可先使用訂單找回。",
          "unavailable": "這個 Workspace Lite 入口目前不可直接再次進入，請優先使用訂單找回。"
        },
        "latestEntryLabel": "最新入口",
        "previewModuleLabels": {
          "career": "職業對映",
          "coreFree": "結果摘要",
          "coreFull": "完整人格判讀",
          "relationships": "關係對映"
        },
        "previewScopePrefix": "目前預覽範圍",
        "status": {
          "freePreview": "免費預覽",
          "fullUnlocked": "完整報告已開放",
          "lockedEntry": "入口仍鎖定",
          "processing": "結果準備中",
          "readyEntry": "結果入口",
          "restoring": "結果恢復中",
          "syncing": "狀態同步中",
          "unavailable": "目前不可用"
        }
      },
      "title": "MBTI Workspace Lite",
      "viewReport": "開啟結果入口"
    }
  },
  "home": {
    "hero": {
      "chips": [
        "能力畫像",
        "人格測評",
        "職業選擇"
      ],
      "ctaPrimary": "尋找你的測試",
      "ctaSecondary": "瀏覽全部測試",
      "kicker": "循證測評體系",
      "subtitle": "覆蓋職業選擇、人格洞察與成長規劃的心理測評工具，幫助你更快做出高品質決策。",
      "title": "費馬測試，讓你走得更遠"
    },
    "highlighted": {
      "clinicalBadge": "臨床級",
      "comingSoonBadge": "即將上線",
      "comingSoonCards": [
        {
          "description": "面向圖形推理與模式識別的矩陣測評，支援移動端自適應呈現。",
          "title": "認知矩陣（IQ）"
        },
        {
          "description": "用於評估人際互動與場景適應能力，適配學習與職場場景。",
          "title": "社會適應指數"
        }
      ],
      "comingSoonCta": "即將發布",
      "cta": "開始此測試",
      "subtitle": "選擇一個核心方向，立即進入結構化測評流程。",
      "title": "重點測評"
    },
    "socialProof": {
      "subtitle": "被學習者、團隊管理者與內容社群持續使用與推薦。",
      "testimonialsTitle": "真實使用者評價",
      "title": "使用者與推薦方",
      "trustPillarsSubtitle": "強調循證表達、穩定評分邏輯與以關懷為先的安全機制。",
      "trustPillarsTitle": "信任依據"
    },
    "valueProps": {
      "items": [
        {
          "description": "基於穩定測評結構與透明評分邏輯，結果可解釋、可複核。",
          "title": "免費且可靠"
        },
        {
          "description": "最小化資料採集，匿名標識與同意機制優先，降低資訊暴露風險。",
          "title": "隱私預設保護"
        },
        {
          "description": "流程設計面向高密度答題場景，服務個人與團隊雙場景。",
          "title": "高完成率驗證"
        }
      ],
      "title": "為什麼大家信任 FermatMind"
    }
  },
  "lang": {
    "en_label": "EN",
    "zh_label": "中文"
  },
  "legal": {
    "deletionChannel": "如需資料匯出/刪除，請聯絡 support@fermatmind.com。",
    "effectiveDateLabel": "生效日期",
    "medical_disclaimer": "FermatMind 報告不是醫療診斷，也不構成醫療建議。",
    "privacy_title": "隱私政策",
    "refund_title": "退款政策",
    "terms_title": "服務條款"
  },
  "loading": {
    "phases": [
      "正在匹配證據模型...",
      "正在生成你的結構化洞察圖譜..."
    ]
  },
  "orders": {
    "backToMyResult": "返回我的測試結果",
    "canceled": "訂單已取消。",
    "contactSupport": "聯絡客服",
    "failed": "支付失敗。",
    "openOrderLookup": "前往訂單查詢",
    "openPaymentHint": "請在支付頁面完成支付，完成後返回此頁面等待狀態更新。",
    "openPaymentPage": "開啟支付頁面",
    "paid": "支付成功。",
    "paymentActionTitle": "完成支付",
    "paymentProviderLabel": "支付管道",
    "pending": "正在確認支付...",
    "qrCodeGenerating": "正在產生安全的 QR Code...",
    "qrCodeHint": "請使用支付 App 掃描 QR Code 完成支付。",
    "qrCodeUnavailable": "QR Code 產生失敗，請重新整理後重試。",
    "recoveryHint": "這通常是因為你更換了瀏覽器、裝置，或匿名身分已變化。請透過訂單查詢恢復支付流程。",
    "recoveryRequired": "目前身分無法直接存取該訂單。",
    "refresh": "重新整理",
    "refunded": "訂單已退款。",
    "reportFailed": "報告交付延遲，請聯絡客服。",
    "reportGenerating": "報告仍在生成，請稍後重新整理。",
    "reportPendingAfterPayment": "支付已完成，報告仍在生成或恢復中，請稍後重新整理。",
    "reportReady": "你的完整報告已可檢視。",
    "retryPayment": "重試支付",
    "title": "訂單狀態",
    "viewReport": "檢視完整報告"
  },
  "quiz": {
    "answerTip": "沒有對錯答案，請選擇最符合你的選項。",
    "big5Retake": {
      "forms": {
        "big5_120": "大五人格120題完整版",
        "big5_90": "大五人格90題標準版",
        "generic": "目前大五人格測試入口"
      },
      "guidance": "如需繼續，請稍後重試，或先看看其他測試。",
      "reasons": {
        "cooldownWithRetry": "你剛剛已經開始了{form_label}，請在{retry_after}後再試。",
        "cooldownWithoutRetry": "你剛剛已經開始了{form_label}，請稍後再試。",
        "genericWithRetry": "目前開始測評請求較多，請在{retry_after}後再試。",
        "genericWithoutRetry": "目前開始測評請求較多，請稍後再試。",
        "limitExceededDefault": "你已達到{form_label}的重測次數上限，請稍後再試。",
        "limitExceededWithWindow": "你在最近30天內已達到{form_label}的重測次數上限。"
      },
      "retryCountdown": "請在{retry_after}後重試。",
      "title": "暫時無法重新開始"
    },
    "estimatedTimeLabel": "預計用時",
    "immersive": {
      "backToDetails": "返回詳情",
      "backToLanding": "返回測評介紹",
      "currentFocus": "目前題目",
      "noOptions": "目前題目暫無可用選項。",
      "previous": "上一題",
      "submitPhases": [
        "正在儲存你的作答...",
        "正在分析維度分佈...",
        "正在生成你的畫像..."
      ],
      "submitRetry": "重新提交"
    },
    "iq": {
      "next": "下一題",
      "pickPrompt": "請選擇最能補全矩陣的選項。",
      "selectHint": "請先選擇一個選項再繼續。",
      "submit": "提交答案"
    },
    "milestoneHints": [
      "進展不錯，繼續保持。",
      "節奏很好，繼續前進。",
      "已完成一半，專注就好。",
      "接近完成，再堅持一下。",
      "完成得很棒。"
    ]
  },
  "result": {
    "breakdown": "維度拆解",
    "generatingPaymentHint": "支付資訊將在報告與報價準備完成後顯示。",
    "interpretation": "解讀",
    "noDimensions": "目前暫無可展示的維度明細。",
    "openOrderLookup": "前往訂單查詢",
    "paymentUnavailable": "暫時無法發起支付。",
    "reportNotFoundFallback": "結果同步耗時較長，請重試或先檢視訂單狀態。",
    "reportNotFoundRetrying": "結果正在同步，系統將自動重試...",
    "reportUnavailable": "報告暫時不可用，請稍後再試。",
    "summaryPending": "報告摘要正在生成中。",
    "title": "你的測評結果",
    "viewOrderStatus": "檢視訂單狀態"
  },
  "support": {
    "contact": "聯絡管道",
    "emailHint": "需要訂單或報告交付協助？",
    "lookup": "訂單查詢",
    "quickActions": "快速操作",
    "title": "說明中心"
  },
  "tests": {
    "relatedArticles": {
      "empty": "該測評暫未配置相關文章。",
      "subtitle": "圍繞該測評的工具說明、成長引導與敘事畫像。",
      "title": "相關文章"
    },
    "subtitle": "選擇一個測評檢視詳情並開始測評。",
    "title": "測評列表"
  }
};

export default traditional;

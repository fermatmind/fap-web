import type { Questionnaire } from "@/lib/questionnaires/types";

export const nineStarLandingSections: Questionnaire["guide"] = [
  {
    "id": "nine-star-context-meaning",
    "title": {
      "en": "What the Nine Star Ki year reference calculates",
      "zh": "九星气学节年参考计算什么"
    },
    "paragraphs": [
      {
        "en": "Nine Star Ki, also called Kyusei Kigaku, uses inherited number, colour and phase labels. This tool returns only a year-star reference under one stated seasonal convention. It does not observe a physical star at birth or ask psychological questions. The number identifies a place in a nine-year sequence, not the amount of an ability or a personality trait.",
        "zh": "Nine Star Ki又称九星气学，使用传统数字、色名与五行标签。本工具只按一项明确的节年规则提供年星参考，不观测出生时的某颗实体恒星，也不提出心理题目。数字标识九年循环中的位置，不表示某种能力或人格特质的多少。"
      },
      {
        "en": "The input has two parts: a Gregorian year and your explicit choice of which side of its displayed Beginning of Spring boundary applies. A year alone leaves two possible season years. If you cannot make the comparison, retain both labels; reading whichever portrait feels closer cannot establish the missing birth time.",
        "zh": "输入分为两部分：公历年份，以及你明确选择的立春界点前后。只有年份时，仍有两个可能节年。无法比较就保留两个标签；哪篇描述读起来更像自己，不能用来确认缺失的出生时刻。"
      }
    ]
  },
  {
    "id": "nine-star-context-calendar",
    "title": {
      "en": "Beginning of Spring is a solar boundary, not Lunar New Year",
      "zh": "立春是太阳节气界点，不是农历正月初一"
    },
    "paragraphs": [
      {
        "en": "Japan’s National Astronomical Observatory lists Beginning of Spring at solar longitude 315 degrees. Its 2026 calendar gives February 4 at 05:02 in Japanese standard time. This supplies an astronomical calendar reference. Adopting that instant as a year-star boundary is a traditional rule; the calendar calculation does not validate claims about human character. [4]",
        "zh": "日本国立天文台把立春列在太阳黄经315度；2026年历要给出的时刻为日本标准时2月4日05:02。这提供天文历法参考。把这一时刻用作年星分界，属于所采用的传统规则；历法计算本身没有验证关于性格的主张。[4]"
      },
      {
        "en": "Lunar months and solar terms describe different calendar features. NAOJ explains that the old Japanese lunisolar calendar used new moons for month beginnings while also accounting for solar seasons. Consequently January 1, Lunar New Year and Beginning of Spring are not interchangeable year boundaries. This page uses the specified solar boundary rather than silently changing calendar systems. [5]",
        "zh": "月相月份与太阳节气描述不同历法特征。国立天文台说明，日本旧太阴太阳历以朔日开始月份，同时考虑太阳所代表的季节。因此公历元旦、农历新年与立春，不能互相替代为同一个分年界点。本页采用已说明的太阳节气界点，不暗中切换历法。[5]"
      }
    ]
  },
  {
    "id": "nine-star-context-time",
    "title": {
      "en": "Compare instants in the same time standard",
      "zh": "用相同时间标准比较两个时刻"
    },
    "paragraphs": [
      {
        "en": "The displayed table uses JST, UTC+09:00, not a guessed birth-location time zone. In the 2026 example, 05:02 JST corresponds to 20:02 UTC on February 3. At a fixed UTC+08:00 offset it is 04:02 on February 4. These are the same instant, not three different beginnings of spring. The example demonstrates offset arithmetic, not a historical time-zone lookup for any birthplace.",
        "zh": "界点表使用JST，即UTC+09:00，不猜测出生地时区。以2026年为例，05:02 JST对应UTC的2月3日20:02；若使用固定UTC+08:00偏移，则是2月4日04:02。这是同一时刻，不是三次立春。本例演示偏移换算，不是对任何出生地历史时区的查询。"
      },
      {
        "en": "A local date alone may not locate a birth relative to that instant. Historical UTC offsets and daylight-saving rules can differ from today’s clock setting. This page does not collect or convert a birthplace or time zone; choose uncertain when the applicable offset or conversion is unknown. Do not move the boundary simply because a different country uses a different date on its clock.",
        "zh": "仅有当地日期，可能不足以判断出生时刻在界点哪一侧；历史UTC偏移与夏令时规则，也可能不同于今天的时钟设置。本页不收集或换算出生地与时区，适用偏移或换算不清楚时请选择不确定。不要因另一地区时钟显示不同日期，就移动同一个界点。"
      }
    ]
  },
  {
    "id": "nine-star-context-worked",
    "title": {
      "en": "A worked year-star calculation: 2026 before and after",
      "zh": "完整算例：2026年界点前后怎样计算"
    },
    "paragraphs": [
      {
        "en": "The adopted anchor is season year 1927 = One White, followed by 1928 = Nine Purple. For a moment clearly after the 2026 boundary, use season year 2026: 1927 − 2026 = −99; its non-negative remainder modulo nine is 0; adding 1 gives One White. Before the boundary, use 2025: −98 has remainder 1, giving Two Black. The formula labels the season you selected; it does not independently verify that selection.",
        "zh": "采用的锚点是1927节年为一白，1928节年接九紫。明确在2026年界点之后时，用2026节年：1927−2026＝−99，取模9的非负余数为0，加1得到一白。界点之前用2025节年：−98的非负余数为1，得到二黑。公式为你选择的节年分配标签，不独立核实这项选择。"
      },
      {
        "en": "Nine years later the label repeats because the remainder repeats. This mathematical cycle does not imply that people nine years apart share a character, that events recur every nine years, or that nine is better than one. The result displays the season year and the arithmetic so that you can check the operation without accepting a personal forecast.",
        "zh": "九年后标签重复，是因为余数重复。这项数学循环不表示相隔九年出生的人性格相同、不表示事件每九年重演，也不表示九比一更好。结果同时显示所用节年与算式，使你可以核对运算，而无需接受个人预测。"
      }
    ]
  },
  {
    "id": "nine-star-context-uncertain",
    "title": {
      "en": "Two possibilities preserve information that is missing",
      "zh": "两个可能结果，保留尚缺的信息"
    },
    "paragraphs": [
      {
        "en": "In 2025 the adopted boundary is February 3 at 23:10 JST. Before it, season year 2024 gives Three Jade; after it, season year 2025 gives Two Black. If the comparison is uncertain, both remain visible with both full guides. They are alternatives conditioned on timing, not two dominant traits or a tied psychological score.",
        "zh": "2025年采用的界点为2月3日23:10 JST。之前用2024节年，得到三碧；之后用2025节年，得到二黑。比较不确定时，两者与两篇全文同时保留。它们是由时刻条件区分的可能结果，不是两个主导特质，也不是心理分数并列。"
      },
      {
        "en": "The table displays only a minute. A birth recorded within that boundary minute remains uncertain under this tool’s rule. No 50/50 probability is assigned, and the interface does not prefer the first result. A clearer birth record may resolve the comparison later; a more appealing symbolic description cannot substitute for it.",
        "zh": "表格只显示到分钟。按本工具规则，出生记录落在界点所显示的这一分钟内，仍保留不确定；不会分配各50%的概率，也不偏向第一个结果。以后更清楚的出生记录可能帮助比较，但更讨喜的符号描述不能替代记录。"
      }
    ]
  },
  {
    "id": "nine-star-context-symbols",
    "title": {
      "en": "Read number, colour, phase and image as separate layers",
      "zh": "把数字、色名、五行与卦象分层阅读"
    },
    "paragraphs": [
      {
        "en": "The nine names are One White Water, Two Black Earth, Three Jade Wood, Four Green Wood, Five Yellow Earth, Six White Metal, Seven Red Metal, Eight White Earth and Nine Purple Fire. Earth appears three times, Wood and Metal twice each, Water and Fire once each. Shared phases do not make the guides identical, and colour names are inherited terms rather than clothing recommendations.",
        "zh": "九个名称是一白水星、二黑土星、三碧木星、四绿木星、五黄土星、六白金星、七赤金星、八白土星与九紫火星。土有三个，木与金各两个，水与火各一个。五行相同不使指南内容相同，传统色名也不是穿衣配色建议。"
      },
      {
        "en": "The adopted Later Heaven diagram places Five at the centre among eight trigrams; it does not create a ninth trigram or a superior person. Each public guide distinguishes its inherited image from FermatMind’s modern everyday analogy. For example, a mountain can suggest a pause between tasks without proving stubbornness, while a lake image does not impose a duty to entertain others.",
        "zh": "采用的后天图把五置于八卦之间的中央，没有因此产生第九个卦，也没有更优越的人。各篇公开指南区分传统图像与费马现代日常类比。例如，山可用于思考任务之间的暂停，却不证明固执；泽的图像也不让人承担取悦他人的义务。"
      }
    ]
  },
  {
    "id": "nine-star-context-systems",
    "title": {
      "en": "Why another calculator can return something different",
      "zh": "为什么其他计算器可能给出不同结果"
    },
    "paragraphs": [
      {
        "en": "First compare the requested output: a year star, a month star, a derived third number, a Kua number and a Four Pillars chart are different products. Then compare the year boundary, time standard, supported dates and treatment of uncertainty. This annual reference uses no sex-dependent formula, retains Five as Five and does not calculate monthly or directional outputs.",
        "zh": "先核对输出是什么：年星、月星、派生第三数、本命卦与四柱盘，是不同对象；再比较分年界点、时间标准、支持日期与不确定情况的处理。本年度参考不使用按性别区分的公式，五仍保留为五，不计算月星或方位输出。"
      },
      {
        "en": "A fixed February 4 shortcut can differ from a year-specific time near a transition. A date-only tool and a tool preserving a boundary minute may also answer with different certainty. Agreement between sites only shows that their operations may align for an input; it does not establish personality validity. Disagreement calls for checking the conventions before choosing a preferred portrait.",
        "zh": "固定2月4日的简化规则，在交界附近可能与逐年具体时刻不同；只处理日期的工具，与保留界点分钟不确定性的工具，也可能给出不同确定程度。站点之间一致，只说明某次输入的运算可能一致，不证明人格效度；结果不一致时，应先核对规则，而不是挑一篇更喜欢的画像。"
      }
    ]
  },
  {
    "id": "nine-star-context-use",
    "title": {
      "en": "Explore a cultural guide without surrendering personal judgment",
      "zh": "阅读文化指南，同时保留自己的判断"
    },
    "paragraphs": [
      {
        "en": "A historical book records a convention; an astronomical table supplies a seasonal instant; a remainder calculation assigns a label; and a present-day analogy invites an optional reflection. These are four different kinds of evidence. None alone establishes that a year label predicts health, relationships, job suitability or a good time to make a consequential decision.",
        "zh": "历史书记录惯例，天文表提供节气时刻，余数运算分配标签，现代类比则邀请自选的日常思考。这是四种不同性质的依据，没有哪一项单独证明年星标签能够预测健康、关系、职业适配或重大决策的好时机。"
      },
      {
        "en": "All nine guides can be read without entering anything. If you calculate, only the year and boundary-side choice enter this page’s memory. Editing clears the earlier result; clearing, reloading, leaving or changing language removes inputs. Copying shares public guide titles and links only. There is no requirement to register, approve a second agreement, buy a report or provide a complete birth record.",
        "zh": "九篇指南都可以不输入资料直接阅读。若计算，只有年份与界点选择进入本页内存；修改会清除旧结果，清除、刷新、离开或换语会移除输入。复制只分享公开指南标题与链接，无需注册、再次同意、购买报告或提供完整出生记录。"
      }
    ]
  }
];

export const nineStarLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is Beginning of Spring always February 4?",
      "zh": "立春总在2月4日吗？"
    },
    "answer": {
      "en": "No. This table uses a separate time for each supported year, including February 3 in 2025 and February 4 in 2026, in JST.",
      "zh": "不是。本表使用支持范围内各年的独立时刻，例如JST的2025年2月3日与2026年2月4日。"
    }
  },
  {
    "question": {
      "en": "Does the displayed time use my device time zone?",
      "zh": "显示时刻会采用设备时区吗？"
    },
    "answer": {
      "en": "No. It remains JST, UTC+09:00. Your location and device clock do not change the table or silently resolve the boundary side.",
      "zh": "不会。界点始终使用JST，即UTC+09:00；所在地与设备时钟不会改变表格，也不会暗中决定界点前后。"
    }
  },
  {
    "question": {
      "en": "Is uncertain a fifty-fifty result?",
      "zh": "不确定表示各占50%吗？"
    },
    "answer": {
      "en": "No. Two conditional labels are retained without assigned probabilities. Their order does not indicate a preference.",
      "zh": "不是。这里只保留两个有条件的标签，不分配概率，排列顺序也不代表偏好。"
    }
  },
  {
    "question": {
      "en": "Can I choose the label whose description fits better?",
      "zh": "可以选描述更像自己的那个标签吗？"
    },
    "answer": {
      "en": "You may read any guide, but resemblance cannot establish a birth moment or resolve the calendar boundary. Keep the timing uncertain when the record is unclear.",
      "zh": "可以阅读任意指南，但觉得相像不能确认出生时刻或解决历法界点；记录不清楚时仍应保留时刻不确定。"
    }
  },
  {
    "question": {
      "en": "Why does Five not become Two or Eight?",
      "zh": "为什么五没有转成二或八？"
    },
    "answer": {
      "en": "This annual Nine Star rule retains all nine labels. Remapping Five belongs to other conventions and is not part of this calculator.",
      "zh": "本年度九星规则保留全部九个标签；把五改成其他数属于不同惯例，不在本工具中采用。"
    }
  },
  {
    "question": {
      "en": "Does a nine-year cycle prove that my life will repeat?",
      "zh": "九年循环证明人生会重复吗？"
    },
    "answer": {
      "en": "No. Repeated labels follow the modular arithmetic. They do not establish repeated events, a life timetable or a measured behavioural cycle.",
      "zh": "不能。标签重复来自模运算，不证明事件重复、人生时间表或测得的行为周期。"
    }
  },
  {
    "question": {
      "en": "Are the five phases physical substances in my body?",
      "zh": "这里的五行是身体里的实体物质吗？"
    },
    "answer": {
      "en": "No. They are categories in the cultural symbol system, not a chemical or medical finding about the reader.",
      "zh": "不是。它们是文化符号体系中的类别，不是对读者身体作出的化学或医学发现。"
    }
  },
  {
    "question": {
      "en": "Can I open the input directly without another agreement?",
      "zh": "能直接进入输入区，不再要求同意吗？"
    },
    "answer": {
      "en": "Yes. Open tool focuses the year field. Enter a supported year and explicitly choose a boundary side; there is no registration, second agreement or payment gate.",
      "zh": "可以。打开工具会聚焦年份输入框；输入支持年份并明确选择界点前后即可，无需注册、再次同意或付款。"
    }
  }
];

export const nineStarLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "NAOJ: 2026 solar terms, Beginning of Spring at 315 degrees",
      "zh": "日本国立天文台：2026年二十四节气与立春315度"
    },
    "url": "https://eco.mtk.nao.ac.jp/koyomi/yoko/2026/rekiyou262.html"
  },
  {
    "title": {
      "en": "NAOJ: the old Japanese lunisolar calendar",
      "zh": "日本国立天文台：旧太阴太阳历说明"
    },
    "url": "https://www.nao.ac.jp/faq/a0304.html"
  }
];

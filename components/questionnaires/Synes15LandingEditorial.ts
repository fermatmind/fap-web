import type { Questionnaire } from "@/lib/questionnaires/types";
export const synes15LandingSections: Questionnaire["guide"] = [
  {
    "id": "synes-reading-scope",
    "title": {
      "en": "Synesthesia test: describe recalled experiences without forcing a label",
      "zh": "联觉测试：描述回忆中的体验，不强行贴标签"
    },
    "paragraphs": [
      {
        "en": "Synesthesia, also spelled synaesthesia, concerns experiences in which a sensory or cognitive event is accompanied by an additional experience. A written symbol might bring a colour impression, or a familiar sequence might have a spatial arrangement. This page asks what you recall from ordinary occasions; it does not create those experiences or check their origin.",
        "zh": "联觉涉及某种感官或认知事件伴随另一种体验，例如书写符号带来颜色印象，或熟悉序列带有空间排列。synesthesia与synaesthesia是这一主题的不同英文拼写。本页询问普通场合中的回忆，不制造体验，也不检验体验的来源。"
      },
      {
        "en": "FermatMind authored fifteen prompts, four answer labels and five complete guides. Each family contains three prompts. The families are editorial navigation, not validated factors or an exhaustive catalogue of synaesthesia. All five guides are free before and after answering, including when every response is uncertain or skipped.",
        "zh": "十五条描述、四种选项与五篇完整指南由费马原创，每组三条。分组服务于阅读导航，不是经过验证的因子或联觉现象的完整目录。五篇指南在作答前后均免费可读，即使全部选择不确定或跳过也不受影响。"
      }
    ]
  },
  {
    "id": "synes-reading-families",
    "title": {
      "en": "Five families, with different experiences kept visible",
      "zh": "五类阅读入口，保留不同体验的具体差异"
    },
    "paragraphs": [
      {
        "en": "The first three families concern symbols with colour impressions, sounds with colours or shapes, and sequences with spatial layouts. The fourth concerns person-like qualities attached to symbols or sequence members. It is not a personality assessment of the visitor and does not ask whether a symbol has the same character for everyone.",
        "zh": "前三组分别关注符号伴随颜色印象、声音伴随颜色或形状，以及序列带有空间布局。第四组关注符号或序列成员带有类似人的特征，不评估访客的人格，也不要求某个符号对所有人都具有同样性格。"
      },
      {
        "en": "The fifth family places three different descriptions together for navigation: a word with taste or mouth-texture impressions, observing another person’s non-painful touch with a bodily impression, and symbols with touch-like or location impressions. These are not interchangeable phenomena. Read the chosen answer for each prompt instead of interpreting the family count as a single taste-touch ability.",
        "zh": "第五组为导航把三种不同描述放在一起：词语伴随味道或口腔质感、观察他人不疼痛的触碰时伴随身体印象，以及符号带来触觉样或位置印象。这些现象不能互换，应逐条阅读回答，不能把组内计数解释为单一味觉触觉能力。"
      }
    ]
  },
  {
    "id": "synes-reading-recall",
    "title": {
      "en": "The past three months: a recall window, not a lifelong criterion",
      "zh": "近三个月：回忆范围，而不是终身标准"
    },
    "paragraphs": [
      {
        "en": "Consider only ordinary occasions that have already occurred during the past three months. This window was chosen for this original checklist; it is not a research criterion establishing developmental synaesthesia. No recent opportunity to encounter a description is different from having relevant occasions but not recalling it.",
        "zh": "只回顾近三个月已经发生的普通场合。这个时间窗由本站为原创清单选定，不是确立发展性联觉的研究标准。近期没有遇到对应情境，与有相关机会却未记得体验，是不同情况。"
      },
      {
        "en": "Do not replay sounds, taste food, arrange for someone to be touched or try to induce a sensation to answer. No colour picker, bodily map, camera, exposure video or timed task is needed. If you cannot distinguish a recalled impression from a deliberate image, metaphor or learned association, the unsure response is available.",
        "zh": "不要为回答重新播放声音、品尝食物、安排他人被触碰或尝试诱发感觉。不需要选色器、身体图、摄像头、暴露视频或计时任务。若分不清回忆中的印象与刻意想象、比喻或学到的联想，可选择不确定。"
      }
    ]
  },
  {
    "id": "synes-reading-choices",
    "title": {
      "en": "Four explicit choices, none silently substituted for another",
      "zh": "四种明确选择，不相互默认替代"
    },
    "paragraphs": [
      {
        "en": "Yes records that you recall the described experience. No records that you had relevant occasions but do not recall that experience within the window; it does not establish that it has never happened. Unsure records uncertainty about how to answer. No relevant opportunity or preferring not to answer remains a separate fourth choice.",
        "zh": "记得有过，记录对所述体验的回忆；有机会但未记得，记录时段内有相关机会却不记得体验，不确立从未发生。不确定记录无法确定怎样回答；没有相关机会或不愿回答，则保留为单独的第四种选择。"
      },
      {
        "en": "Every prompt needs one explicit choice before continuing. An empty answer pauses progression, whereas unsure and skip are accepted responses. None is converted into an assumed yes or no. Choosing one option does not require an explanation, personal sensory example or proof, and you can leave or clear the record whenever you prefer.",
        "zh": "继续前每条需要一个明确选择。空白会暂停前进，不确定与跳过则作为有效回答接受，不会被转换成推定的有或没有。选择后不需要解释、私人感官例子或证明，可随时离开或清除记录。"
      }
    ]
  },
  {
    "id": "synes-reading-records",
    "title": {
      "en": "Literal counts out of three, plus the complete item readback",
      "zh": "三条中的字面计数，以及完整逐项回读"
    },
    "paragraphs": [
      {
        "en": "For each family, the result shows four counts and all three selected answers. If the responses are yes, no and unsure, the counts are one, one, one and zero skips. If all three were skipped, the skip count is three and the other counts are zero. Both records cover three explicit choices but contain very different information.",
        "zh": "每组结果显示四种计数与全部三个已选回答。若分别选择有、没有与不确定，则计数为一、一、一，跳过为零；若三条都跳过，则跳过为三，其余为零。两份记录都覆盖三个明确选择，但包含的信息很不同。"
      },
      {
        "en": "The four counts always add to three for a completed family. They are not sensory intensity, a percentage of synaesthesia, a probability or a population rank. The page does not add families into a total, average the answer labels or select the largest family as a type. A group with no yes answers is not proof of lifetime absence.",
        "zh": "完成后每组四种计数相加始终为三，不代表感觉强度、联觉百分比、概率或人口排名。页面不把各组相加成总分、不平均选项，也不以最大一组选类型。没有肯定回答的组，不能证明终身缺少相关体验。"
      }
    ]
  },
  {
    "id": "synes-reading-evidence",
    "title": {
      "en": "Recall, consistency and experimental evidence are different",
      "zh": "回忆、一致性与实验证据有区别"
    },
    "paragraphs": [
      {
        "en": "Research can investigate whether mappings remain consistent across repeated responses and how additional experiences influence a controlled task. The cited 2022 study used perceptual dissimilarity arrangements for graphemes and colours and compared already characterized participant groups. This page administers neither that task nor a Synesthesia Battery colour-matching procedure.",
        "zh": "研究可考察重复反应中的对应关系是否一致，以及附加体验怎样影响受控任务。所引二〇二二年研究用字符与颜色的知觉差异排列，比较已按研究方法区分的参与者组。本页既不施测该任务，也不施测Synesthesia Battery颜色匹配程序。"
      },
      {
        "en": "The cited 2026 paper presents a hypothesis-and-theory framework distinguishing synaesthesia from related cross-modal phenomena. Its continuum is a conceptual aid, not a personal score scale or a ladder visitors should climb. Neither that framework nor research on another instrument validates these new prompts, their three-month window or bilingual equivalence.",
        "zh": "所引二〇二六年论文提出假说与理论框架，区分联觉与相关跨通道现象；其中连续体是概念辅助，不是个人分数量尺或访客应当攀升的阶梯。该框架或其他工具的研究，都不验证本站新题、三个月时间窗或双语等值性。"
      }
    ]
  },
  {
    "id": "synes-reading-interpretation",
    "title": {
      "en": "Internal impressions, individual differences and nearby experiences",
      "zh": "内在印象、个体差异与相近体验"
    },
    "paragraphs": [
      {
        "en": "These descriptions do not require a colour to appear physically on the page or in the room. An internal impression may be relevant to a prompt. There is no answer key requiring a particular letter to have a particular colour. Reports can differ between people; agreeing with someone else’s colour choice is not the purpose of this checklist.",
        "zh": "描述不要求颜色真的出现在纸面或房间里，内在印象也可能与题文相关。没有答案表规定某个字母必须对应某种颜色。人与人之间的报告可以不同，与别人选同一种颜色不是本清单的目的。"
      },
      {
        "en": "Deliberately choosing a colour, describing a warm voice metaphorically, remembering a coloured childhood object and recalling an unsolicited accompanying impression need not be the same experience. The checklist cannot resolve ambiguous cases or explain their mechanism. Its records also do not establish creativity, empathy, intelligence, memory or a health condition.",
        "zh": "刻意选颜色、用温暖比喻声音、记起儿时彩色物体，以及回忆未经刻意安排的伴随印象，不必是同一种体验。清单不能裁定模糊情形或解释机制，记录也不确立创造力、共情、智力、记忆或健康状况。"
      }
    ]
  },
  {
    "id": "synes-reading-privacy",
    "title": {
      "en": "Direct entry and private records, without a confirmation loop",
      "zh": "直接开始与私人记录，不制造反复确认"
    },
    "paragraphs": [
      {
        "en": "Start test opens the first description directly. Anonymous activity counting is separately optional and off by default. Responses stay in page memory and clear on refresh, changing language, leaving, exiting or retaking. Copying includes the five public guide links without selected answers, counts or sensory examples.",
        "zh": "开始测试直接打开第一条描述。匿名动作统计另设可选项，默认关闭。回答留在页面内存，刷新、换语、离开、退出或重测会清除；复制只含五篇公开指南链接，不带选择、计数或感官例子。"
      },
      {
        "en": "Repeating these questions is another recollection, not a consistency experiment or a validated measure of change. There is no target number of yes responses and no need to practise until a label appears. If an experience is new, distressing or disruptive, discuss what actually happened with an appropriate professional rather than relying on a checklist classification.",
        "zh": "再答一次仍是另一份回忆，不是一致性实验或经过验证的变化测量。没有目标肯定次数，也无需练习直到出现某个标签。若体验新近出现、令人不安或干扰生活，可就实际发生的情况向适当专业人员咨询，不依赖清单分类。"
      }
    ]
  }
];
export const synes15LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What does three yes answers in a family prove?",
      "zh": "一组三个肯定回答能证明什么？"
    },
    "answer": {
      "en": "It records three recalled descriptions, not confirmed synaesthesia, greater intensity or a diagnostic probability. The three individual responses remain available.",
      "zh": "记录三条描述的回忆，不证明已确认联觉、更高强度或诊断概率；三个逐项回答仍可查看。"
    }
  },
  {
    "question": {
      "en": "Is no relevant opportunity the same as no?",
      "zh": "没有相关机会与没有相同吗？"
    },
    "answer": {
      "en": "No. No means relevant occasions but no recalled matching experience in the window. No opportunity or declining is counted separately.",
      "zh": "不同。没有指时段内有相关机会但未记得匹配体验；无机会或不愿回答单独计数。"
    }
  },
  {
    "question": {
      "en": "Do unsure responses become negative answers?",
      "zh": "不确定会变成否定答案吗？"
    },
    "answer": {
      "en": "No. Unsure has its own count and is shown in the item readback. All-unsure responses can finish without a classification.",
      "zh": "不会。不确定有自己的计数，并在逐项回读中保留；全部不确定也可完成，不作分类。"
    }
  },
  {
    "question": {
      "en": "Must everyone associate a letter with the same colour?",
      "zh": "所有人必须给同一个字母配相同颜色吗？"
    },
    "answer": {
      "en": "No. This page has no correct colour map and collects no colour selections. Individual experiences need not agree.",
      "zh": "不需要。本页没有正确颜色图，也不收选色结果；个体体验不必一致。"
    }
  },
  {
    "question": {
      "en": "Why are taste and touch shown together?",
      "zh": "为什么味道与触觉放在一组？"
    },
    "answer": {
      "en": "It is an editorial navigation group, not one validated mechanism. Word-taste, observed-touch and symbol-body descriptions remain separately readable.",
      "zh": "这是阅读导航分组，不是一个经验证机制；词语味道、观察触碰与符号身体印象仍分别可读。"
    }
  },
  {
    "question": {
      "en": "Can I demonstrate an experience to finish?",
      "zh": "完成前要演示体验吗？"
    },
    "answer": {
      "en": "No. Use ordinary recollections only. No sound, food, touch, video, colour picker or private example is required.",
      "zh": "不需要。仅用普通回忆，不要求声音、食物、触碰、视频、选色器或私人例子。"
    }
  },
  {
    "question": {
      "en": "Does a different record after retaking mean my senses changed?",
      "zh": "重测记录不同说明感官改变了吗？"
    },
    "answer": {
      "en": "Not established. Recall and opportunities can differ. This checklist has no validated change score or retest interpretation.",
      "zh": "不能确立。回忆与机会可能不同，本清单没有经过验证的变化分数或复测解释。"
    }
  },
  {
    "question": {
      "en": "Must I enable counting before starting?",
      "zh": "开始前必须开启统计吗？"
    },
    "answer": {
      "en": "No. It is optional and off by default. Start test opens the first prompt directly; you can choose unsure or skip on every description.",
      "zh": "不需要。统计可选且默认关闭；开始测试直接打开第一条，每条都可选择不确定或跳过。"
    }
  }
];

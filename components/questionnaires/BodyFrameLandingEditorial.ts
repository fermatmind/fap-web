import type { Questionnaire } from "@/lib/questionnaires/types";
export const bodyFrameSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "What body-frame observations mean on this page",
      "zh": "本页的体表轮廓观察指什么"
    },
    "paragraphs": [
      {
        "en": "This original adult questionnaire records how well twelve descriptions fit comfortable ordinary views of yourself that you already know. It separates rounded outline impressions, gradual contour transitions and visible joint landmarks. The task concerns remembered surface impressions, not a measurement of the skeleton beneath them.",
        "zh": "本原创成人问卷记录：十二条描述与自己已经熟悉、觉得舒服的普通视角有多符合。它分别整理圆润轮廓、柔和转折与关节轮廓三类印象，关注记忆中的体表印象，不测量其下方的骨骼。"
      },
      {
        "en": "Each observation group has four statements and its own reading. Several groups may fit at once, or you may have too little familiar information for a mean. The result keeps those possibilities visible instead of assigning a single body identity or treating a description as an ideal to achieve.",
        "zh": "每个观察组有四条陈述与独立读法。多个分组可以同时符合，也可能缺少足够熟悉的信息而无法显示均值。结果保留这些情况，不分配单一身体身份，也不把某种描述当成需要达到的理想。"
      }
    ]
  },
  {
    "id": "three-observations",
    "title": {
      "en": "Three descriptions of appearance, without an anatomical classification",
      "zh": "三种印象描述，不作解剖分类"
    },
    "paragraphs": [
      {
        "en": "Rounded outlines refer to the rounded, three-dimensional impression described in the relevant statements. Gradual transitions refer to how softly one visible outline seems to pass into another. A rounded area and a gradual transition can both be part of the same familiar view; they are not mutually exclusive types.",
        "zh": "圆润轮廓关注对应陈述描述的圆润、立体印象；柔和转折关注可见轮廓之间衔接时显得多柔和。同一熟悉视角可以同时出现圆润区域与柔和转折，两者不是互斥类型。"
      },
      {
        "en": "Joint landmarks concern the visibility of the particular outlines named by those items. Agreement does not quantify joint size, bone density or strength. These editorial groups also do not establish tissue composition, weight, health, attractiveness or the clothing someone ought to wear.",
        "zh": "关节轮廓关注题目提及的特定轮廓是否显著。认同描述不量化关节大小、骨密度或强度。这些编辑分组也不确定组织构成、体重、健康、外貌吸引力或一个人应当穿什么。"
      }
    ]
  },
  {
    "id": "familiar-view",
    "title": {
      "en": "Answer from an already familiar view, without a new inspection",
      "zh": "使用已有熟悉印象，无需新增检查"
    },
    "paragraphs": [
      {
        "en": "Use a comfortable ordinary view you already remember, rather than create a special pose, photograph or measurement for the questionnaire. No mirror check, undressing, touching a joint or comparison with another person is required. If the view is unfamiliar or a description is unclear, unscored is a valid response.",
        "zh": "使用已经记得、觉得舒服的普通视角，不需要为问卷专门摆姿势、拍照或测量。不要求照镜检查、脱衣、触摸关节或与他人比较。视角不熟悉或描述不清时，未评分就是有效选项。"
      },
      {
        "en": "Rate the description actually written, not the styling label you hope to receive. Three means that the description fits somewhat, rather than uncertainty, a neutral body type or a middle-ranked appearance. You can leave at any point and read the same complete guides without completing the twelve responses.",
        "zh": "评价题目实际写出的描述，不根据希望得到的造型标签作答。3表示部分符合，不代表无法判断、中性身体类型或外貌排名居中。可以随时离开，也可不完成十二项回答，直接阅读同样的完整指南。"
      }
    ]
  },
  {
    "id": "means-example",
    "title": {
      "en": "How the three means are calculated",
      "zh": "三个均值怎样计算"
    },
    "paragraphs": [
      {
        "en": "Each four-item group needs at least three numeric ratings. Add the valid values and divide by the number rated; the display uses one decimal. For 1, 2, 4 and Unscored, the raw sum is 7 across three ratings, so the mean shown is 2.3 / 5. Unscored is excluded from both the sum and the denominator.",
        "zh": "每组四条中至少需要三条数字评分。将有效数值相加，除以有效评分条数，显示一位小数。回答为1、2、4与未评分时，原始合计7、有效三条，展示均值2.3 / 5；未评分不进入分子或分母。"
      },
      {
        "en": "For 5, 5 and two unscored answers, the group shows Insufficient information, not 5.0. That minimum is a display rule for this edition, not a validated confidence threshold. The groups have no common fixed total, and there is no overall body score, strongest type or blended identity.",
        "zh": "若为5、5和两个未评分，该组显示资料不足，不显示5.0。最低条数是本版本的展示规则，不是经验证的置信阈值。三组没有共同固定总量，不生成身体总分、最强类型或混合身份。"
      }
    ]
  },
  {
    "id": "coverage",
    "title": {
      "en": "Read coverage together with the mean",
      "zh": "将有效条数与均值一起阅读"
    },
    "paragraphs": [
      {
        "en": "A mean summarises the particular descriptions you rated. Two groups with the same mean can have different answers or coverage, and a one-decimal display does not establish that equally spaced numbers represent equally spaced physical differences. A mean of 4 is not twice the bodily feature represented by 2.",
        "zh": "均值概括你实际评分的这些描述。均值相同的两组可以有不同回答或有效条数；显示一位小数，不证明等距数值代表等距身体差异。均值4不表示某种身体特征是均值2的两倍。"
      },
      {
        "en": "Unscored includes no familiar view, inability to judge and a declined answer. Those reasons share one response label, so the form cannot distinguish them. An entirely unscored attempt is complete once all twelve choices are explicit; all three full guides remain open even when no means are available.",
        "zh": "未评分包括没有熟悉视角、无法判断与不愿回答。这些原因共用一个选项，表单不能进一步区分。十二项均明确选择后，全部未评分也属于完整作答；即使三个均值均不可得，三篇全文仍然开放。"
      }
    ]
  },
  {
    "id": "frameworks",
    "title": {
      "en": "Why similar styling names do not make the methods equivalent",
      "zh": "造型名称相似，为何不代表方法等值"
    },
    "paragraphs": [
      {
        "en": "The cited Japanese associations describe their own systems using Straight, Wave and Natural. Their pages use different centre-of-gravity conventions: fashion.or.jp describes Straight as upper-weighted, while kokkaku.jp states that its own skeletal convention places Straight without a bias and Natural higher. These are the providers’ framework descriptions, not measurements made by this page. [1][2]",
        "zh": "所引日本协会在各自体系中使用Straight、Wave与Natural，重心约定却存在区别：fashion.or.jp将Straight描述为上重心；kokkaku.jp说明其骨格约定中Straight重心不偏、Natural偏高。这是各机构对自身框架的描述，不是本页作出的测量。[1][2]"
      },
      {
        "en": "Our three groups are not translations of those three labels. A high rounded-outline mean does not assign Straight, and a visible-joint mean does not assign Natural. This questionnaire does not reconcile competing systems, reproduce their self-checks or establish a conversion to Kibbe, body-shape ratios or a professional consultation.",
        "zh": "本页三组不是上述三标签的翻译。圆润轮廓均值较高不分配Straight，关节轮廓均值较高不分配Natural。本题组不调和不同体系、不复现其自测，也没有向Kibbe、体型比例或专业咨询结果的换算。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "What the current edition can substantiate",
      "zh": "当前版本能够支持怎样的解释"
    },
    "paragraphs": [
      {
        "en": "The original bank and arithmetic support checking which descriptions you rated and how their means were formed. This edition has no established norms, reliability estimates, factor-structure evidence or validated diagnostic or styling thresholds. It has not established that these groups identify stable anatomical categories.",
        "zh": "原创题组与算术规则支持核对评了哪些描述、均值如何形成。本版本尚无常模、信度估计、因素结构证据或经验证的诊断与造型阈值，也未建立这些分组能够识别稳定解剖类别的证据。"
      },
      {
        "en": "English and Chinese describe the same intended observations and use the same rules, but editorial alignment is not evidence of measurement equivalence. Repeating the form can produce a different self-report; without measurement-error and repeatability evidence, a changed mean cannot establish a physical change or a more accurate type.",
        "zh": "中英文描述相同设计观察内容，使用相同规则，但编辑对齐不是测量等值证据。再次作答可以产生不同的自报记录；缺少测量误差与重复性证据时，均值变化不能证明身体变化或更准确的类型。"
      }
    ]
  },
  {
    "id": "clothing-choice",
    "title": {
      "en": "Keep observation, clothing preference and actual fit distinct",
      "zh": "区分轮廓观察、服装喜好与实际合身"
    },
    "paragraphs": [
      {
        "en": "A remembered outline is different from liking a garment’s colour, line or material, and different again from how a particular garment fits and feels. No group mean prescribes a wardrobe, purchase or change to your body. You may keep a description that feels useful and disregard one that does not.",
        "zh": "记忆中的轮廓不同于喜欢一件衣服的颜色、线条或材质，也不同于某件衣服实际穿着是否合身舒适。任何一组均值都不规定衣橱、购买或身体改变；可以保留有帮助的描述，忽略不适用的描述。"
      },
      {
        "en": "If clothing taste is your question, the separate Outfit Line Preferences questionnaire describes preferences without converting these means. Reading it is optional. This page requests no images, measurements or private notes; answers remain in page memory with no drafts, quiz-flow statistics or personal-result sharing.",
        "zh": "若想了解服装喜好，可自愿阅读独立的服装线条偏好题本，两者均值不换算。本页不要求照片、测量或私人笔记；回答仅留页面内存，不保存草稿、不发送测试流程统计，也不分享个人结果。"
      }
    ]
  }
];
export const bodyFrameFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is 3 an uncertain answer?",
      "zh": "3表示不确定吗？"
    },
    "answer": {
      "en": "No. It means the description fits somewhat. Choose Unscored if you cannot judge.",
      "zh": "不是。3表示部分符合，无法判断时应选未评分。"
    }
  },
  {
    "question": {
      "en": "Why does 5, 5, Unscored, Unscored show no mean?",
      "zh": "为什么5、5与两个未评分没有均值？"
    },
    "answer": {
      "en": "Each group needs three numeric ratings. Two ratings do not meet that display requirement.",
      "zh": "每组需要三条数字评分，两条没有达到展示要求。"
    }
  },
  {
    "question": {
      "en": "Does 4 / 5 mean an 80% body type?",
      "zh": "4 / 5是80%的身体类型吗？"
    },
    "answer": {
      "en": "No. It is a mean of the rated descriptions, not a type proportion or population percentile.",
      "zh": "不是。它是已评分描述的均值，不是类型占比或人群百分位。"
    }
  },
  {
    "question": {
      "en": "Can several groups describe the same familiar view?",
      "zh": "多个分组可以描述同一个熟悉视角吗？"
    },
    "answer": {
      "en": "Yes. The groups are nonexclusive and are not forced into one winner.",
      "zh": "可以。分组不互斥，不强选一个赢家。"
    }
  },
  {
    "question": {
      "en": "Should I check a mirror to finish an unclear item?",
      "zh": "描述不清时需要照镜核对才能完成吗？"
    },
    "answer": {
      "en": "No. Use an already familiar comfortable view, leave the item unscored or leave the exercise.",
      "zh": "不需要。使用已有熟悉且舒服的印象即可，也可以选未评分或离开练习。"
    }
  },
  {
    "question": {
      "en": "Are these professional styling categories?",
      "zh": "这些是专业造型类别吗？"
    },
    "answer": {
      "en": "No. They are original descriptive groups with no conversion to Straight, Wave, Natural or another system.",
      "zh": "不是。它们是原创描述组，不能换算为Straight、Wave、Natural或其他体系。"
    }
  },
  {
    "question": {
      "en": "Can retaking demonstrate a change in my bones?",
      "zh": "重测能证明骨骼变化吗？"
    },
    "answer": {
      "en": "No. This is a self-report of familiar impressions, without skeletal measurement or established change thresholds.",
      "zh": "不能。这是熟悉印象的自报，没有骨骼测量或已建立的变化阈值。"
    }
  },
  {
    "question": {
      "en": "Must I agree or upload anything before starting?",
      "zh": "开始前需要勾选同意或上传资料吗？"
    },
    "answer": {
      "en": "No. Start test opens the first statement directly. No image or measurement input is requested.",
      "zh": "不需要。点击开始测试直接进入第一条，不要求输入图像或测量资料。"
    }
  }
];

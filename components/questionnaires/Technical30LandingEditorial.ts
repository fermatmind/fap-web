import type { Questionnaire } from "@/lib/questionnaires/types";

export const technical30LandingSections: Questionnaire["guide"] = [
  {
    "id": "technical-purpose",
    "title": {
      "en": "Science and technical practice: five distinct learning tasks",
      "zh": "科学与技术练习：五类不同的学习任务"
    },
    "paragraphs": [
      {
        "en": "Work through thirty original English questions, six in each of general science, mechanical models, electric circuits, auto/shop knowledge and written assembly. Both interfaces keep the English stems and options; instructions, explanations and five complete guides are bilingual. You can read every public guide before answering and review every solution after all five parts close.",
        "zh": "练习三十道原创英文题：普通科学、机械模型、电路基础、汽车与车间常识、文字组装各六题。两种界面保留英文题干及选项，操作、解析与五篇完整指南为双语。公开指南答前可读，五部分结束后可复盘全部解答。"
      },
      {
        "en": "These topics complement the separate four-area arithmetic and English practice rather than extending its count into an AFQT score. This is a fixed short learning bank, not a complete ASVAB form or a calibrated technical aptitude measure. Its value is in inspecting the stated conditions, reasoning through an answer and identifying a bounded next learning step.",
        "zh": "这些主题补充另一套算术与英语四领域练习，不会把两套正确数合成AFQT成绩。本页为固定短学习题本，不是完整ASVAB题式或经校准的技术能力测量。重点是核查题述条件、推理解答，并找出具体有限的下一步学习内容。"
      }
    ]
  },
  {
    "id": "technical-science",
    "title": {
      "en": "General science: distinguish a definition, a model and a mechanism",
      "zh": "普通科学：区分定义、模型与机制"
    },
    "paragraphs": [
      {
        "en": "Some questions provide a definition to use, such as acceleration as net force divided by mass or density as mass divided by volume. Write the quantities with units before substituting. A new paper example with a 30 N net force and 6 kg mass gives 30÷6=5 m/s² under that model. The calculation follows the stated net force, not a guess about friction that the question never supplies.",
        "zh": "有些题给出可使用的定义，例如加速度为合力除以质量，密度为质量除以体积。代入前先写出量及单位。换一个纸上例子，合力30 N、质量6 kg，按该模型得到30÷6=5 m/s²。计算依据明示合力，不猜测题目没有提供的摩擦信息。"
      },
      {
        "en": "Other questions ask about a scientific mechanism or concept: oxygen transport, the carbon source for photosynthesis, lunar illumination or evaporation. Learn what the selected term explains, not only its letter. The linked science sources support specific factual background; answering one item does not establish comprehensive knowledge of biology, astronomy or physical science.",
        "zh": "另一些题询问科学机制或概念：氧运输、光合作用的碳来源、月球照明或蒸发。学习所选术语解释什么，不只记选项字母。链接的科学资料支持具体事实背景，答对一题不确立对生物、天文或物理科学的全面掌握。"
      }
    ]
  },
  {
    "id": "technical-mechanics",
    "title": {
      "en": "Mechanical models: identify the ideal assumptions first",
      "zh": "机械模型：先识别理想假设"
    },
    "paragraphs": [
      {
        "en": "Lever, pulley, gear, ramp and hydraulic problems depend on explicitly stated assumptions. Identify a perpendicular lever arm, equal rope tensions, tooth counts, frictionless motion or piston areas as appropriate. In a fresh ideal lever example, a 40 N load at 0.3 m is balanced by an opposing effort at 0.6 m: equal moments give 20 N. This concerns a model, not a real lifting recommendation.",
        "zh": "杠杆、滑轮、齿轮、斜面与液压题依赖明示假设，分别识别垂直力臂、相等绳张力、齿数、无摩擦或活塞面积。换一个理想杠杆例子，40 N负载位于0.3 m力臂，对侧施力臂0.6 m，按力矩相等得20 N。这是模型计算，不是真实起重建议。"
      },
      {
        "en": "Check which quantity is requested: a speed magnitude differs from rotation direction, and constant velocity differs from zero force in every direction. Trace the defined forces and relationships rather than adding unstated mechanisms. Real systems may include losses, masses, friction, deformation and operating constraints outside these simplified questions.",
        "zh": "核查所求量：速度大小不同于转动方向，恒速也不表示每个方向都没有力。追踪题目定义的力及关系，不添加未说明的机构。真实系统可能包含损耗、质量、摩擦、形变及这些简化题之外的工作限制。"
      }
    ]
  },
  {
    "id": "technical-circuits",
    "title": {
      "en": "Electric circuits: follow connections, quantities and units",
      "zh": "电路基础：追踪连接、物理量与单位"
    },
    "paragraphs": [
      {
        "en": "The circuit questions use stated ideal relationships such as I=V/R and P=VI, plus series and parallel resistance. Identify how components connect before choosing an equation. For a fresh ideal 18 V source across a 9 ohm resistor, I=18÷9=2 A. Adding two resistance values applies to series, not automatically to parallel branches.",
        "zh": "电路题使用明示理想关系，例如I=V/R与P=VI，以及串联、并联电阻。选择方程前先识别连接方式。换一个理想18 V电源接9欧电阻的例子，I=18÷9=2 A。把两个电阻值直接相加适用于串联，不自动适用于并联支路。"
      },
      {
        "en": "An open switch in a single ideal loop and a changed voltage with fixed ohmic resistance are different problems. Read what remains fixed and whether another path exists. These are paper models: a correct response does not verify wiring, safe isolation, instrument use or permission to work on equipment. Do not build or test a circuit to answer the page.",
        "zh": "单一理想回路中的断开开关，与固定欧姆电阻下改变电压，是不同问题。读清哪些量固定、是否存在另一条路径。这些是纸上模型，答对不核实接线、安全隔离、仪表使用或设备作业资格，不需要搭建或测试电路来回答。"
      }
    ]
  },
  {
    "id": "technical-auto-spatial",
    "title": {
      "en": "Auto/shop knowledge and written assembly need different review",
      "zh": "汽车车间常识与文字组装需要不同复盘"
    },
    "paragraphs": [
      {
        "en": "Auto/shop items concern the named role of a part, a supplied engine sequence and paper measurement. Distinguish ignition, exhaust and power transmission instead of treating every component as interchangeable. A unit conversion or tick-interval question requires the stated scale; count intervals between marks rather than assuming the number of visible marks equals the distance.",
        "zh": "汽车车间题关注部件用途、给出的发动机顺序及纸上测量。区分点火、排气与动力传递，不把各部件混为一谈。单位换算与刻度间距题依赖明示比例，应数标记之间的间隔，不把标记数量直接当作距离。"
      },
      {
        "en": "Written assembly uses coordinates and explicit translation, folding, cube-roll or projection rules. Draw a small table or sketch, update the labels after each allowed move and count distinct projected cells only once. Reading these English rules and applying coordinates is not the same task as choosing an official picture-based Assembling Objects answer; no visual-subtest equivalence is established.",
        "zh": "文字组装使用坐标及明确的平移、折叠、立方体滚动或投影规则。可画小表或草图，每次允许的移动后更新标签，投影单元只对不同位置计一次。阅读英文规则并操作坐标，与选择正式图形组装答案不是同一任务，未建立图形分测验等值。"
      }
    ]
  },
  {
    "id": "technical-timing",
    "title": {
      "en": "Five parts: separate starts, deadlines and unanswered items",
      "zh": "五部分：独立开始、截止与未答"
    },
    "paragraphs": [
      {
        "en": "Choose timed practice or untimed study before starting. Site-selected caps are 3:00, 4:00, 4:00, 3:00 and 5:00, totalling nineteen active minutes. About twenty-four minutes includes instructions and is an estimate. The first Start test opens question one; later parts wait for their own explicit start so transition reading does not consume the next clock. No additional agreement is required.",
        "zh": "开始前选择计时或不计时。本站上限依次为3:00、4:00、4:00、3:00及5:00，活动时间共十九分钟。约二十四分钟包含说明，是预估。首个开始测试直接打开第一题，后续各部分独立启动，避免过渡阅读占用下一段时间，不要求额外点击同意。"
      },
      {
        "en": "Within an open part you can go back, edit, explicitly leave a question unanswered or finish early. Closing or expiry locks the part and leaves blanks unanswered. Background tabs do not pause the active timer; inconsistent device clocks clear the attempt. Paper, sketches and a calculator are allowed here, so these modes do not reproduce official examination conditions or proctor tool use.",
        "zh": "开放部分内可返回、修改、明确留空或提前结束；关闭或到时后锁定，空白保留未答。切后台不暂停，设备时钟不一致时清除本次。本页允许纸笔、草图与计算器，因此两种模式都不复刻正式考试条件，也不监考工具使用。"
      }
    ]
  },
  {
    "id": "technical-counts",
    "title": {
      "en": "Thirty local counts are not an AFQT or job qualification",
      "zh": "三十题本地计数不等于AFQT或岗位资格"
    },
    "paragraphs": [
      {
        "en": "A correct selected option adds one correct count; another selected option adds one wrong count. A skip or untouched question is unanswered. Four correct, one wrong and one unanswered account for all six items in a part. Across five parts, the counts account for thirty. No guessing correction, speed bonus, weighted composite or passing band is applied.",
        "zh": "选对记一个正确，选其他有效选项记一个错误，跳过或未触及记一个未答。一部分四题正确、一题错误、一题未答，共六题；五部分共三十题。不做猜测校正、速度奖励、加权综合或通过分档。"
      },
      {
        "en": "Official AFQT reporting uses AR, WK, PC and MK, not these five topic counts. This bank has no established norming, calibration, reliability, predictive validity or cross-form equivalence. The parts also have not been equated for difficulty: fewer correct answers in one part do not diagnose a weakness, identify a suitable military job or establish safe practical competence.",
        "zh": "正式AFQT报告使用AR、WK、PC与MK，不使用这五组主题计数。本题本尚未建立常模、校准、信度、预测效度或跨题本等值，各组也未做难度等值。某组正确数较少，不诊断弱项、不识别合适军职，也不确立安全实操能力。"
      }
    ]
  },
  {
    "id": "technical-review",
    "title": {
      "en": "Review a method, try a new example and keep the attempt private",
      "zh": "复盘方法、换例练习与私人作答"
    },
    "paragraphs": [
      {
        "en": "After all five parts close, review every selected response, key and bilingual explanation, including unanswered items. Identify whether the obstacle was a term, an assumption, a unit, a calculation or a spatial update. Reconstruct the reasoning, then change a number or arrangement on paper. Recognizing a fixed answer on a later attempt is not evidence of transfer to a new problem.",
        "zh": "五部分结束后复盘全部所选、答案键与双语解析，包括未答题。区分障碍来自术语、假设、单位、计算或空间更新。重建推理后，在纸上改变数字或排列。之后认出固定答案，不证明能迁移到新问题。"
      },
      {
        "en": "You may stop after reading without taking action, registering or sharing. Responses and counts stay in page memory and clear on refresh, leaving, changing language or restarting. Public sharing copies the five general guide links without answers, counts, mode or elapsed times. Official and educational links below support defined facts and boundaries, not endorsement or validation of this original bank.",
        "zh": "可以读完结束，不行动、不注册、不分享。回答与计数留在页面内存，刷新、离开、换语言或重测清除。公开分享只复制五篇通用指南链接，不包含回答、数量、模式或用时。下方官方与教育资料支持特定事实及边界，不代表本原创题本获得背书或验证。"
      }
    ]
  }
];

export const technical30LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does Start test open the first question directly?",
      "zh": "开始测试直接打开第一题吗？"
    },
    "answer": {
      "en": "Yes. Choose a mode and begin without an agreement screen. Later parts have independent start buttons to begin their own timers, not consent gates.",
      "zh": "会。选好模式直接开始，没有同意确认页。后续部分的开始按钮用于启动各自计时，不是授权门槛。"
    }
  },
  {
    "question": {
      "en": "Are these five topic counts added to an AFQT estimate?",
      "zh": "五组计数会相加估算AFQT吗？"
    },
    "answer": {
      "en": "No. Official AFQT uses arithmetic reasoning, word knowledge, paragraph comprehension and mathematics knowledge. The thirty technical items produce only local correct, wrong and unanswered counts.",
      "zh": "不会。正式AFQT使用算术推理、词汇知识、段落理解与数学知识。这三十道技术题只产生本地正确、错误与未答数。"
    }
  },
  {
    "question": {
      "en": "Does written assembly reproduce the official visual task?",
      "zh": "文字组装复现正式图形任务了吗？"
    },
    "answer": {
      "en": "No. Our coordinates, written transformations and labelled cube rules create a different learning task. Their scores have no established equivalence to official Assembling Objects results.",
      "zh": "没有。坐标、文字变换及标签立方体规则构成不同学习任务，其计数未与正式物体拼合结果建立等值。"
    }
  },
  {
    "question": {
      "en": "Can I use a calculator or a sketch?",
      "zh": "可以用计算器或草图吗？"
    },
    "answer": {
      "en": "Yes, this practice explicitly permits paper, sketches and a calculator. That permission belongs to this page and should not be taken as the official exam’s tool policy.",
      "zh": "可以。本练习明确允许纸笔、草图与计算器，这是本页规则，不应当作正式考试的工具政策。"
    }
  },
  {
    "question": {
      "en": "Does the lowest count identify my weakest ability?",
      "zh": "正确数最低就说明该能力最弱吗？"
    },
    "answer": {
      "en": "No. Each part has only six fixed items and the parts are not difficulty-equated. Review the actual questions and reasoning instead of ranking abilities from those counts.",
      "zh": "不能。各组只有六道固定题，组间未做难度等值。应复盘具体题目与推理，不按计数排列能力高低。"
    }
  },
  {
    "question": {
      "en": "Do ideal-model answers establish equipment competence?",
      "zh": "理想模型答对能证明设备操作能力吗？"
    },
    "answer": {
      "en": "No. Selecting a paper answer does not observe safe operation, practical training or equipment-specific judgement. No physical experiment is required to complete this activity.",
      "zh": "不能。选择纸上答案不观察安全操作、实操训练或具体设备判断；完成活动也不要求进行实体实验。"
    }
  },
  {
    "question": {
      "en": "What if I leave all questions unanswered?",
      "zh": "全部留空会怎样？"
    },
    "answer": {
      "en": "Explicitly finish the five parts and the result records thirty unanswered items, without inventing selected wrong answers. Every solution and all five guides remain free.",
      "zh": "明确结束五部分后，记录三十题未答，不虚构为已选错误。全部解答与五篇指南仍免费开放。"
    }
  },
  {
    "question": {
      "en": "Does switching language preserve the current attempt?",
      "zh": "换语言会保留本次答卷吗？"
    },
    "answer": {
      "en": "No. Language change clears the attempt. The English questions stay the same in either interface; instructions, explanations and full guides use the selected language.",
      "zh": "不会。换语言会清除本次。两种界面的英文题目保持相同，说明、解析及完整指南使用所选语言。"
    }
  }
];

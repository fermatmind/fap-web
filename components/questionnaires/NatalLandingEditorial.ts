import type { Questionnaire } from "@/lib/questionnaires/types";

export const natalLandingSections: Questionnaire["guide"] = [
  {
    "id": "natal-context-map",
    "title": {
      "en": "Birth chart calculator: positions first, interpretations second",
      "zh": "出生星盘计算器：先看位置，再读解释"
    },
    "paragraphs": [
      {
        "en": "A natal chart records calculated positions for a specified instant and location. Here the ten bodies are the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto. The ascendant is the eastern intersection of the ecliptic and local horizon, not an eleventh body. A chart combines these different kinds of information; a Sun sign alone does not supply the other placements.",
        "zh": "出生星盘记录指定时刻与地点条件下的计算位置。本页十天体为太阳、月亮、水星、金星、火星、木星、土星、天王星、海王星与冥王星。上升点是黄道与当地地平线的东方交点，不是第十一个天体。星盘组合了不同性质的信息；仅有太阳星座，不能补出其他落点。"
      },
      {
        "en": "The calculation uses apparent geocentric tropical longitudes of date. Astronomy Engine supplies the astronomical functions; the page separately applies its disclosed sign, house and reading conventions. Reproducing coordinates checks a calculation, whereas establishing a personality claim would require separate evidence. Symbolic descriptions are offered as cultural reading and optional reflection, not as measured psychological findings. [1]",
        "zh": "计算采用日期当时的地心视位置与回归黄道经度。Astronomy Engine提供天文函数，本页另按已说明的星座、宫位与解读规则呈现。复现坐标可以核对计算；要成立人格主张，则需要另一类证据。符号说明用于文化阅读与自愿反思，不作为测得的心理学结论。[1]"
      }
    ]
  },
  {
    "id": "natal-context-time",
    "title": {
      "en": "Local birth time, UTC and daylight-saving ambiguity",
      "zh": "当地出生时间、UTC与夏令时歧义"
    },
    "paragraphs": [
      {
        "en": "A clock reading needs a time-zone rule before it identifies an instant. Enter an IANA identifier such as Europe/London rather than today’s numeric offset. For example, 08:30 in London on June 15, 2001 resolves to 07:30 UTC. Longitude does not determine which civil clock rules a jurisdiction used, and the browser’s current zone does not establish the birth location’s historical zone. [2]",
        "zh": "钟表读数需要配合时区规则，才能确定一个实际时刻。请输入Europe/London等IANA标识，而不是今天的数字偏移。例如2001年6月15日伦敦08:30对应UTC的07:30。经度不能决定某地采用过哪些民用时钟规则；浏览器当前时区，也不能证明出生地的历史时区。[2]"
      },
      {
        "en": "Some clock readings occur twice or do not occur at all. In America/New_York, November 7, 2021 at 01:30 can mean 05:30 or 06:30 UTC; choose the occurrence supported by the record. March 14, 2021 at 02:30 falls in a skipped interval and is rejected. Temporal resolves the alternatives; it cannot recover missing historical information. Pre-1970 records deserve extra checking because the time-zone database has uneven historical coverage. [2]",
        "zh": "有些钟表时间出现两次，有些根本没有发生。America/New_York的2021年11月7日01:30可能对应UTC的05:30或06:30，应按原始记录选择。2021年3月14日02:30处于跳过区间，本页会拒绝计算。Temporal可以解析这些选项，不能找回缺失的历史信息。1970年以前的记录还需额外核对，因为时区数据库的历史覆盖并不均匀。[2]"
      }
    ]
  },
  {
    "id": "natal-context-location",
    "title": {
      "en": "Coordinates, known time and unavailable results",
      "zh": "坐标、已知时间与无法生成的结果"
    },
    "paragraphs": [
      {
        "en": "Latitude and longitude locate the horizon used for the ascendant and related calculations. North and east use positive values; south and west use negative values. A reference point is a labeled approximation, not an address lookup or verified birth site. Check both the coordinates and the IANA zone before calculation; their confirmation is an input-quality check, not permission to collect or store a chart.",
        "zh": "纬度与经度确定上升点等计算使用的当地地平线；北纬、东经为正，南纬、西经为负。参考点是明确标注的地点近似，不是地址查询，也没有核实实际出生地点。计算前需核对坐标与IANA时区；表单中的核对项用于检查输入，不是授权收集或保存星盘。"
      },
      {
        "en": "This version requires a known time and a Gregorian date from 1900 through the current instant. It does not replace unknown time with noon. At a geometrical singularity, a horizon-dependent value may be unavailable while the ten body positions remain readable. Keep that missing value visible as missing; selecting a plausible rising sign by its description cannot repair the input or the geometry.",
        "zh": "本版本需要已知出生时刻，支持1900年起至当前时刻之间的公历日期，不用中午替代未知时间。遇到几何奇异情形时，依赖地平线的数值可能不可用，而十天体位置仍可阅读。应保留缺失状态；凭描述挑选一个“像自己”的上升星座，不能修复输入或几何条件。"
      }
    ]
  },
  {
    "id": "natal-context-sectors",
    "title": {
      "en": "Tropical signs and whole-sign houses: a worked example",
      "zh": "回归黄道与整宫制：用算例读懂星座和宫位"
    },
    "paragraphs": [
      {
        "en": "The tropical zodiac divides longitude into twelve equal 30-degree sectors, starting at the March equinox. These sectors are a coordinate convention, not the unequal boundaries of astronomical constellations. A sign names the sector; a body names what is located there. Read their combination without treating repeated sign names as repeated measurements of the same trait.",
        "zh": "回归黄道从春分点开始，把黄经分为十二个相等的30度区段。这是坐标划分规则，不是天文学星座那些大小不一的边界。星座名称标识区段，天体名称标识落在其中的对象。阅读两者组合时，不把同一星座反复出现解释为同一人格特质被重复测量。"
      },
      {
        "en": "Whole-sign houses place the entire rising-sign sector in house one and number the remaining sectors in order. As a hypothetical example, an ascendant at 290 degrees is in Capricorn: Aries becomes house four, so a body at 5 degrees is in house four. MC is calculated separately and is not automatically the tenth-house boundary in this system. An empty house means none of the ten listed bodies occupies that sector; its life theme has not disappeared.",
        "zh": "整宫制把上升星座的整个区段作为第一宫，其余区段依次编号。假设上升黄经为290度，位于摩羯座，则白羊座为第四宫，黄经5度的天体落第四宫。天顶MC另行计算，在这套宫制中不会自动成为第十宫的起点。空宫只表示所列十天体没有落入该区段，不表示某个生活主题不存在。"
      }
    ]
  },
  {
    "id": "natal-context-precision",
    "title": {
      "en": "Degree display and aspect orbs are different rules",
      "zh": "度数显示与相位容许度，是两项不同规则"
    },
    "paragraphs": [
      {
        "en": "Signs are selected from the unrounded longitude before the within-sign degree is truncated to one decimal place. Thus 29.99 degrees displays as Aries 29.9 degrees, while 30.01 displays as Taurus 0.0 degrees. This prevents display rounding from moving a body into the next sign. A decimal place is a display choice, not a guarantee about the accuracy of a birth record, a model or an interpretation.",
        "zh": "先由未取整黄经确定星座，再把星座内度数截断至一位小数。因此29.99度显示为白羊座29.9度，30.01度显示为金牛座0.0度，避免显示舍入把天体移入下一星座。一位小数是显示方式，不保证出生记录、计算模型或解释的准确程度。"
      },
      {
        "en": "The ten bodies produce 45 distinct pairs. This page checks conjunction, sextile, square, trine and opposition at 0, 60, 90, 120 and 180 degrees, using one disclosed inclusive orb of 8 degrees. In a hypothetical pair at 10 and 78 degrees, the 68-degree separation qualifies as a sextile with an 8-degree orb; at 78.01 it does not. Selection uses unrounded values. Other calculators can adopt other orbs; neither convention establishes a probability of an event.",
        "zh": "十天体共有45个不重复配对。本页检查合、六合、刑、拱与冲，对应0、60、90、120与180度，统一采用包含边界的8度容许度。假设一对落点在10度和78度，间隔68度，以偏离8度计入六合；改为78.01度则不计入。筛选使用未取整数值。其他工具可能采用不同容许度；这些规则都不是事件发生概率。"
      }
    ]
  },
  {
    "id": "natal-context-motion",
    "title": {
      "en": "Retrograde motion, angles and mathematical points",
      "zh": "视逆行、角点与数学点，分别是什么"
    },
    "paragraphs": [
      {
        "en": "Apparent retrograde describes a change in a planet’s observed direction against the sky, not a reversal of its physical orbit. NASA explains the effect through the relative motion of Earth and the planet. This page estimates longitude speed over two sampling intervals and can retain an unavailable label near inconsistent classifications. A numerical station threshold is not evidence of communication failures or another predicted event. [3]",
        "zh": "视逆行描述行星在天空背景中的视运动方向变化，不表示实体轨道突然反转。NASA用地球与行星的相对运动解释这一现象。本页以两个采样间隔估计黄经速度；分类不一致时可以保留不可用状态。数值上的留站阈值，不是沟通失败或其他事件将发生的证据。[3]"
      },
      {
        "en": "ASC, DSC, MC and IC are geometrical angles. The lunar nodes describe an orbital-plane intersection; this page’s Black Moon Lilith is a two-body osculating apogee model, and its Lot of Fortune is a calculated expression using the day or night rule. These are distinct definitions, not extra planets. They do not enter the ten-body element or modality counts. Compare the stated model before comparing two calculators’ labels.",
        "zh": "ASC、DSC、MC与IC是几何角点；月交点描述轨道平面的交点。本页的黑月莉莉丝采用二体瞬时轨道远地点模型，福点采用区分昼夜的计算表达式。它们定义不同，不是新增行星，也不进入十天体的元素或性质计数。比较两种工具的标签前，应先比较所采用的模型。"
      }
    ]
  },
  {
    "id": "natal-context-reading",
    "title": {
      "en": "Read the table before choosing a symbolic portrait",
      "zh": "先读落点表，再选择符号解释"
    },
    "paragraphs": [
      {
        "en": "Start with the resolved UTC instant, zone and coordinates, then inspect each body’s sign, within-sign degree and whole-sign house. Next read the Sun, Moon and rising sections as different symbolic roles; the same sign text has a different role depending on its placement. The twelve public guides remain available without personal input, so you can understand the vocabulary before calculating.",
        "zh": "先核对解析后的UTC时刻、时区与坐标，再查看各天体的星座、星座内度数与整宫制宫位。随后把太阳、月亮与上升作为不同的符号角色阅读；同一星座在不同落点中承担不同角色。十二篇公开指南无需个人输入即可阅读，可以先理解词汇再计算。"
      },
      {
        "en": "Element and modality totals each count ten bodies once. They summarise this inventory, rather than giving a psychological score, a measured concentration or a population percentile. If a cultural description interests you, write down a concrete example and a counterexample from daily life. Agreement with an appealing portrait is not independent evidence that a birth position caused that behaviour.",
        "zh": "元素与性质各对十天体计数一次，概括的是这份落点清单，不是心理分数、测得的特质浓度或人群百分位。某段文化描述让你有兴趣时，可以写下日常生活中一个符合与一个不符合的实例。对一篇吸引人的画像表示认同，并不是出生位置导致该行为的独立证据。"
      }
    ]
  },
  {
    "id": "natal-context-compare",
    "title": {
      "en": "Compare methods and keep birth information private",
      "zh": "比较计算口径，并保护出生资料"
    },
    "paragraphs": [
      {
        "en": "When outputs differ, compare the local date and time, resolved UTC instant, zone rule, coordinates, tropical or sidereal frame, house system, body selection, point model, aspect orb and display rounding in that order. Correcting an input is different from changing a convention. More displayed decimal places or a more confident interpretation does not by itself demonstrate a better calculation or stronger evidence.",
        "zh": "结果不同时，依次比较当地日期与时间、解析后的UTC、时区规则、坐标、回归或恒星黄道、宫制、天体集合、数学点模型、相位容许度与显示舍入。纠正输入与改变规则是两件事。显示更多小数，或使用更肯定的解读语气，本身都不能证明计算更好或证据更强。"
      },
      {
        "en": "Calculation runs in the current browser and the page keeps birth inputs in memory only. Editing inputs invalidates the displayed chart; clearing or reloading removes it. The copy action shares only the public calculator and twelve guide URLs, without birth details or calculated placements. Optional anonymous activity measurement remains off unless selected and does not receive these private inputs. Do not use a symbolic chart as the deciding evidence for treatment, employment or a relationship.",
        "zh": "计算在当前浏览器运行，出生资料只保存在页面内存；修改输入会使已显示星盘失效，清除或刷新会移除它。复制功能只提供公开计算器和十二篇指南网址，不含出生资料或计算落点。可选匿名使用统计默认关闭，也不接收这些私人输入。符号星盘不应成为治疗、录用或关系决策的决定性证据。"
      }
    ]
  }
];

export const natalLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is a birth chart a psychological test?",
      "zh": "出生星盘是心理测试吗？"
    },
    "answer": {
      "en": "It calculates sky coordinates and adds cultural interpretations. There are no personality questions, validated trait scores or population norms in this calculator. Astronomical reproducibility and evidence for a psychological interpretation are separate questions.",
      "zh": "本工具计算天文坐标并附文化解释，没有人格题目、经过验证的特质分数或人群常模。天文计算可复现，与心理解释是否有证据，是两个问题。"
    }
  },
  {
    "question": {
      "en": "Does this use tropical signs or astronomical constellations?",
      "zh": "这里使用回归黄道星座，还是天文学星座？"
    },
    "answer": {
      "en": "Twelve equal tropical sectors of 30 degrees, beginning at the March equinox. They are not the unequal constellation boundaries. A sidereal calculation uses a different reference convention and should not be compared as though its sign labels were identical.",
      "zh": "采用始于春分点、各30度的十二个回归黄道区段，不采用大小不一的天文学星座边界。恒星黄道采用另一种参考规则，比较时不能假定标签口径相同。"
    }
  },
  {
    "question": {
      "en": "Why must I confirm coordinates and time zone?",
      "zh": "为什么需要核对坐标与时区？"
    },
    "answer": {
      "en": "The horizon depends on location and the UTC instant depends on the time-zone rule. A reference point is approximate. The checkbox checks those inputs; it does not enable analytics, save a chart or require a second agreement before opening the calculator.",
      "zh": "地平线计算依赖地点，UTC时刻依赖时区规则；参考点只是近似。核对项用于检查这些输入，不开启统计、不保存星盘，也不是打开计算器前的第二次协议确认。"
    }
  },
  {
    "question": {
      "en": "What if my birth minute occurs twice?",
      "zh": "出生的那个分钟发生两次怎么办？"
    },
    "answer": {
      "en": "The calculator displays the two UTC instants with their offsets. Choose the occurrence supported by the original record, then calculate. A description that feels accurate cannot identify the correct occurrence. A skipped local minute must be corrected rather than automatically shifted.",
      "zh": "计算器会列出带偏移的两个UTC时刻；按原始记录选择后再计算。描述读起来准确，不能确定正确的那一次。落在跳时区间的当地分钟需要核对修正，不会自动平移。"
    }
  },
  {
    "question": {
      "en": "Is MC always the tenth-house cusp?",
      "zh": "天顶MC一定是第十宫宫头吗？"
    },
    "answer": {
      "en": "Not in this whole-sign calculation. House one is the entire ascendant-sign sector, while MC is found geometrically on the upper meridian. Compare both the angle and the stated house system.",
      "zh": "在本页整宫制中不是。第一宫是上升星座的整个区段，MC则按上子午圈的几何条件求得；应同时核对角点与宫制。"
    }
  },
  {
    "question": {
      "en": "Why do element and modality totals each add up to ten?",
      "zh": "为什么元素和性质各合计十个？"
    },
    "answer": {
      "en": "Each counts the Sun through Pluto once. Ascendant, other angles, nodes, Lilith and Fortune are excluded. These totals describe the selected astronomical inventory and do not measure temperament, ability or the strength of a personality trait.",
      "zh": "两项统计都对太阳至冥王星各计一次，不计上升、其他角点、交点、莉莉丝与福点。它们描述选定的天体清单，不测气质、能力或人格特质强弱。"
    }
  },
  {
    "question": {
      "en": "Does a displayed tenth of a degree guarantee accuracy?",
      "zh": "显示到0.1度就保证准确吗？"
    },
    "answer": {
      "en": "No. Display truncation, astronomical approximation, birth-record uncertainty and interpretive validity are different issues. Sign selection and aspect inclusion use unrounded values; the displayed decimal does not supply a calibrated uncertainty interval.",
      "zh": "不能。显示截断、天文近似、出生记录不确定性与解释效度属于不同问题。星座归属和相位筛选使用未取整数值，显示的小数不构成经过校准的不确定区间。"
    }
  },
  {
    "question": {
      "en": "Can I share my calculated placements with the copy button?",
      "zh": "复制按钮会分享我的计算落点吗？"
    },
    "answer": {
      "en": "No. It copies only public entry and guide URLs. No birth details, signs, degrees or house placements are inserted into those links. Read the result privately; use Clear input and result when finished.",
      "zh": "不会。它只复制公开入口和指南网址，不把出生资料、星座、度数或宫位写入链接。结果可私下阅读，结束后可以点击清除输入与结果。"
    }
  }
];

export const natalLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Astronomy Engine: astronomical functions and testing",
      "zh": "Astronomy Engine：天文函数与验证说明"
    },
    "url": "https://github.com/cosinekitty/astronomy/blob/master/README.md"
  },
  {
    "title": {
      "en": "Temporal: time zones and resolving ambiguous clock times",
      "zh": "Temporal：时区与歧义钟表时间解析"
    },
    "url": "https://tc39.es/proposal-temporal/docs/timezone.html"
  },
  {
    "title": {
      "en": "NASA StarChild: apparent retrograde motion",
      "zh": "NASA StarChild：视逆行的天文学解释"
    },
    "url": "https://starchild.gsfc.nasa.gov/docs/StarChild/questions/question46.html"
  }
];

import type { Questionnaire } from "@/lib/questionnaires/types";
export const nakshatraSections: Questionnaire["guide"] = [
  {
    "id": "overview",
    "title": {
      "en": "Nakshatra, birth star and pada: what the calculator identifies",
      "zh": "Nakshatra、出生宿与四分区：计算器识别什么"
    },
    "paragraphs": [
      {
        "en": "Janma nakshatra, often translated as birth star or lunar mansion, names the sector containing the Moon at a birth instant under a specified zodiac convention. The 27-sector scheme divides 360° into equal spans of 13°20′; each span has four padas of 3°20′. These are divisions of longitude, not 27 equal physical constellations or 27 stars measured in the sky. IMD describes the 27-sector framework. [1]",
        "zh": "Janma nakshatra常译为出生宿或出生星宿，指在指定黄道口径下，出生时刻月球所在的区段。27等分方案将360°分成每段13°20′，每段再分为四个3°20′的pada（四分区）。这是黄经划分，不是27个等大的实际星座，也不是测量天空中的27颗恒星。印度气象局资料介绍了这一27等分框架。[1]"
      },
      {
        "en": "This tool identifies a geometric Moon sector using its named Spica reference, then opens one complete cultural guide or two adjacent guides near a mansion boundary. It also displays the resolved UTC instant, time-zone offset, intermediate longitudes, within-sector position and pada. All 27 eight-section guides are available independently of calculation; there is no questionnaire, personality score or predicted life event.",
        "zh": "本工具按明确标注的角宿一参考口径识别几何月球区段，随后呈现一篇完整文化指南，或在宿边界附近同时呈现两篇相邻指南。结果还列出解析的UTC时刻、时区偏移、中间黄经、段内位置与四分区。全部27篇八节指南均可独立阅读；这里没有人格问卷、人格分数或人生事件预测。"
      }
    ]
  },
  {
    "id": "input-record",
    "title": {
      "en": "Birth records, historical time zones and daylight-saving changes",
      "zh": "出生记录、历史时区与夏令时变化"
    },
    "paragraphs": [
      {
        "en": "Enter the recorded local Gregorian date and known 24-hour birth time, then verify the birthplace’s IANA time zone for that date. Asia/Kolkata and America/New_York are zone identifiers; a present-day numeric UTC offset does not encode historical rule changes. A zone example is a convenience, not confirmation of a birth record. The supported local dates begin on January 1, 1900, and the resolved instant must not be later than the device clock.",
        "zh": "输入记录中的当地公历日期和已知的24小时制出生时间，再核对出生地在该日期适用的IANA时区。Asia/Kolkata、America/New_York是时区标识；当前的UTC数字偏移不能表达历史规则变化。下拉示例便于填写，不代表已核实出生记录。本工具支持从1900年1月1日起的当地日期，解析时刻须不晚于设备当前时刻。"
      },
      {
        "en": "A clock time skipped by a daylight-saving transition is rejected rather than shifted. A repeated local minute requires choosing its first or second occurrence from the record. Pre-1970 zone history may be incomplete. An unknown birth time produces no calculated label: there is no noon substitution, date-only estimate or personality-based selection. You can still read every public guide without entering personal data.",
        "zh": "夏令时跳时造成的不存在时刻会被拒绝，不自动平移；同一分钟重复出现时，需依据记录选择第一次或第二次。1970年前的时区历史可能不完整。出生时间未知时不生成计算标签：不代填中午、不作仅凭日期的估计，也不根据人格选择星宿；仍可不输入个人资料，直接阅读全部公开指南。"
      }
    ]
  },
  {
    "id": "geometry",
    "title": {
      "en": "From a UTC instant to a fixed-Spica reference longitude",
      "zh": "从UTC时刻到固定角宿一参考黄经"
    },
    "paragraphs": [
      {
        "en": "For the resolved instant, Astronomy Engine supplies a geometric geocentric Moon vector. The Moon and the fixed FK5 J2000 Spica catalogue direction are transformed into the same true ecliptic-of-date frame. The calculation is Lref = wrap(Lmoon − LSpica + 180°), with wrap returning an angle in [0°, 360°). Spica therefore defines the reference origin through its assigned 180° position. This describes this implementation rather than every nakshatra calculator. [2][3]",
        "zh": "对于解析得到的时刻，Astronomy Engine提供几何地心月球向量；月球与固定FK5 J2000角宿一目录方向一同转换到日期真黄道坐标系。计算为Lref = wrap(Lmoon − LSpica + 180°)，wrap将角度归入[0°，360°)。通过将角宿一参考位置置于180°来定义参考原点。这描述的是本工具实现，不代表所有出生宿计算器。[2][3]"
      },
      {
        "en": "The model holds Spica’s catalogue direction fixed and does not model its proper motion, binary orbital motion, aberration or parallax. It uses neither an observer’s topocentric Moon nor a certified exact Lahiri, Swiss True Chitra or IMD almanac solution. At one UTC instant a geocentric Moon direction is independent of birthplace; here the birthplace is needed through its historical zone, without an address, coordinates or location permission.",
        "zh": "本模型固定角宿一的目录方向，不模拟其自行、双星轨道运动、光行差或视差。它不采用观测者的站心月球位置，也不是经认证的精确Lahiri、Swiss True Chitra或印度气象局历书解。同一UTC时刻的地心月球方向与出生地点无关；本工具通过出生地历史时区换算时间，不需要地址、经纬度或定位许可。"
      }
    ]
  },
  {
    "id": "worked-division",
    "title": {
      "en": "A worked sector and pada example, before rounding",
      "zh": "先分区后显示：区段与四分区算例"
    },
    "paragraphs": [
      {
        "en": "With an unrounded reference longitude of 51.70°, the fourth sector, Rohini, runs from 40° inclusive to 53°20′ exclusive. The within-sector position is 11.70°; dividing it by 3°20′ and taking the integer part gives 3, so the pada is 4. This is an arithmetic illustration, not a claimed birth calculation or personal example. Exact division boundaries belong to the following division; 360° wraps to 0°.",
        "zh": "假设未舍入的参考黄经为51.70°，它位于第四段Rohini，范围从40°（含）到53°20′（不含）。段内位置为11.70°，除以3°20′后取整数部分得到3，因此属于第四分区。这只是分区算例，不是一次真实出生计算或个人示例。恰在分界的落点归入后一段；360°回到0°。"
      },
      {
        "en": "Classification uses full numerical precision; displayed angles are then truncated downward to two decimals. A displayed number should not be used to reverse an assignment made before truncation. The mansion and pada are positions in this convention, not percentages, test accuracy, confidence levels or measurements of a person’s qualities.",
        "zh": "归类使用完整数值精度，随后才将显示角度向下截取至两位小数。不能用截取后的显示值反推或推翻先前的归类。宿与四分区是本口径下的位置，不是百分比、测评准确率、置信水平或对个人素质的测量。"
      }
    ]
  },
  {
    "id": "boundary-reading",
    "title": {
      "en": "Why two guides may appear, and why calculators can disagree",
      "zh": "为什么会显示两篇，以及不同计算器为何有差异"
    },
    "paragraphs": [
      {
        "en": "A position within 0.25° of either mansion edge opens both adjacent complete readings. This fixed comparison window helps inspect a boundary; it is not a calibrated confidence interval, an error estimate or evidence of two personalities. Outside the window, a single displayed guide is still conditional on the birth record and the adopted calculation convention. The window concerns mansion edges, not every pada boundary.",
        "zh": "落点距任一宿边界不超过0.25°时，同时打开相邻两篇完整指南。这是便于比较边界的固定窗口，不是经过校准的置信区间、误差估计或两种人格的证据。窗口外只显示一篇，仍以出生记录和所用计算口径为条件。该窗口针对宿边界，不针对每个四分区边界。"
      },
      {
        "en": "When comparing tools, first align the local date, time, historical zone and repeated-time choice. Then compare the ayanamsa or reference model, geometric versus apparent position, geocentric versus topocentric origin and rounding. A different star name can follow from different inputs or definitions. Agreement on a label alone does not validate personality interpretation, and disagreement is not resolved by choosing the description that feels most flattering.",
        "zh": "比较工具时，先对齐当地日期、时间、历史时区及重复时刻选择；再比较岁差或参考模型、几何与视位置、地心与站心基点，以及舍入方法。名称不同可能来自输入或定义不同。标签相同本身不能验证人格解释；也不能靠选择更讨喜的描述来解决计算差异。"
      }
    ]
  },
  {
    "id": "traditional-vocabulary",
    "title": {
      "en": "Names, symbols, gana and Vimshottari rulers have different roles",
      "zh": "名称、符号、gana与Vimshottari主星各有含义"
    },
    "paragraphs": [
      {
        "en": "Each guide separates its traditional name, selected symbol variant, gana and Vimshottari ruler from FermatMind’s original scenes and reflection prompts. A ruler in the Vimshottari sequence is not the same field as a deity, a zodiac-sign ruler or a yoni symbol. The Sun, Moon and lunar nodes also do not all belong to the astronomical class of planets. Teaching sources document traditional associations; they do not establish measured effects on behaviour. [5][6][7]",
        "zh": "每篇指南将传统名称、所选符号变体、gana和Vimshottari主星，与费马原创场景及反思提示区分。Vimshottari序列中的主星，不是神祇、星座守护星或yoni象征的同一个字段；太阳、月亮和月球交点也并非都属于天文学意义上的行星。教学资料记录传统对应，不证明它们对行为具有可测的影响。[5][6][7]"
      },
      {
        "en": "Read a scene as an invitation to examine an actual choice and a counterexample. For instance, a craft-related image can prompt reflection on how you approached a project; it cannot establish artistic talent from a birth coordinate. Gana labels are presented as source categories, without moral rank, gender prescriptions, caste assignment or marriage compatibility scores. No dasha timeline or naming-syllable recommendation is calculated.",
        "zh": "可以用场景回看一次真实选择，并寻找反例。例如，工艺意象可以提示你回想怎样处理一个项目，不能凭出生坐标确立艺术天赋。Gana仅作为来源分类呈现，不生成人品等级、性别规范、种姓归属或婚配分数；本工具也不计算大运时间线或取名音节建议。"
      }
    ]
  },
  {
    "id": "evidence-scope",
    "title": {
      "en": "What astronomical comparison can and cannot establish",
      "zh": "天文对照能支持什么，以及不能支持什么"
    },
    "paragraphs": [
      {
        "en": "Numerical verification compares like quantities: epoch, time scale, coordinate origin, reference frame and correction choices must match. NASA/JPL Horizons documents configurable ephemeris outputs; it is a reference for astronomical comparisons, not an endorsement of this website or cultural conclusions. Astronomy Engine’s published verification concerns its computation library rather than the validity of a psychological test. [3][4]",
        "zh": "数值核查需要比较同类量：历元、时间尺度、坐标基点、参考系与修正选项须一致。NASA/JPL Horizons文档说明了可配置的星历输出，可用于天文对照，不代表对本网站或文化结论的认可。Astronomy Engine公布的验证针对计算库，而不是心理测评效度。[3][4]"
      },
      {
        "en": "The retained source notes describe an earlier monthly Moon comparison and its sample limit. That comparison does not independently certify the fixed-Spica approximation, historical birth records, every possible boundary instant or cultural interpretation. In particular, reproducible longitude arithmetic is not evidence that birth sectors measure personality, predict relationships or guide medical, financial or career decisions.",
        "zh": "保留的来源说明介绍了此前逐月月球对照及其样本范围。该对照不独立认证固定角宿一近似、历史出生记录、所有可能的边界时刻或文化解释。尤其是黄经运算可复算，并不证明出生区段能测量人格、预测关系，或指导医疗、财务与职业决策。"
      }
    ]
  },
  {
    "id": "use-and-privacy",
    "title": {
      "en": "Explore the complete library without exposing a birth record",
      "zh": "不公开出生记录，也能完整探索指南"
    },
    "paragraphs": [
      {
        "en": "The calculator processes birth inputs in the current page’s memory. Clearing, leaving, reloading or changing language removes the local input and result. The copy action provides 28 fixed public URLs: the calculator and its 27 guides. It does not attach a birth date, UTC instant, longitude, matched label or private result to a URL or public image.",
        "zh": "计算器在当前页面内存中处理出生输入；清除、离开、刷新或切换语言会移除输入与结果。复制功能仅提供28个固定公开网址：一个计算器入口和27篇指南。出生日期、UTC时刻、黄经、个人匹配标签及私人结果均不附加到网址或公开图片。"
      },
      {
        "en": "You may start with any guide, compare neighbouring symbols or read the calculation notes before using the form. The library offers cultural reading and original examples, not a ranked outcome to pursue by changing birth details. If records or a reference convention remain uncertain, keep that uncertainty explicit rather than treating a detailed narrative as proof of an exact personal finding.",
        "zh": "你可以从任意指南开始、比较相邻意象，或先读计算说明再使用表单。指南库提供文化阅读与原创例子，不是通过修改出生资料来争取的排名结果。出生记录或参考口径仍不确定时，应保留这种不确定，不把细致的叙述当成精确个人结论的证明。"
      }
    ]
  }
];
export const nakshatraFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is a birth star the same as a Moon sign or the Chinese 28 lunar mansions?",
      "zh": "出生宿等于月亮星座或中国二十八宿吗？"
    },
    "answer": {
      "en": "No. This tool uses 27 equal longitude sectors of 13°20′ under its Spica convention. Zodiac signs use twelve 30° divisions, and Chinese lunar-mansion traditions use another historical framework. A shared translation such as “lunar mansion” does not make their names, boundaries or interpretations interchangeable.",
      "zh": "不等于。本工具在角宿一口径下使用27个13°20′的等黄经区段；星座采用12个30°分区，中国二十八宿则属于另一历史框架。共同译作“星宿”不使名称、边界与解释可以互换。"
    }
  },
  {
    "question": {
      "en": "Does this calculator include Abhijit as a 28th sector?",
      "zh": "本计算器把Abhijit列为第28段吗？"
    },
    "answer": {
      "en": "No. It retains the fixed 27-sector sequence from Ashwini to Revati. Abhijit is not inserted as an extra equal sector, and a 28-name list from another tradition should not be used to renumber this result.",
      "zh": "没有。本工具保留从Ashwini到Revati的固定27段顺序，不将Abhijit插入为额外等分区段；不能用其他传统中的28名称列表重新编号本页结果。"
    }
  },
  {
    "question": {
      "en": "Why does the displayed longitude seem to sit on an edge?",
      "zh": "为什么显示角度看起来恰好在边界？"
    },
    "answer": {
      "en": "The result is assigned using the unrounded value, then the display is truncated to two decimals. Exact boundaries belong to the next sector. Read the listed sector, pada and boundary explanation together; the short decimal display is not the full calculation precision.",
      "zh": "结果先用未舍入数值归类，显示时才向下截取两位小数。恰好在分界的值归入后一段。请结合区段、四分区和边界说明阅读；较短的小数显示不等于完整计算精度。"
    }
  },
  {
    "question": {
      "en": "Can a current UTC offset replace a historical IANA zone?",
      "zh": "当前UTC偏移能代替历史IANA时区吗？"
    },
    "answer": {
      "en": "No. The applicable offset can change with date and daylight-saving rules. Confirm the birthplace zone for the recorded date; when a local minute repeats, select the occurrence from the birth record. The tool cannot independently certify that record or pre-1970 zone history.",
      "zh": "不能。适用偏移可能随日期和夏令时规则改变。需核对记录日期的出生地时区；当地分钟重复时，依据出生记录选择具体一次。本工具不能独立认证记录或1970年前时区历史。"
    }
  },
  {
    "question": {
      "en": "Does a pada produce a second personality result?",
      "zh": "四分区会产生另一份人格结果吗？"
    },
    "answer": {
      "en": "No. A pada is one of four equal parts within a mansion, each 3°20′. It describes the coordinate division in this model. The calculator does not generate 108 personality types, a Navamsa chart or a separate validated profile from the pada.",
      "zh": "不会。四分区是每宿内部四个3°20′等分中的一个，描述本模型的坐标划分。计算器不生成108种人格、Navamsa分盘或来自四分区的独立验证画像。"
    }
  },
  {
    "question": {
      "en": "Is this the same as an exact Lahiri or True Chitra calculation?",
      "zh": "本工具等于精确Lahiri或True Chitra计算吗？"
    },
    "answer": {
      "en": "No. It fixes a named FK5 J2000 Spica catalogue direction and uses geometric geocentric Moon coordinates. Other implementations can use different reference motions, apparent corrections or ayanamsa definitions. Match the convention before comparing numeric results, especially near a boundary.",
      "zh": "不是。本工具固定具名FK5 J2000角宿一目录方向，并使用几何地心月球坐标。其他实现可能采用不同的参考运动、视位置修正或岁差定义。比较数值前需先对齐口径，尤其是边界附近。"
    }
  },
  {
    "question": {
      "en": "Are all 27 complete guides free without calculation?",
      "zh": "不计算也能免费阅读全部27篇完整指南吗？"
    },
    "answer": {
      "en": "Yes. Every public guide includes eight sections covering its selected traditional associations and original examples, counterexamples and reflection. No date, account, payment or calculated label is needed to open them.",
      "zh": "可以。每篇公开指南均含八节，介绍所选传统对应、原创例子、反例与反思。打开指南不需要出生日期、账户、付款或计算标签。"
    }
  },
  {
    "question": {
      "en": "Does a precise Moon coordinate prove a cultural interpretation?",
      "zh": "精确的月球坐标能证明文化解释吗？"
    },
    "answer": {
      "en": "No. Position computation and interpretation answer different questions. A comparison with astronomical reference data can examine numeric position under matching settings; it does not validate a personality assignment, a marriage score, a forecast or a causal effect of a birth star.",
      "zh": "不能。位置计算与文化解释回答不同问题。采用一致设置与天文参考数据对照，可以核查数值位置；它不验证人格归类、婚配分数、预言或出生宿的因果效应。"
    }
  }
];

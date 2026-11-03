import type { Questionnaire } from "@/lib/questionnaires/types";

export const spatialReasoningLandingSections: Questionnaire["guide"] = [
  {
    "id": "spatial-scope",
    "title": {
      "zh": "空间推理测试练什么？五类变换与30道原创题",
      "en": "What does spatial reasoning practice cover? Five topics and thirty original tasks"
    },
    "paragraphs": [
      {
        "zh": "本版用文字、精确坐标和明示操作练习平面旋转、镜像、理想折纸、标记立方体转向，以及布局、视图与路径，每组六题。要先确定对象、参照系和所求量，再推演变化；页面插图只标识主题，不需要从插图测量角度或长度。",
        "en": "This edition uses words, exact coordinates and explicit operations for planar rotations, reflections, ideal paper folds, labelled cube turns, and layouts, views or routes, with six items per group. Identify the object, reference frame and requested quantity before transforming it. The page illustration identifies the topic; you do not measure its angles or lengths for an answer."
      },
      {
        "zh": "练习不计时，可画草图、列坐标表或用计算器。约18分钟是编辑估计，非限时或实测平均。完成30题后，免费阅读实际所选、正确答案、逐题解析、五项各六题的正确数及全部五份七节指南。文字理解和坐标熟悉度也是本形式的任务条件。",
        "en": "The practice is untimed, with sketches, coordinate tables and a calculator allowed. About eighteen minutes is an editorial estimate, not a limit or observed average. Complete thirty items to read your choices, keys, every rationale, five six-item counts and all five seven-section guides free. Reading comprehension and coordinate familiarity are part of this task format."
      }
    ]
  },
  {
    "id": "spatial-rotation",
    "title": {
      "zh": "平面旋转：中心、转向与固定坐标轴",
      "en": "Planar rotations: centre, direction and fixed axes"
    },
    "paragraphs": [
      {
        "zh": "本题平面+x向右、+y向上，转的是对象，轴不转。绕原点逆时针90°把(x,y)变为(−y,x)，顺时针90°则为(y,−x)。另设点(5,1)，逆时针90°后为(−1,5)，距离平方仍为26；但同半径还有其他点，长度不独自确定转向。[1]",
        "en": "The planar axes stay fixed, with +x right and +y up. An origin-centred 90° counterclockwise turn sends (x,y) to (−y,x); a clockwise turn gives (y,−x). A fresh point (5,1) becomes (−1,5) counterclockwise, retaining squared radius 26. Other points share that radius, so length alone does not identify direction. [1]"
      },
      {
        "zh": "中心不在原点时先减中心、转偏移、再加回。另设P(5,1)、C(2,−1)，偏移(3,2)逆时针转为(−2,3)，加回得P′(0,2)。对整个占格形状，每个中心都要做同一变换；只有明确允许平移的匹配题才可忽略共同位置偏移。",
        "en": "For a non-origin centre, subtract it, turn the offset, then add it back. With fresh P(5,1) and C(2,−1), offset (3,2) turns counterclockwise to (−2,3), giving P′(0,2). Every centre of an occupied-cell shape must undergo the same transformation. Ignore a common positional offset only when the matching task explicitly permits translation."
      }
    ]
  },
  {
    "id": "spatial-reflection",
    "title": {
      "zh": "镜像与复合操作：镜线正确，顺序也要正确",
      "en": "Reflections and composition: identify both the line and operation order"
    },
    "paragraphs": [
      {
        "zh": "镜像须使用指定直线。关于x轴保留x、反转y；关于y=x互换两坐标。非原点竖直镜线x=a用x′=2a−x。另设(6,−3)关于x=2镜像得(−2,−3)，到镜线的垂直距离两侧均为4。不能把所有镜像都简化成换一个符号。[2][3]",
        "en": "Use the specified mirror line. Reflection in the x-axis preserves x and reverses y; reflection in y=x exchanges coordinates. For a vertical line x=a, use x′=2a−x. A fresh point (6,−3) reflected in x=2 becomes (−2,−3), four units from the line on each side. Reflection is not always just changing a sign. [2][3]"
      },
      {
        "zh": "操作通常不能任意交换。另从(1,3)起，先逆时针90°得(−3,1)，再关于x轴镜像得(−3,−1)；反过来先镜像得(1,−3)，再旋转得(3,1)。两条路径结果不同。整体形状也须检查全部格，不能只凭一个相同角判断；对称形的镜像还可能与原形重合。",
        "en": "Operations generally cannot be exchanged freely. Starting from fresh (1,3), a counterclockwise quarter-turn gives (−3,1), then an x-axis reflection gives (−3,−1). Reversing the order gives (1,−3), then (3,1). Check every cell of a whole shape, not just one matching corner; a symmetric shape can also coincide with its own reflection."
      }
    ]
  },
  {
    "id": "spatial-folds",
    "title": {
      "zh": "理想折纸：逆序展开、材料边界与不同孔位",
      "en": "Ideal paper folds: reverse order, material bounds and distinct holes"
    },
    "paragraphs": [
      {
        "zh": "本版折纸采用无厚度纸、固定原坐标、贯穿当前各层的点状孔，并明示折线与移动侧。展开从最后一折反解到前一折，保留实际材料覆盖的伙伴，重合位置只数一次。不能把“折几次就乘几次二”当通用规律，也不能用完全展开的孔位回答只打开一折的题。",
        "en": "Folding tasks specify zero-thickness paper, fixed original coordinates, point holes through every current layer, crease lines and moving sides. Undo the last fold before earlier folds, retaining partners actually supported by the material and counting coincident positions once. Doubling after each crease is not universal, and fully unfolded positions do not answer a partial-unfolding question."
      },
      {
        "zh": "另设−5≤x,y≤5的方纸，先把正x折向负x，再把正y折向负y，在(−2,−3)打点孔。全展开为(−2,−3)、(−2,3)、(2,−3)、(2,3)四处，均在原纸内；若只打开最后的y折，仍折着的纸上只有(−2,−3)与(−2,3)两处不同位置。",
        "en": "For a fresh square −5≤x,y≤5, fold positive x onto negative x, then positive y onto negative y, and punch at (−2,−3). Full unfolding gives four positions: (−2,−3), (−2,3), (2,−3) and (2,3), all within the sheet. Opening only the last y fold leaves two distinct positions in the still-folded sheet: (−2,−3) and (−2,3)."
      }
    ]
  },
  {
    "id": "spatial-cubes",
    "title": {
      "zh": "立方体：面标记跟随物体，位置逐步更新",
      "en": "Cube turns: face labels travel while positions change"
    },
    "paragraphs": [
      {
        "zh": "本题初始顶T、底B、前F、后K、右R、左L。标签贴在面上，不因移动到顶部就重新命名。向前滚按顶→前→底→后→顶，左右不动；向右滚按顶→右→底→左→顶，前后不动。每步从旧行完整生成新行，六个标签应各出现一次。",
        "en": "The initial cube has T top, B bottom, F front, K back, R right and L left. Labels stay on their faces rather than being renamed after a move. Forward rolls cycle top→front→bottom→back→top, fixing left/right; right rolls cycle top→right→bottom→left→top, fixing front/back. Generate each new six-position row from the complete old row; every label must appear once."
      },
      {
        "zh": "另从初始朝向先向前、再向右：最终顶L、前T、右K。换成先向右、再向前，则顶K、前L、右T。两种动作各一次，却因轴和顺序不同而得到不同朝向。所问若为左面，就须读最后记录的左位，不能用算对的顶面代答。",
        "en": "A fresh forward-then-right sequence ends with L on top, T in front and K on the right. Right-then-forward instead gives K on top, L in front and T on the right. Both use one of each move, but changing axes makes order matter. If the question asks for the left face, read the final left position, not a correctly tracked top face."
      }
    ]
  },
  {
    "id": "spatial-layouts",
    "title": {
      "zh": "视图与路径：区分总块数、投影格和相对方向",
      "en": "Views and routes: separate total cubes, projected cells and relative direction"
    },
    "paragraphs": [
      {
        "zh": "三维坐标把位置按三个分量表达；视图须按题定方向舍去一维，重叠投影只数一次。[4] 另设两行三列实心堆高[1,0,2]与[3,2,1]，总块数9、非空俯视足迹5格；沿行方向前视，各列最高为(3,2,2)，共有7个投影格。三个数对应三个不同问题。",
        "en": "Three-dimensional coordinates describe position through three components; a stated view drops one component and counts overlapping projected cells once. [4] Fresh solid rows [1,0,2] and [3,2,1] contain nine cubes and five nonempty top-footprint cells. Front viewing along the row direction gives maximum heights (3,2,2), or seven projected cells. These are three different requested quantities."
      },
      {
        "zh": "路径同时更新位置与朝向。另从(0,−2)面朝西，前进3格到(−3,−2)，左转向南走2格到(−3,−4)，右转向西走1格到(−4,−4)。转向本身不增加位移；面朝西时身体左边是南，不是地图左侧的西，地图坐标轴始终不变。",
        "en": "For a fresh route, start at (0,−2) facing west. Move three to (−3,−2), turn left to face south and move two to (−3,−4), then turn right westward and move one to (−4,−4). Turning alone adds no displacement. When facing west, bodily left is south, whereas the map’s left remains west; its axes do not change."
      }
    ]
  },
  {
    "id": "spatial-counts",
    "title": {
      "zh": "怎样读成绩？五项正确数与全部35节指南",
      "en": "How should results be read? Five topic counts and all thirty-five guide sections"
    },
    "paragraphs": [
      {
        "zh": "每题答对记一，其他有效选择记零，不倒扣、不按速度加权。总数0—30，五项各0—6；另例3、1、4、2、5合计15/30。缺选不会自动当错，全部30题有效才生成报告。相同总数可能对应不同分项与不同失误，应结合逐题所选、答案及推导阅读。",
        "en": "Each correct answer adds one and another valid choice adds zero, without penalties or speed weighting. The total ranges from 0–30 and each topic from 0–6; fresh counts 3,1,4,2,5 total 15/30. Missing choices are not silently marked wrong: thirty valid responses are required. Equal totals can contain different topic patterns and mistakes, so review selections, keys and reasoning."
      },
      {
        "zh": "零分、部分与满分均免费获得30题完整解析，以及平面旋转、镜像、折纸、立方体、布局五份各七节指南，共35节。六题计数不独自诊断阅读、心像、记忆或稳定空间能力。可用新坐标、另一折线或新转向序列复核理解，避免只认出固定选项。",
        "en": "Zero, partial and perfect results all receive thirty full rationales and five seven-section guides on rotations, reflections, folds, cubes and layouts: thirty-five sections. Six-item counts cannot diagnose reading, imagery, memory or stable spatial ability by themselves. Check understanding with fresh coordinates, a different crease or a new turn sequence rather than simply recognising fixed options."
      }
    ]
  },
  {
    "id": "spatial-science",
    "title": {
      "zh": "研究背景、练习迁移与双语结果的解释",
      "en": "Research context, transfer and interpreting bilingual results"
    },
    "paragraphs": [
      {
        "zh": "Shepard与Metzler在1971年的实验让八位成人判断三维物体透视线图是否同形，并研究角度差与反应时；这是图形与反应时研究，不是本站坐标题的常模。[5] Uttal等2013年元分析汇总217项训练研究，报告研究总体中的训练与迁移效果，不能据此承诺本页一次练习的个人收益。[6]",
        "en": "Shepard and Metzler’s 1971 experiment asked eight adults to judge shapes in perspective drawings and examined angular difference against response time. That is research on images and timing, not a norm for this coordinate bank. [5] Uttal and colleagues’ 2013 meta-analysis combined 217 training studies and reported aggregate training and transfer effects; it does not establish an individual benefit from this page. [6]"
      },
      {
        "zh": "本站原创题本尚无重测信度、结构效度、人群常模或跨语言等值研究。中英文共用题号、答案和计分不等于已证明两种语言难度一致；阅读、坐标熟悉度与答案记忆都可能影响结果。点击开始直接进入题目，保存进度另为自愿选择；结果用于理解题定变换，不换算智商或岗位结论。",
        "en": "This original bank has no established retest reliability, structural validity, population norms or cross-language equivalence. Shared bilingual IDs, keys and scoring do not prove equal difficulty: reading, coordinate familiarity and answer recall can affect results. Start opens the questions directly; saving progress is a separate optional choice. Results support understanding the stated transformations, without an IQ or occupational conclusion."
      }
    ]
  }
];

export const spatialReasoningLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "空间推理与心理旋转是一回事吗？",
      "en": "Is spatial reasoning identical to mental rotation?"
    },
    "answer": {
      "zh": "心理旋转是空间任务的一种。本站另含镜像、折纸、面标记、投影与路径，并以文字坐标表达。一次总正确数不能把这些过程分离成已验证的能力因子。[5]",
      "en": "Mental rotation is one kind of spatial task. This bank also includes reflections, folds, face tracking, projections and routes expressed in words and coordinates. One total correct count does not separate them into validated ability factors. [5]"
    }
  },
  {
    "question": {
      "zh": "为什么先读坐标轴和旋转中心？",
      "en": "Why read the axes and centre first?"
    },
    "answer": {
      "zh": "固定轴下对象旋转，与换一个观察坐标系不同。非原点中心须先减中心、转偏移、再加回。遗漏其中一步，可能算对另一个问题，却没有回答本题。[1]",
      "en": "Turning an object in fixed axes differs from changing the coordinate frame. For a non-origin centre, subtract it, turn the offset and add it back. Omitting a step may solve a different problem. [1]"
    }
  },
  {
    "question": {
      "zh": "镜像一定无法通过旋转匹配吗？",
      "en": "Can a reflection ever match through rotation?"
    },
    "answer": {
      "zh": "不能一概而论，对称形可能与自身镜像重合。应按题准许的变换，检查完整点集和短臂位置；不能只凭一个角相同或所有距离相同就认定匹配。",
      "en": "There is no universal rule: a symmetric shape may coincide with its mirror. Apply only the permitted moves and check the complete point set and distinctive attachments; one matching corner or equal distances is insufficient."
    }
  },
  {
    "question": {
      "zh": "折两次为什么不一定总有四个孔位？",
      "en": "Why do two folds not always imply four hole positions?"
    },
    "answer": {
      "zh": "孔在折线上可能重合，纸张覆盖与边界会限制伙伴，只展开一折也可能仍有重叠层。须从最后一折逆推、保留确有材料的位置，再数题目要求阶段的不同点。",
      "en": "A punch on a crease can coincide with its reflection; bounds and coverage can exclude partners, and partial unfolding can leave layers superimposed. Reverse the folds, retain material-supported locations and count distinct positions at the requested stage."
    }
  },
  {
    "question": {
      "zh": "立方体滚动可以只追踪顶部吗？",
      "en": "Can I track only the top of a rolling cube?"
    },
    "answer": {
      "zh": "多步换轴时通常不够，当前后面或左面可能在下一步到顶。应维护顶、底、前、后、右、左六位置，标签各一次，再读取所问的最终位置。",
      "en": "Usually not across several different-axis moves: a current back or left face may become top next. Maintain top, bottom, front, back, right and left with each label once, then read the requested final position."
    }
  },
  {
    "question": {
      "zh": "投影格数与积木总数为什么不同？",
      "en": "Why can projected cells differ from the number of cubes?"
    },
    "answer": {
      "zh": "不同深度的块可能落到同一投影格，只计一个位置。材料总数则包括题目明确存在的隐藏块；只有给定实心堆条件或完整坐标时，才能据此累加，不能从一张视图随意补内部。",
      "en": "Cubes at different depths may share one projected cell. Material total includes explicitly present hidden cubes. Count from stated solid-stack conditions or a complete coordinate list rather than inventing an interior from one view."
    }
  },
  {
    "question": {
      "zh": "开始是否还要同意、注册或付款？",
      "en": "Does starting require an agreement, account or payment?"
    },
    "answer": {
      "zh": "点击开始直接进入第一题，无额外同意、注册、邮箱或付款门槛。保存仅在主动选择后保留本标签页24小时进度，完整题解不依赖保存；分享只包含公开标题与链接。",
      "en": "Start opens the first question without another agreement, account, email or payment gate. Saving is optional and retains this tab’s progress for twenty-four hours; full answers do not depend on saving. Sharing contains the public title and link only."
    }
  },
  {
    "question": {
      "zh": "练习研究能保证这份测试提升我的空间能力吗？",
      "en": "Does training research guarantee this test improves my spatial ability?"
    },
    "answer": {
      "zh": "不能。研究中训练方式、对照、样本及迁移任务都有具体设计；本站没有对应训练试验。重做同一题本还可能受熟悉度影响，可用新例子检查理解，不能用涨分独自证明广泛收益。[6]",
      "en": "No. Training studies have particular interventions, controls, samples and transfer tasks; this page has no corresponding trial. Familiarity can also affect a repeat. Fresh examples can check understanding, but a higher count alone does not establish a general benefit. [6]"
    }
  }
];

export const spatialReasoningLandingReferences = [
  {
    "title": {
      "zh": "Shepard与Metzler（1971）：三维物体心理旋转实验",
      "en": "Shepard and Metzler (1971): mental rotation of three-dimensional objects"
    },
    "url": "https://doi.org/10.1126/science.171.3972.701"
  },
  {
    "title": {
      "zh": "Uttal等（2013）：空间技能训练研究元分析",
      "en": "Uttal et al. (2013): meta-analysis of spatial-skills training"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/22663761/"
  }
];

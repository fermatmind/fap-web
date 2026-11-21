import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
import type { NarrativeChapterSlots } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

// Accepted ISFJ editorial copy shared by both questionnaire forms.
// These are editorial interpretations for self-reflection, not additional scores or
// evidence of individual ability. A/T is not used to infer empathy or competence.
const candidate: Record<"career" | "growth" | "relationships", {
  strengths: NonNullable<NarrativeChapterSlots["strengths"]>;
  weaknesses: NonNullable<NarrativeChapterSlots["weaknesses"]>;
  intro: NarrativeChapterSlots["intro"];
  influentialTraits: NarrativeChapterSlots["influentialTraits"];
  traitsUnlock: NonNullable<NarrativeChapterSlots["traitsUnlock"]>;
}> = {
  "career": {
    "strengths": {
      "title": "你的强项",
      "items": [
        {
          "title": "关注成果怎样被使用",
          "description": "你可能会多想一步：拿到成果的人是否看得懂、接得住、用得上。把这种关注带进交付，能帮助发现要求之外的实际障碍，让完成任务与解决问题更接近。"
        },
        {
          "title": "愿意把细节落实",
          "description": "面对“差不多就行”的笼统要求，你可能仍在意具体怎样才算妥当。若这些细节确实影响质量或体验，这份认真便有实际价值；重点在于知道哪些地方值得仔细。"
        },
        {
          "title": "从经验找到切入点",
          "description": "见过的情形、试过的方法，可能是你理解新任务的重要线索。它们能帮助你更快找到要核对的环节，也让别人有机会借助你的经历；价值取决于你是否同时辨认新旧条件的不同。"
        },
        {
          "title": "把后续也放在心上",
          "description": "你可能不只在意眼前交出去的结果，也记挂事情后面有没有妥善接上。持续跟进能减少无人处理的空隙，前提是职责、期限和所需资源已经说清，后续不全靠你独自兜底。"
        },
        {
          "title": "顾及合作中的感受",
          "description": "作安排时，你可能会考虑同事怎样理解要求、哪些地方会让人为难。这份关注有助于发现配合的阻碍；如果也能说清自己的限制，彼此更容易在真实条件下合作。"
        },
        {
          "title": "珍惜持续产生的价值",
          "description": "把一项常出问题的安排理顺，让别人以后少费一点力，可能会让你感到工作值得。你重视的可以是成果长期被使用的价值，而不只是交付当下被称赞的感觉。"
        }
      ]
    },
    "weaknesses": {
      "title": "你的短板",
      "items": [
        {
          "title": "把成果留在默默完成里",
          "description": "当你习惯把工作做好再说，别人可能只看到结果顺利，没有看见你处理了哪些难点。若缺少成果和成本的说明，评价、资源及发展机会便可能与实际投入脱节。"
        },
        {
          "title": "补位逐渐挤掉本职任务",
          "description": "你可能很快注意到没人接手的事，也愿意先补上。若临时支持迟迟没有重新分工，它会持续占用你原本的职责、休息或学习时间，可靠也容易被误解为始终有余力。"
        },
        {
          "title": "局部完善掩盖了优先级",
          "description": "你可能希望每个环节都足够妥当，却在打磨已有成果时，压缩了处理更重要问题的时间。需要留意的不是认真本身，而是这部分改进是否仍值得当前的时间成本。"
        },
        {
          "title": "让熟悉代替重新判断",
          "description": "经验能带来把握，也可能让你更相信过去顺手的办法。当任务条件已经改变，继续沿用旧判断，可能让你忽略值得尝试的新方法，或把尚未熟悉误认为无法胜任。"
        },
        {
          "title": "把异议推迟到会后",
          "description": "为了让合作顺利，你可能先配合一个自己并不认同的安排。若影响没有在可以调整的时候说出来，后续便容易一边承担代价、一边积累不满，而相关人仍以为你已同意。"
        },
        {
          "title": "因为舍不得而停留",
          "description": "熟悉的人、流程和共同经历，可能让你难以只从岗位条件判断去留。如果收入、学习和负荷已长期不合需要，情分便可能盖过眼前的现实；留下是否仍有选择空间，值得单独考虑。"
        }
      ]
    },
    "intro": [
      "在工作里，你可能最先注意到的是事情怎样才能真正办妥：要求是否说清，容易遗漏的地方有没有人照看，完成之后能否让使用它的人少一点麻烦。这种关注具体需要、借助经验推进的方式，在服务、协作和持续维护的任务中有发挥空间。值得分辨的是，你享受的是解决问题本身，还是只有被需要时才觉得自己的工作有价值；两者都可能让你忙碌，却会把职业发展带向不同方向。",
      "如果你总能把眼前的事接住，团队可能越来越依赖你，却未必主动为你安排新的机会。判断一份工作是否值得继续投入，可以同时看三件事：成果是否被认可，能力是否在增长，承担的责任是否配有相应资源。熟悉和人情是重要的考虑，也需要与收入、负荷和未来选择放在一起衡量。这一章会帮助你把细致与责任转化成可见的贡献，也辨认何时需要调整任务、表达发展意愿或探索别的岗位。"
    ],
    "traitsUnlock": {
      "title": "理解这些倾向怎样影响你的选择",
      "intro": "结合一次真实经历，理解倾向的价值、可能的代价和可以调整的一步；这些是理解角度，不是额外测出的能力分数。",
      "items": [
        {
          "id": "career_trait_1",
          "label": "关注具体需要",
          "role": "career_lens",
          "definition": "先留意事情会怎样影响具体使用者，再判断哪里值得投入。",
          "whyItMatters": "需求能被说明并分配，照看细节才有机会成为团队共同的方法。",
          "expression": "如果有人看不懂交付物，你可能先补充背景、说明或示例，让它更容易使用。",
          "advantage": "把对人的关心连接到任务，可以帮助发现“已经做完”和“真正好用”之间的差距。",
          "overuseRisk": "看见实际需要有助于做好服务；若所有不便都靠你补位，需求也可能变成没有边界的责任。",
          "realWorldSignal": "同类求助不断回到你这里，而其他人始终无法接手，值得检查分工和说明。",
          "upgradeHint": "选一项反复处理的需求，确认负责人、影响和优先级，再决定由谁继续承担。",
          "linksToExistingBlocks": {
            "roles": [
              "career.preferredRoles"
            ],
            "summary": [
              "career.summary"
            ],
            "upgrade": [
              "career.upgradeSuggestions"
            ],
            "strengths": [
              "career.advantages"
            ],
            "weaknesses": [
              "career.weaknesses"
            ]
          }
        },
        {
          "id": "career_trait_2",
          "label": "经验取向",
          "role": "working_method",
          "definition": "用见过的情形、试过的方法理解当前任务，建立行动的把握。",
          "whyItMatters": "更新经验需要实际比较，不能仅凭新旧或熟悉程度判断方法优劣。",
          "expression": "面对新问题，你可能先回想相似任务，再决定从哪个具体环节开始。",
          "advantage": "经验能缩短摸索过程；把适用条件讲清，也能减少别人照搬时的误用。",
          "overuseRisk": "经验能为行动提供把握；当目标或使用者已经变化，曾经有效的方法也需要重新核对。",
          "realWorldSignal": "一个步骤反复出现返工，说明需要重新核对条件，而不只是再认真做一遍。",
          "upgradeHint": "找一项最近改变的要求，比较原方法在哪一步不再合用，先试一个小调整。",
          "linksToExistingBlocks": {
            "roles": [
              "career.preferredRoles"
            ],
            "summary": [
              "career.summary"
            ],
            "upgrade": [
              "career.upgradeSuggestions"
            ],
            "strengths": [
              "career.advantages"
            ],
            "weaknesses": [
              "career.weaknesses"
            ]
          }
        },
        {
          "id": "career_trait_3",
          "label": "承诺意识",
          "role": "inner_drive",
          "definition": "把答应过的任务当作需要持续跟进、妥善交代的事。",
          "whyItMatters": "资源、范围和期限会改变；可兑现的安排需要允许双方重新商量。",
          "expression": "即使没人频繁催促，你也可能记挂尚未完成的环节和后续影响。",
          "advantage": "承诺的价值在于让协作有依据，主动说明变化也属于负责的一部分。",
          "overuseRisk": "愿意跟进能让承诺有着落；若为守约而隐藏困难，别人便来不及调整依赖和资源。",
          "realWorldSignal": "你开始用休息时间持续补差，却没有让相关人知道任务已超出原先估计。",
          "upgradeHint": "下次进展偏离计划时，说明已完成部分、当前阻碍，以及可讨论的范围、期限或资源调整。",
          "linksToExistingBlocks": {
            "roles": [
              "career.preferredRoles"
            ],
            "summary": [
              "career.summary"
            ],
            "upgrade": [
              "career.upgradeSuggestions"
            ],
            "strengths": [
              "career.advantages"
            ],
            "weaknesses": [
              "career.weaknesses"
            ]
          }
        },
        {
          "id": "career_trait_4",
          "label": "协作分寸",
          "role": "career_orientation",
          "definition": "推进事情时，同时考虑表达方式、合作气氛和对方的处境。",
          "whyItMatters": "气氛和任务都需要照看，表面配合无法替代对实际问题的处理。",
          "expression": "对安排有不同看法时，你可能先想怎样说才不会让人难堪。",
          "advantage": "顾及感受可以为讨论留出余地；清楚表达限制，才能让合作建立在真实条件上。",
          "overuseRisk": "顾及感受能为合作留余地；若始终不提实际异议，不合理的安排也可能被长期保留。",
          "realWorldSignal": "会后反复抱怨同一安排，会上却始终表示没有问题，可以从一个事实开始表达。",
          "upgradeHint": "用“当前影响—我的建议—需要谁决定”提出一次具体异议，再观察讨论能否推进。",
          "linksToExistingBlocks": {
            "roles": [
              "career.preferredRoles"
            ],
            "summary": [
              "career.summary"
            ],
            "upgrade": [
              "career.upgradeSuggestions"
            ],
            "strengths": [
              "career.advantages"
            ],
            "weaknesses": [
              "career.weaknesses"
            ]
          }
        }
      ]
    },
    "influentialTraits": [
      {
        "label": "关注具体需要",
        "body": "先留意事情会怎样影响具体使用者，再判断哪里值得投入。",
        "colorKey": "green"
      },
      {
        "label": "经验取向",
        "body": "用见过的情形、试过的方法理解当前任务，建立行动的把握。",
        "colorKey": "green"
      },
      {
        "label": "承诺意识",
        "body": "把答应过的任务当作需要持续跟进、妥善交代的事。",
        "colorKey": "green"
      },
      {
        "label": "协作分寸",
        "body": "推进事情时，同时考虑表达方式、合作气氛和对方的处境。",
        "colorKey": "green"
      }
    ]
  },
  "growth": {
    "strengths": {
      "title": "你的强项",
      "items": [
        {
          "title": "能从小处建立连续性",
          "description": "你可能更容易把改变落实为一件能够重复的小事，而不是等一次彻底的转折。连续实践能留下可观察的经历，让你逐步发现什么做法合用、什么安排需要调整。"
        },
        {
          "title": "愿意从具体经历反思",
          "description": "回看一次实际发生的事，可能比给自己贴“做得好或不好”的标签更有帮助。你可以借助记得的经过，区分当时的条件、自己的选择和真实结果，让反思有修改的方向。"
        },
        {
          "title": "倾向于给愿望找落点",
          "description": "面对想要的变化，你可能会关注什么时候开始、需要准备什么。这种把愿望转成具体安排的倾向，能帮助你跨过最初的一步；安排也需要允许实践后的重新选择。"
        },
        {
          "title": "保留仍然有效的积累",
          "description": "你可能不会轻易丢掉已经证明有用的经验与习惯。它们能为新的尝试提供支撑，让改变有可以依靠的起点，同时也值得分清哪些积累仍合用，哪些只是因为熟悉才被留下。"
        },
        {
          "title": "重视生活中的真实反馈",
          "description": "比起抽象地追求“更优秀”，你可能更能辨认一次表达变清楚、一件事不再那么费力的价值。这些反馈有助于选择值得继续的改变，也让进步有自己的参照。"
        },
        {
          "title": "通过理解别人拓宽视角",
          "description": "当你愿意了解一个人的具体处境，也可能接触到与自己不同的需要和选择。这样的经历能帮助你发现，原先习以为常的安排并非唯一可能，自己的意愿也值得被重新认识。"
        }
      ]
    },
    "weaknesses": {
      "title": "你的短板",
      "items": [
        {
          "title": "把有用当作自我价值",
          "description": "如果总以“我有没有帮上忙”确认自己是否值得，你可能很难给没有明显用途的兴趣留时间。别人不再需要某项帮助时，也容易让你失落，而不只是感到可以重新选择。"
        },
        {
          "title": "先处理事务，后承认感受",
          "description": "你可能先把该做的事维持下去，等有空再想自己的疲惫、不满或期待。若空闲始终没有到来，感受就容易被长期搁置，直到已经影响投入，才发现原有安排需要改变。"
        },
        {
          "title": "在尝试之前排除自己",
          "description": "陌生方向缺少经验可循时，你可能先看到风险和准备不足。若把这些不确定直接理解成“不适合我”，便很难收集真正有用的体验，也可能错过后来会喜欢的事情。"
        },
        {
          "title": "完成之后仍不断加码",
          "description": "如果眼光很快转向还能改进的部分，已经做到的事便不容易带来满足。标准在完成后继续移动，会让你长期觉得自己还差一点，而难以判断何时值得停下或转向。"
        },
        {
          "title": "困难只留给自己消化",
          "description": "你可能不愿打乱别人安排，或不习惯让别人看见自己需要支持的一面。若困难始终不进入共同讨论，可协商的时间和资源就可能被错过；能否获得支持，也需要看对方是否愿意回应。"
        },
        {
          "title": "把休息也变成任务",
          "description": "你可能空下来仍想把家务、整理或学习安排好，才觉得这段时间没有浪费。若所有空闲都要交出成果，休息便可能只是换一种方式继续投入，自己的兴趣和恢复体验反而更难被听见。"
        }
      ]
    },
    "intro": [
      "你可能更习惯通过把日常安排妥当、履行承诺来确认自己正在好好生活。这让成长有一个具体的起点：从一次真实经历中发现问题，再把改进放进下一次行动。但当“把该做的事做完”成为唯一标准，自己的好奇、疲惫和愿望就容易排到最后。做得越来越熟练，并不一定意味着生活越来越接近自己想要的样子；有时需要发展的，是作选择的空间，而不只是承担更多的能力。",
      "可以从三个问题重新看待进步：这件事是我认同的，还是主要为了避免让人失望？我在学会什么，还是只是在重复消耗？投入之后，我是否还留有恢复和尝试的余地？你的经验和惯例可以继续提供支持，也可以被重新检验。下面会分别梳理可依靠的积累、容易忽略的限制，以及值得试验的恢复与探索方式，让改变既落到具体生活里，也保留你的真实意愿。"
    ],
    "traitsUnlock": {
      "title": "理解这些倾向怎样影响你的选择",
      "intro": "结合一次真实经历，理解倾向的价值、可能的代价和可以调整的一步；这些是理解角度，不是额外测出的能力分数。",
      "items": [
        {
          "id": "growth_trait_1",
          "label": "自我认同",
          "role": "inner_processing",
          "definition": "分辨一项投入与自己的价值、兴趣和责任有什么关系。",
          "whyItMatters": "认同一件事的价值，有助于决定哪些责任值得保留、哪些方式需要更新。",
          "expression": "作选择时，你可能很快想到谁会受影响，却需要停一下才想起自己想要什么。",
          "advantage": "愿意照顾别人和拥有自己的方向可以同时成立，无需把两者设为只能选一个。",
          "overuseRisk": "关心别人可以是你认同的选择；若只用“还需不需要我”评价自己，自己的兴趣就容易没有位置。",
          "realWorldSignal": "一旦没人需要帮忙就感到无事可做，可以重新找找没有外在要求时自己的兴趣。",
          "upgradeHint": "回看本周一项投入，分别写下自己认同的理由、外在压力和愿意调整的部分。",
          "linksToExistingBlocks": {
            "summary": [
              "growth.summary"
            ],
            "drainers": [
              "growth.drainers"
            ],
            "strengths": [
              "growth.strengths"
            ],
            "motivators": [
              "growth.motivators"
            ],
            "weaknesses": [
              "growth.weaknesses"
            ]
          }
        },
        {
          "id": "growth_trait_2",
          "label": "经验积累",
          "role": "growth_engine",
          "definition": "通过具体经历、重复练习与反馈，形成越来越可用的做法。",
          "whyItMatters": "尝试的作用也包括收集信息；一次生疏表现不足以代表长期潜力。",
          "expression": "比起空泛地要求自己改变，你可能更容易从一次实际困难找到下一步。",
          "advantage": "真实经历能把笼统的自我评价拆开，让你知道该补什么、哪些已能做到。",
          "overuseRisk": "具体经验能帮助你积累信心；若总等到完全有把握才开始，陌生的选择便很难获得被了解的机会。",
          "realWorldSignal": "你能列出许多担忧，却没有一条来自亲自体验，说明还需要补充实际信息。",
          "upgradeHint": "为一件好奇的事安排一次可承受的体验，事后分别记录喜欢、困难和还想了解的部分。",
          "linksToExistingBlocks": {
            "summary": [
              "growth.summary"
            ],
            "drainers": [
              "growth.drainers"
            ],
            "strengths": [
              "growth.strengths"
            ],
            "motivators": [
              "growth.motivators"
            ],
            "weaknesses": [
              "growth.weaknesses"
            ]
          }
        },
        {
          "id": "growth_trait_3",
          "label": "责任边界",
          "role": "self_regulation",
          "definition": "区分自己愿意承担的部分、已经约定的部分与需要协商的额外负担。",
          "whyItMatters": "边界应当说明真实条件，并允许讨论，而不是把所有请求一概拒绝。",
          "expression": "别人开口时，你可能先想办法完成，过后才发现自己的计划没有了位置。",
          "advantage": "范围清楚能让帮助更可持续，也让对方有机会调整期待或寻找其他资源。",
          "overuseRisk": "认真承担可以支持重要的关系与目标；若答应时不核对余力，后续便可能只能靠压缩休息来履行。",
          "realWorldSignal": "反复对同一安排感到抵触，常值得回看当初答应的范围与如今是否一致。",
          "upgradeHint": "对一次不紧急的请求先核对时间，再明确可做的范围；必要时提出换时间或分担。",
          "linksToExistingBlocks": {
            "summary": [
              "growth.summary"
            ],
            "drainers": [
              "growth.drainers"
            ],
            "strengths": [
              "growth.strengths"
            ],
            "motivators": [
              "growth.motivators"
            ],
            "weaknesses": [
              "growth.weaknesses"
            ]
          }
        },
        {
          "id": "growth_trait_4",
          "label": "恢复节奏",
          "role": "recovery_pattern",
          "definition": "辨认哪些安排让精力回来，哪些只是让自己暂时继续运转。",
          "whyItMatters": "能完成日常任务不代表已经休息充分，也不要求每次恢复都有相同速度。",
          "expression": "你可能空下来仍想整理、补任务；身体停了，注意力却继续围着责任打转。",
          "advantage": "恢复需要看实际体验；安静、活动和陪伴都可以比较，不由类型预先限定。",
          "overuseRisk": "能继续做事是一个信号，也需要看看精力是否回来；若急着重新投入，疲惫可能被带进下一轮。",
          "realWorldSignal": "连续休息后仍明显吃力或困扰持续影响生活，需要调整负荷，并考虑适当专业支持。",
          "upgradeHint": "比较两次休息后的精力、专注和兴趣，保留更有帮助的条件，而不只计算休息时长。",
          "linksToExistingBlocks": {
            "summary": [
              "growth.summary"
            ],
            "drainers": [
              "growth.drainers"
            ],
            "strengths": [
              "growth.strengths"
            ],
            "motivators": [
              "growth.motivators"
            ],
            "weaknesses": [
              "growth.weaknesses"
            ]
          }
        }
      ]
    },
    "influentialTraits": [
      {
        "label": "自我认同",
        "body": "分辨一项投入与自己的价值、兴趣和责任有什么关系。",
        "colorKey": "green"
      },
      {
        "label": "经验积累",
        "body": "通过具体经历、重复练习与反馈，形成越来越可用的做法。",
        "colorKey": "green"
      },
      {
        "label": "责任边界",
        "body": "区分自己愿意承担的部分、已经约定的部分与需要协商的额外负担。",
        "colorKey": "green"
      },
      {
        "label": "恢复节奏",
        "body": "辨认哪些安排让精力回来，哪些只是让自己暂时继续运转。",
        "colorKey": "green"
      }
    ]
  },
  "relationships": {
    "strengths": {
      "title": "你的强项",
      "items": [
        {
          "title": "记得对方在意的事",
          "description": "如果你容易记住亲近的人提过的偏好与不便，关心就可能带着个人化的线索。对方感受到的可以是“你认真听过我”，这份被记住的体验，常比一份看起来周全却不合需要的安排更贴近。"
        },
        {
          "title": "把感情落实在行动里",
          "description": "你可能更习惯用陪伴、照料或处理具体事情表达重视。它让关系中的支持有机会落进真实生活；当对方恰好需要这样的参与时，心意也更容易被感受到。"
        },
        {
          "title": "愿意给理解留时间",
          "description": "亲近的人谈起困扰时，你可能想多了解经过和处境，再回应他在意的部分。愿意听清楚有助于减少仓促的判断，也让对方有机会表达那些还没整理好的感受。"
        },
        {
          "title": "重视关系的连续性",
          "description": "共同经历对你可能不只是过去的回忆，也会影响你怎样安排接下来的相处。愿意保留联系、认真经营日常，可以让关系有持续的投入，而不完全依赖某次热烈表达。"
        },
        {
          "title": "在意不同意见怎样被说出",
          "description": "即使想法不同，你也可能关注话语会怎样落在对方身上。这份分寸感能为讨论保留余地；它最有价值的时候，是既照顾了对方，也没有让自己的真实立场消失。"
        },
        {
          "title": "把共同承诺当回事",
          "description": "你可能把商量过的安排记在心里，并愿意投入时间去兑现。承诺因此有机会成为可以依靠的行动；当情况变化时，及时说明和重新协调，同样体现对关系的认真。"
        }
      ]
    },
    "weaknesses": {
      "title": "你的短板",
      "items": [
        {
          "title": "把被理解的期待藏起来",
          "description": "你会留意别人的线索，也可能期待对方同样看懂自己。当需要没有被明确听见时，一次遗漏便容易被理解成“不够在乎”，让信息上的差异与真实的关系问题混在一起。"
        },
        {
          "title": "用表面的和气替代回应",
          "description": "你可能先把不满放下，继续联系和照顾，希望关系慢慢恢复。但相处照常并不说明分歧已被处理；若同一问题反复出现，短暂维持气氛的方式也可能扩大内心的距离。"
        },
        {
          "title": "在照顾中接过太多选择",
          "description": "你想让对方轻松一点，可能连计划、决定和后续都一起承担。若没有确认他的需要，帮助就可能超出合适范围；你更累了，对方也未必感到被理解或有机会参与。"
        },
        {
          "title": "把熟悉的了解当作定论",
          "description": "过去受欢迎的相处方式，可能成为你心里可靠的答案。对方的阶段、兴趣或负荷改变后，原来的好意仍在，实际需要却可能不同，关系便容易在“我明明很了解你”中错过更新。"
        },
        {
          "title": "把自己的成本藏在付出后面",
          "description": "即使已经吃力，你也可能照常完成安排，很少说明需要别人怎样支持。若投入的时间与代价长期不可见，分工就不容易被重新讨论，你也更难知道对方是否愿意真正分担。"
        },
        {
          "title": "让过去盖过当前的相处",
          "description": "共同经历会增加关系的分量，也可能让你一再延后处理反复失约或不被尊重的现实。愿意继续投入需要结合当下的回应来判断，不能只用已经付出多久衡量是否还值得。"
        }
      ]
    },
    "intro": [
      "在亲近的关系里，你可能习惯把“我在乎你”变成具体行动：记得对方的偏好，提前想到生活里的需要，把共同安排认真放在心上。这种心意常藏在相处的细节中，却不一定自动被对方理解。你认为最有用的照顾，对方此刻可能更希望换成倾听、陪伴或自己作决定的空间。理解这个差别，能帮助你看清一次落差究竟来自表达方式不同、需要已经变化，还是长期缺少相互回应。",
      "你也可能把关系的延续看得很重，遇到不愉快时先维持日常，再慢慢消化自己的感受。需要留意的是，恢复联系不等于分歧已经处理，愿意付出也不等于还有余力。判断相处是否让你安心，可以观察：自己的需要能否说出来，拒绝或不同意见能否被尊重，商量过的调整有没有真正发生。这一章将把关心、承诺和边界放进具体情境，帮助你区分值得珍惜的默契、可以协商的差异，以及需要重新评估的长期负担。"
    ],
    "traitsUnlock": {
      "title": "理解这些倾向怎样影响你的选择",
      "intro": "结合一次真实经历，理解倾向的价值、可能的代价和可以调整的一步；这些是理解角度，不是额外测出的能力分数。",
      "items": [
        {
          "id": "relationship_trait_1",
          "label": "关心的表达",
          "role": "connection_style",
          "definition": "用自己留意到的具体细节，向对方传递重视。",
          "whyItMatters": "关心由行动和对方的体验共同构成；多做并不能替代了解。",
          "expression": "相处中，你可能先想到对方用得上的东西或容易遇到的不便。",
          "advantage": "细节有机会让关心更贴身，前提是它对应对方真实在意的事。",
          "overuseRisk": "记住细节可以让关心更贴身；若把偏好当成不变答案，好意也可能错过对方当下的需要。",
          "realWorldSignal": "准备被多次婉拒，或对方强调想自己处理，可以先更新了解，再决定怎样参与。",
          "upgradeHint": "下一次准备帮助前，问“你现在最需要我做什么”，留意实际回应是否与你预想一致。",
          "linksToExistingBlocks": {
            "risks": [
              "relationships.relRisks"
            ],
            "summary": [
              "relationships.summary"
            ],
            "strengths": [
              "relationships.strengths"
            ],
            "advantages": [
              "relationships.relAdvantages"
            ],
            "weaknesses": [
              "relationships.weaknesses"
            ]
          }
        },
        {
          "id": "relationship_trait_2",
          "label": "安全感的来源",
          "role": "trust_pattern",
          "definition": "通过熟悉的联系、明确的约定和持续的回应，理解彼此是否可靠。",
          "whyItMatters": "可靠包含可兑现和可协商，不要求两个人始终保持同一种联系频率。",
          "expression": "约定被临时改变时，你可能不只在意计划打乱，也想知道自己是否仍被放在心上。",
          "advantage": "可预期的联系能减少一些猜测，说明变化则给彼此重新协调的机会。",
          "overuseRisk": "熟悉的联系能带来可预期感；若把改变节奏直接理解成感情变淡，猜测便可能盖过真实处境。",
          "realWorldSignal": "你开始用回复速度推断关系好坏，却还没有核对对方的处境与双方约定。",
          "upgradeHint": "挑一项最近变化的联系安排，分别说清事实、自己的理解与希望确认的问题。",
          "linksToExistingBlocks": {
            "risks": [
              "relationships.relRisks"
            ],
            "summary": [
              "relationships.summary"
            ],
            "strengths": [
              "relationships.strengths"
            ],
            "advantages": [
              "relationships.relAdvantages"
            ],
            "weaknesses": [
              "relationships.weaknesses"
            ]
          }
        },
        {
          "id": "relationship_trait_3",
          "label": "投入与互惠",
          "role": "emotional_response",
          "definition": "在照顾对方的同时，观察自己的需要能否进入相处。",
          "whyItMatters": "只分配零碎帮忙，可能仍让一方独自承担记挂和协调，需要看完整责任。",
          "expression": "你可能习惯先完成眼前的照料，再考虑自己的疲惫是否值得提。",
          "advantage": "互惠允许贡献形式不同，但双方都需要有被支持、被尊重和参与决定的空间。",
          "overuseRisk": "实际分担能减轻眼前负担；若长期替双方安排和收尾，自己的辛苦与需要也可能逐渐不可见。",
          "realWorldSignal": "你总需要提醒、检查和补救，即使对方偶尔帮忙，实际负担也可能没有改变。",
          "upgradeHint": "选一项经常由你负责的事务，连同安排、执行和后续跟进一起讨论如何分担。",
          "linksToExistingBlocks": {
            "risks": [
              "relationships.relRisks"
            ],
            "summary": [
              "relationships.summary"
            ],
            "strengths": [
              "relationships.strengths"
            ],
            "advantages": [
              "relationships.relAdvantages"
            ],
            "weaknesses": [
              "relationships.weaknesses"
            ]
          }
        },
        {
          "id": "relationship_trait_4",
          "label": "承诺与修复",
          "role": "relational_tension",
          "definition": "重视共同经历，也愿意为关系的后续发展投入行动。",
          "whyItMatters": "承诺要结合当下的尊重、资源与行动来看，不能只凭过去的亲近判断。",
          "expression": "有分歧时，你可能想先保住关系，盼着多一点耐心就会慢慢变好。",
          "advantage": "珍惜关系能支持修复，但修复需要双方愿意理解并落实改变。",
          "overuseRisk": "珍惜共同经历可以支持修复；若只要日常还能继续就忽略反复失约，延续也可能遮住尚未处理的问题。",
          "realWorldSignal": "同一问题反复被答应却始终没有改变，值得重新讨论投入和界限，而不是独自加倍付出。",
          "upgradeHint": "回看一项双方商量过的调整：是否落实、卡在哪里、各自愿意怎样继续，再决定下一步。",
          "linksToExistingBlocks": {
            "risks": [
              "relationships.relRisks"
            ],
            "summary": [
              "relationships.summary"
            ],
            "strengths": [
              "relationships.strengths"
            ],
            "advantages": [
              "relationships.relAdvantages"
            ],
            "weaknesses": [
              "relationships.weaknesses"
            ]
          }
        }
      ]
    },
    "influentialTraits": [
      {
        "label": "关心的表达",
        "body": "用自己留意到的具体细节，向对方传递重视。",
        "colorKey": "green"
      },
      {
        "label": "安全感的来源",
        "body": "通过熟悉的联系、明确的约定和持续的回应，理解彼此是否可靠。",
        "colorKey": "green"
      },
      {
        "label": "投入与互惠",
        "body": "在照顾对方的同时，观察自己的需要能否进入相处。",
        "colorKey": "green"
      },
      {
        "label": "承诺与修复",
        "body": "重视共同经历，也愿意为关系的后续发展投入行动。",
        "colorKey": "green"
      }
    ]
  }
};

export function applyIsfjContent(data: PersonalityDesktopCloneContentPayload): PersonalityDesktopCloneContentPayload {
  if (data.fullCode !== "ISFJ-A") return data;
  return { ...data, content: { ...data.content, chapters: {
    ...data.content.chapters,
    career: { ...data.content.chapters.career, ...candidate.career },
    growth: { ...data.content.chapters.growth, ...candidate.growth },
    relationships: { ...data.content.chapters.relationships, ...candidate.relationships },
  } } };
}

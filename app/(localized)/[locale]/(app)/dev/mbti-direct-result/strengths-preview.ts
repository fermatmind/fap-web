import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
import type { StrengthWeaknessBlock } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

// Local editorial candidate for ISFJ-A. This does not replace published CMS content.
// These are editorial interpretations for self-reflection, not additional scores or
// evidence of individual ability. A/T is not used to infer empathy or competence.
const candidate: Record<"career" | "growth" | "relationships", {
  strengths: StrengthWeaknessBlock;
  weaknesses: StrengthWeaknessBlock;
}> = {
  "career": {
    "strengths": {
      "title": "你的强项",
      "items": [
        {
          "title": "留意实际需要",
          "description": "同事或服务对象遇到的具体不便，往往会引起你的注意。你愿意多了解他们缺少什么，让帮助真正贴合对方的处境。"
        },
        {
          "title": "持续兑现承诺",
          "description": "新鲜感过去后，你仍看重自己答应过的事。比起短暂地表现出色，你更愿意靠一次次兑现积累信任。"
        },
        {
          "title": "认真落实细节",
          "description": "对笼统的要求，你倾向于进一步想清楚具体该怎么做。那些看似不起眼、却影响使用体验的部分，往往值得你多花一点心思。"
        },
        {
          "title": "善用过往经验",
          "description": "遇到问题时，你会想起相似事情曾怎样处理、哪里容易出错。具体经历能为你的判断提供线索，而不只依靠抽象设想。"
        },
        {
          "title": "顾及合作感受",
          "description": "推进任务时，你也在意同事是否被尊重、是否理解安排。对你而言，完成工作与照顾合作关系往往同样重要。"
        },
        {
          "title": "重视实际贡献",
          "description": "当你看见自己的工作确实帮到了某个人，投入便更有意义。比起醒目的头衔，你可能更珍惜成果被真正用上的时刻。"
        }
      ]
    },
    "weaknesses": {
      "title": "你的短板",
      "items": [
        {
          "title": "让贡献隐身",
          "description": "你可能相信把工作做好，自然就会被看见。省略成果说明与发展诉求，却容易让别人只看见事情完成，没看见你的投入。"
        },
        {
          "title": "帮忙变成职责",
          "description": "你不愿看着事情没人处理，常会先补上缺口。临时帮忙一旦变成默认分工，自己的任务和发展时间就可能被不断挤占。"
        },
        {
          "title": "面对突变犹豫",
          "description": "当目标或做法突然改变，你可能先寻找熟悉的依据。若迟迟等不到足够确定的信息，也容易把必要的尝试一并推后。"
        },
        {
          "title": "细节挤占重点",
          "description": "你希望交出去的东西足够妥当，可能在局部反复打磨。时间有限时，这份认真也会挤掉对整体目标和优先顺序的关注。"
        },
        {
          "title": "异议留在心里",
          "description": "即使已经觉得安排不合理，你也可能先顾及气氛、继续配合。问题没有被说出来，别人便难以知道哪些地方需要重新商量。"
        },
        {
          "title": "留恋熟悉环境",
          "description": "熟悉的同事、流程和共同经历，会让离开变得不只是换份工作。即使发展空间已经变小，你也可能因为舍不得而迟迟不作选择。"
        }
      ]
    }
  },
  "growth": {
    "strengths": {
      "title": "你的强项",
      "items": [
        {
          "title": "耐心积累变化",
          "description": "你不一定需要一次显著的突破，才愿意继续努力。看得见的小进步，也能支持你把一件重要的事慢慢做下去。"
        },
        {
          "title": "从经历中反思",
          "description": "比起泛泛地评价自己，你更容易从一件具体事情回看得失：当时忽略了什么，哪种做法有用，下次想怎样调整。"
        },
        {
          "title": "让目标落地",
          "description": "面对想要的改变，你倾向于寻找生活中能落实的一步。把愿望变成可以开始的行动，有助于缩短“想改变”和“正在改变”的距离。"
        },
        {
          "title": "珍惜已有积累",
          "description": "学习新东西时，你愿意保留仍然有效的经验与习惯。成长因此可以接在已有基础上，而不必靠否定过去来证明自己改变了。"
        },
        {
          "title": "留心具体改善",
          "description": "你容易从日常感受到变化的价值：一次表达更清楚了，一件事不再那么费力。这些细小但真实的反馈，能帮助你辨认适合自己的方向。"
        },
        {
          "title": "在关心中拓宽视角",
          "description": "认真了解一个人的处境时，你也有机会看见与自己不同的需要和选择。对具体的人保持关心，能为你的自我理解带来新的参照。"
        }
      ]
    },
    "weaknesses": {
      "title": "你的短板",
      "items": [
        {
          "title": "用责任定义自己",
          "description": "当“我有没有尽到责任”成为评价自己的主要标准，你可能很难分清哪些事出于真心，哪些只是觉得自己不该拒绝。"
        },
        {
          "title": "感受总被搁置",
          "description": "你可能先问事情处理好了没有，却很少问自己是否愿意、是否疲惫。日常仍在运转，内在的不满足却可能一直没有被认真对待。"
        },
        {
          "title": "熟悉限制探索",
          "description": "新选择还没有可靠经验可循时，你可能更看重它的不确定。原本只是尚未尝试的方向，也容易被提前判断为不适合自己。"
        },
        {
          "title": "难以认可完成",
          "description": "事情做完后，你可能很快注意到还能改进的地方。若只用未完成的部分评价自己，已经付出的努力就很难带来满足感。"
        },
        {
          "title": "不习惯接受帮助",
          "description": "你习惯成为可靠、能照顾别人的那个人，轮到自己有困难时反而不容易开口。一直独自消化，可能让本可分担的问题越来越重。"
        },
        {
          "title": "休息也要有用",
          "description": "空下来时，你可能又开始整理、照料或补做事务。若休息必须以“做了点什么”才算值得，真正属于自己的空白就很难留下。"
        }
      ]
    }
  },
  "relationships": {
    "strengths": {
      "title": "你的强项",
      "items": [
        {
          "title": "记住细微偏好",
          "description": "对方随口提过的喜好、习惯和不便，往往会留在你的记忆里。关心因此不只是笼统的问候，也包含“你说过的事，我有放在心上”。"
        },
        {
          "title": "用行动表达亲近",
          "description": "你可能不常用热烈的语言表达感情，却愿意花时间做些实际的事。对你来说，陪伴与照料本身就是重要的表达方式。"
        },
        {
          "title": "愿意听完",
          "description": "亲近的人谈起烦恼时，你往往愿意留出时间，先了解事情对他意味着什么。这种耐心能为对方留下表达的空间。"
        },
        {
          "title": "珍惜共同经历",
          "description": "一起走过的日子、保留下来的小习惯，对你有具体的分量。你愿意记住并延续这些联系，让关系不只靠当下的热情维持。"
        },
        {
          "title": "在意表达分寸",
          "description": "即使意见不同，你也在意怎样说才不会轻易伤到对方。愿意顾及话语的影响，有助于让分歧仍有继续交流的余地。"
        },
        {
          "title": "认真对待约定",
          "description": "你把共同商量过的安排看作关系的一部分，而不只是随口一说。愿意记得、兑现和及时说明变化，能让彼此更清楚可以期待什么。"
        }
      ]
    },
    "weaknesses": {
      "title": "你的短板",
      "items": [
        {
          "title": "期待被自动理解",
          "description": "因为自己会留意对方的细微需要，你也可能期待对方同样懂你。需要没有说清时，落差容易被感受成“不够在乎”，而不只是信息没有传达。"
        },
        {
          "title": "为了和气压下分歧",
          "description": "你可能担心直接讨论不满会破坏亲近，于是照常相处、暂时不提。短暂的平静保住了，同一个问题却没有得到双方回应。"
        },
        {
          "title": "照顾变成代替",
          "description": "你想让对方轻松一点，可能不知不觉把选择和安排也接了过来。帮助超出对方需要时，既增加你的负担，也减少了对方参与的空间。"
        },
        {
          "title": "沿用过去的了解",
          "description": "曾经受欢迎的照顾方式，容易成为你心里可靠的答案。但对方的处境和偏好会变化，过去的默契仍需要用当下的交流来更新。"
        },
        {
          "title": "付出掩盖疲惫",
          "description": "即使已经累了，你也可能继续维持原有的照顾。对方看不见投入的成本，便很难知道你希望分担什么、哪些安排已经无法持续。"
        },
        {
          "title": "舍不得重设关系",
          "description": "共同经历会让你看重关系的延续，也可能让调整距离变得困难。当投入长期不对等时，过去的亲近容易盖过眼前需要正视的负担。"
        }
      ]
    }
  }
};

export function previewStrengths(data: PersonalityDesktopCloneContentPayload): PersonalityDesktopCloneContentPayload {
  if (data.fullCode !== "ISFJ-A") return data;
  return { ...data, content: { ...data.content, chapters: {
    ...data.content.chapters,
    career: { ...data.content.chapters.career, ...candidate.career },
    growth: { ...data.content.chapters.growth, ...candidate.growth },
    relationships: { ...data.content.chapters.relationships, ...candidate.relationships },
  } } };
}

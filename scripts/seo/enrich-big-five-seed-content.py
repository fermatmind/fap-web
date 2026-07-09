#!/usr/bin/env python3
"""Update existing Hub/Domain/Polarity seed entries with Truity benchmark content."""
import json, copy

SEED = "/Users/rainie/Desktop/GitHub/fap-api/backend/content_assets/personality_public/big_five_v1_seed.json"

with open(SEED, "r", encoding="utf-8") as f:
    seed = json.load(f)

assets = seed["assets"]
updated = 0

# ============================================================================
# HUB CONTENT — zh-CN
# ============================================================================

HUB_ZH = {
    "quick_answer": "大五人格不是一套固定类型的表格，而是用五个连续维度（开放性、尽责性、外向性、宜人性、神经质/情绪敏感性）描述人格差异。每个维度给出连续分数，没有高低好坏之分。",
    "how_to_read": "更有价值的问题不是\u201c我是哪一种人\u201d，而是\u201c这个倾向在什么场景下帮我，什么时候需要补充策略\u201d。高或低都不是排名，而是倾向被启动的容易程度。",
    "five_domains": "开放性关于探索和好奇，尽责性关于执行和条理，外向性关于能量来源和社交节奏，宜人性关于合作和边界，神经质/情绪敏感性关于压力信号和恢复。",
    "high_low_poles": "偏高表示该倾向更容易被启动，偏低表示更节制、谨慎或依赖不同模式。两端都有可用之处。偏高不是更好，偏低不是缺陷。",
    "facets_overview": "每个维度内部还有 6 个更窄的细分面向（facet），共 30 个，描述更具体的行为和倾向差异。比如开放性下的想象力、审美、想法探索等。",
    "use_cases": "大五人格语言用于自我理解、沟通风格探索、学习方式反思和团队协作设计。不是用于诊断、筛选或给一个人贴标签。",
    "not_for": "大五人格不用于临床诊断、招聘筛选、能力判断、智力评估或决定职业/伴侣关系。它是理解人格语言的参考框架，不是决策工具。",
    "example_path": "假设开放性偏高：容易对新想法感到兴奋，喜欢探索不同领域；但可能频繁启动新项目而难以收尾。了解这一点后，可以有意识地在需要深耕的任务中借用\u201c尽责性\u201d的策略来平衡。",
    "method_boundary": "本页解释大五人格的公共知识和沟通语言，不解读个人测评结果，也不替代专业判断。分数在不同阶段可能变化，不代表固定身份。",
    "action_prompt": "回想一个最近场景：这个维度帮你解决了什么，又可能使你忽略了什么？",
    "related_links": "查看五个维度的详细解析，了解 30 个细分面向，对比大五与 MBTI 的异同。",
}

HUB_ZH_NEW = {
    "test_intro": "大五人格测试通过约 120 道自评题目，从五个独立维度测量稳定的人格倾向，通常需要 15\u201320 分钟完成。测试不是诊断工具，不判断对错、好坏或能力高低\u2014\u2014它提供的是一个用来理解行为偏好和沟通风格的参考框架。每个维度给出从低到高的连续分数，帮助回答\u201c我在什么场景下倾向做什么，又在什么场景下需要补充策略\u201d。分数在不同阶段可能变化，不代表固定身份。",
    "self_reflection": "以下问题帮助你在完成测试前先建立直觉，不是替代测试结果，而是引导你注意日常中可能被忽略的倾向。\n\n**开放性**：你最近一次被一个新想法或陌生的艺术形式吸引是什么时候？在你熟悉的日常中，有哪些事你宁愿按老办法做？如果明天必须学一样完全陌生的东西，你的第一反应是兴奋还是抗拒？\n\n**尽责性**：你最近一次因为计划被打乱而感到烦躁是什么情境？你是更享受制定计划的过程，还是更享受计划完成后的成就感？在没有人监督的情况下，你的效率会变高还是变低？\n\n**外向性**：一次社交活动结束后，你的精力通常是在消耗还是补充？你更喜欢和三五个人深聊，还是在一大群人中自由切换？当你需要思考一个重要问题时，你倾向找人讨论还是独自整理？\n\n**宜人性**：你在冲突中是先理解对方感受，还是先陈述自己的立场？你更看重关系和谐，还是更看重把问题说清楚？当别人提出不合理要求时，你通常怎么回应？\n\n**神经质 / 情绪敏感性**：你最近一次感到压力时，那种感觉持续了多久？你更容易注意到环境中可能出错的地方，还是更容易注意到已经顺利的地方？当你情绪波动时，恢复到平稳状态通常需要多长时间？",
    "scientific_background": "大五人格的五个维度并非人为设计出来的，而是通过数十年跨语言、跨文化的词汇研究和因素分析自然浮现的。\n\n**起源**：20 世纪上半叶，研究者 Allport 和 Odbert 从英语词典中提取了数千个描述人格的词汇。后续研究者通过统计分析，发现这些词汇反复收敛到五个主要因素\u2014\u2014这就是\u201cBig Five\u201d名称的由来。\n\n**主要理论脉络**：\n- **五因素模型 (FFM)**：由 Costa 和 McCrae 提出，以 NEO-PI-R 量表为代表，包含 30 个 facet 的层级结构。\n- **大五 (Big Five)**：来自词汇研究传统，由 Goldberg、John 等人发展，以 BFI 和 IPIP 为代表，强调跨语言可重复性。\n- **IPIP**：公开量表生态，在研究中常被用作 NEO 的替代工具。\n\nFFM 和 Big Five 共享同样的五个维度命名，研究高度交叉引用，但理论基础和量表编制路径有所不同。大五维度的跨文化可重复性、重测信度和与行为指标的关联已积累了大量实证文献。",
}

# ============================================================================
# DOMAIN higher_and_lower rewrites — zh-CN
# ============================================================================

DOMAIN_HL_ZH = {
    "openness": "**偏高时可能的倾向**：对新想法和体验保持好奇，愿意尝试不同路径，审美和抽象思考容易被启动，对变化适应较快。\n\n**偏低时可能的倾向**：偏好熟悉和可预测的结构，重视务实和效率，在已知框架内深挖而非不断探索新方向，对常规和传统有稳定的舒适感。\n\n偏高和偏低都不是缺陷。偏高的挑战在于可能忽略深度和坚持\u2014\u2014频繁开始新项目但收尾困难，或因为新奇而低估已有方法的可靠性。偏低的优势在于专注和稳定\u2014\u2014能将一套方法打磨到极致，在需要长期投入的任务中体现出持续力。\n\n**场景对照**：面对一项需要创新的任务，偏高者可能先提出五个方向再逐步收敛；偏低者可能先选定一个可靠路径再逐步优化。两种策略在不同任务中都可能成功，关键是理解自己的默认倾向并在需要时有意识地借用另一端的策略。",
    "conscientiousness": "**偏高时可能的倾向**：重视计划和条理，追求目标的完成感和秩序感，自我约束力较强，在需要长期坚持的任务中有稳定的执行力。\n\n**偏低时可能的倾向**：偏好灵活和自发性，能根据当下情况快速调整优先级，对严格的流程和时限感到约束，在开放和变动环境中更自如。\n\n偏高和偏低都各有适用场景。偏高的挑战在于可能过度控制\u2014\u2014因为计划被打乱而沮丧，或因为追求完美而延迟行动。偏低的优势在于适应力\u2014\u2014能快速应对变化，在需要灵活转向的任务中不会因为固守原计划而错失机会。\n\n**场景对照**：一个需要交付的项目，偏高者可能提前拆解任务、设定里程碑、每天检查进度；偏低者可能在截止日期前集中火力完成，过程中保持对其他可能性的开放。两种节奏各有用处，关键是找到与任务要求和团队协作匹配的方式。",
    "extraversion": "**偏高时可能的倾向**：从社交互动中获取能量，善于发起对话和活跃气氛，表达直接且外显，在需要快速建立联系和团队协作的场景中感到舒适。\n\n**偏低时可能的倾向**：从独处和深度思考中恢复能量，偏好小范围或一对一的交流，表达更内敛，在需要独立专注和深度加工的任务中有优势。\n\n偏高和偏低反映的是能量来源和表达方式的差异，不是社交能力的高低。偏高的挑战在于可能忽略独处恢复的必要\u2014\u2014连续高强度社交后精力透支，或在需要深度思考的场合难以沉下来。偏低的优势在于独立工作的持续力\u2014\u2014能在安静和独处中产出高质量成果。\n\n**场景对照**：一场团队头脑风暴，偏高者可能率先发言、带动讨论节奏；偏低者可能在听完整场后提出一个经过深思熟虑的关键观察。两种贡献方式都有价值，好的团队会为两种节奏都留出空间。",
    "agreeableness": "**偏高时可能的倾向**：重视合作和关系和谐，善于感知他人需求和情感信号，在冲突中倾向于先理解和共情，团队协作中愿意承担协调和支持角色。\n\n**偏低时可能的倾向**：重视直接和坦诚，倾向于把问题和立场说清楚而非先照顾情绪，在需要坚持原则和独立判断的场景中有明显的果断力。\n\n偏高和偏低各有优势。偏高的挑战在于可能过度迁就\u2014\u2014为了维持和谐而压抑自己的需求，或在需要明确拒绝的时候因为不忍心而模糊边界。偏低的优势在于清晰和效率\u2014\u2014能在需要快速决策和明确规则的任务中避免情感干扰。\n\n**场景对照**：团队中出现意见分歧，偏高者可能先确认每个人的感受再寻找共识方案；偏低者可能直接指出分歧的实质并提出解决框架。两种方式在不同文化和任务类型中各有适用场景，关键在于了解自己的默认模式并在需要时灵活调整。",
    "neuroticism": "**偏高时可能的倾向**：对环境中的风险和威胁信号更敏感，情绪反应更强烈且恢复时间较长，在压力下容易反复思考和预演最坏情况，对不确定性的耐受度较低。\n\n**偏低时可能的倾向**：情绪状态更平稳，压力恢复更快，对负面信号的关注较少，在不确定和高压环境中能保持相对稳定的节奏。\n\n偏高和偏低反映的是神经系统对环境信息的过滤和反应方式，不是心理健康的判断标准。偏高的价值在于预警和审慎\u2014\u2014能提前识别他人忽略的风险，在需要细致把关的任务中体现出保护性。偏高的挑战在于消耗\u2014\u2014持续的高警觉状态会增加恢复成本，可能影响决策效率和生活质量。偏低的优势在于稳定和高效\u2014\u2014能在压力和变动中保持执行力和情绪资源。\n\n**场景对照**：面对一个不确定的决策，偏高者可能花更多时间扫描风险、考虑所有可能的负面结果后再行动；偏低者可能更快做出判断并进入执行。两种方式各有价值：前者降低意外风险，后者提升行动速度。关键是识别什么场景需要警觉，什么场景更适合放松判断。",
}

DOMAIN_ACTION_ZH = {
    "openness": "回想一个最近场景：这个维度帮你解决了什么，又可能使你忽略了什么？",
    "conscientiousness": "回想一个最近场景：这个维度帮你解决了什么，又可能使你忽略了什么？",
    "extraversion": "回想一个最近场景：这个维度帮你解决了什么，又可能使你忽略了什么？",
    "agreeableness": "回想一个最近场景：这个维度帮你解决了什么，又可能使你忽略了什么？",
    "neuroticism": "回想一个最近场景：这个维度帮你解决了什么，又可能使你忽略了什么？",
}

# ============================================================================
# DOMAIN new sections — zh-CN
# ============================================================================

DOMAIN_EXTRA_ZH = {
    "agreeableness": {
        "cooperation_boundaries": "宜人性的核心张力在于合作意愿与个人边界之间的协调。在需要协作和共情的场景中（如团队支持、客户关系），较高宜人性是明显优势；但在需要坚持原则或拒绝不合理请求的场景中，较低宜人性反而更高效。理解宜人性的关键在于：它不是\u201c对人好\u201d或\u201c对人差\u201d的简单判定，而是你在多大程度上将关系因素纳入决策考量。一个知道自己边界在哪里的高宜人性者，和一个懂得在关键时表达关怀的低宜人性者，都可能比固守单一策略更有适应性。",
    },
    "neuroticism": {
        "emotional_regulation": "神经质维度的实际影响不只体现在\u201c是否容易感到压力\u201d，更体现在压力之后的恢复过程和调节策略。偏高通常意味着情绪启动更快、峰值更高、恢复到平稳需要更长时间\u2014\u2014这不等于无法调节，只是恢复成本更高。偏低则通常意味着情绪反应更温和、恢复到基线更快。无论偏高或偏低，情绪调节都是可训练的能力。了解自己的基线反应模式后，可以有意识地建立适合自己节奏的恢复策略\u2014\u2014如独处、运动、结构化反思或社交支持\u2014\u2014而不是简单地把情绪波动视为问题。",
    },
}

# ============================================================================
# POLARITY section expansions — zh-CN
# ============================================================================

POLARITY_STRENGTHS_ZH = {
    "high-openness": "高开放性在需要创意、灵活适应和多视角思考的场景中提供明显优势。它帮助你更快地识别新机会、在信息有限时做出合理的探索性判断、以及在跨领域合作中连接不同的想法和资源。这种优势在创业、研发、教育和艺术领域尤为突出。",
    "low-openness": "低开放性在需要稳定性、深度专注和务实执行的场景中提供明显优势。它帮助你在熟悉领域内持续深耕、在流程性工作中保持一致性、以及在需要长期投入的项目中不因新鲜感消退而失去动力。这种优势在精密制造、财务审计和传统工艺中尤为突出。",
    "high-conscientiousness": "高尽责性在需要长期规划、可靠交付和精细管理的场景中提供明显优势。它帮助你建立可持续的工作节奏、在截止日期前准时交付成果、以及在团队中成为可依赖的支柱。这种优势在项目管理、工程和质量控制领域尤为突出。",
    "low-conscientiousness": "低尽责性在需要灵活性、快速适应和即兴发挥的场景中提供明显优势。它帮助你在计划被打乱时迅速重新定位、在信息不完整时果断行动、以及在需要尝试多种方案的探索阶段保持开放。这种优势在创意产业、创业和危机处理中尤为突出。",
    "high-extraversion": "高外向性在需要快速建立关系、活跃团队氛围和公开表达的场景中提供明显优势。它帮助你在社交网络中快速拓展资源、在团队讨论中激发更多互动、以及在需要公众演讲和对外沟通的角色中表现自然。这种优势在销售、公关和教学领域尤为突出。",
    "low-extraversion": "低外向性在需要深度思考、独立工作和细致分析场景中提供明显优势。它帮助你在安静环境中保持高度专注、在复杂问题前进行系统性的独立思考、以及在需要倾听和观察的角色中捕捉细节。这种优势在研发、写作和数据分析领域尤为突出。",
    "high-agreeableness": "高宜人性在需要协作、信任建立和冲突化解的场景中提供明显优势。它帮助你快速感知他人的情绪状态和需求、在团队中自然地承担协调和支持角色、以及在需要多方共识的复杂沟通中推动合作。这种优势在服务、教育和团队领导领域尤为突出。",
    "low-agreeableness": "低宜人性在需要独立判断、坚持原则和高效决策的场景中提供明显优势。它帮助你在情感压力下保持理性判断、在需要明确边界和规则的情况下果断行事、以及在竞争性环境中维护自己的合理利益。这种优势在谈判、法律和战略决策领域尤为突出。",
    "high-neuroticism": "高神经质在需要风险预警、细节把关和深度反思的场景中提供明显优势。它帮助你提前识别他人可能忽略的风险信号、在不确定性中保持警觉并预准备方案、以及在做与安全、质量和合规相关的判断时格外审慎。这种优势在安全工程、质量管理和医疗领域尤为突出。",
    "emotional-stability": "情绪稳定性在需要高压决策、持续稳定输出和危机应对的场景中提供明显优势。它帮助你在压力环境中保持判断力不下降、在长期高强度工作中保护心理资源不被耗尽、以及在面对不确定性和挑战时维持团队信心。这种优势在急救、飞行和高管决策领域尤为突出。",
}

POLARITY_TRADEOFFS_ZH = {
    "high-openness": "过度依赖开放性可能导致注意力分散、频繁切换方向而难以深入、或因为对新事物的追求而忽略对已有方案的深化和完善。在某些需要严格遵守流程和标准的场景中（如安全操作、财务合规），高开放性如果未加调节可能成为风险因素。",
    "low-openness": "过度依赖低开放性可能导致对变化的反应滞后、在需要创新时缺乏探索意愿、或因为对熟悉模式的偏好而错过潜在的机会。在某些快速变化的行业和技术领域，如果完全拒绝新方向和外部信息，可能逐渐在方法和视野上落伍。",
    "high-conscientiousness": "过度依赖尽责性可能导致僵化和过度控制\u2014\u2014对计划和秩序的追求演变为不容任何变动的完美主义，对自己和他人设定不切实际的标准，或在效率和灵活性要求高的场景中因为层层审核而丧失时机。",
    "low-conscientiousness": "过度依赖低尽责性可能导致承诺不可靠、重要任务反复延期、或因为缺乏系统性的规划而在长期项目中出现无法弥补的累积性延误。在某些对可靠性和精确度有刚性要求的场景中，缺乏结构会造成实际后果。",
    "high-extraversion": "过度依赖外向性可能导致过度依赖外部刺激来维持状态\u2014\u2014独处时感到空虚、在需要深度思考的工作中难以沉下心来、或因为过于关注外部反馈而忽视了自己的内在需求。在某些需要深度分析和独立工作的场景中可能成为障碍。",
    "low-extraversion": "过度依赖内向可能导致在需要主动表达、建立关系和拓展影响力的场景中错失机会。在某些重社交和组织文化的团队和工作环境中，被动沟通可能被误解为缺乏投入或不善合作。",
    "high-agreeableness": "过度依赖宜人性可能导致边界模糊和资源透支\u2014\u2014为了维持和谐而过度迁就他人、在需要明确拒绝时难以开口、或在长期的单向付出中积累隐性的情感成本和怨恨。",
    "low-agreeableness": "过度依赖低宜人性可能导致在需要协作和关系维护的场景中引发更多摩擦\u2014\u2014直接的表达方式被误解为攻击、对独立判断的坚持被看作是拒绝合作、或在需要情感支持和团队凝聚力的时刻缺乏足够的连接。",
    "high-neuroticism": "过度依赖高敏感度可能带来长期的精力透支和持续的焦虑状态\u2014\u2014对每个风险信号都高度警觉会导致决策疲惫和恢复成本过高。在某些需要快速判断和大胆行动的领域，过度审慎可能成为实质性障碍。",
    "emotional-stability": "情绪稳定在某些情境中如果表现过度可能被误读为不够关注或缺乏紧迫感\u2014\u2014在需要及时响应他人情绪变化或高风险场景中，过于平稳的反应可能会让他人感到不被重视。",
}

POLARITY_MISUNDERSTANDING_ZH = {
    "high-openness": "高开放性不代表更聪明、更有创造力或更适合创新工作。它描述的是对新颖和变化的舒适度，不等于智力水平或实际产出质量。一个低开放性的工程师可能产出更具原创性的解决方案。",
    "low-openness": "低开放性不代表保守、顽固或缺乏创造力。它描述的是对熟悉和稳定的偏好，不等于拒绝改变或能力不足。许多领域的高手恰恰是因为长期深耕而非不断切换才达到顶尖水平。",
    "high-conscientiousness": "高尽责性不代表更成功、更高效或更受欢迎。它描述的是对秩序和坚持的倾向，在某些松散和创意驱动的文化中可能反而不适应。",
    "low-conscientiousness": "低尽责性不代表不负责任、懒惰或缺乏能力。它描述的是对灵活和自发性节奏的偏好，不等于不能交付高质量成果。很多高效产出者是短周期集中爆发型而非持续稳定输出型。",
    "high-extraversion": "高外向性不代表更擅长沟通、更适合领导或更受欢迎。它描述的是能量获取方式的偏好，不等于社交技能水平。有效的沟通和领导有多种风格。",
    "low-extraversion": "低外向性不代表不善于社交、性格孤僻或能力不足。它描述的是能量获取方式的偏好，不等于社交能力高低的判断。许多低外向性者在深度沟通和一对一交流中表现出色。",
    "high-agreeableness": "高宜人性不代表没有主见、容易被利用或不适合领导。它描述的是在决策中纳入关系因素的重视程度，不等于缺乏判断力。许多高宜人力领导者以建立信任和赋能团队著称。",
    "low-agreeableness": "低宜人性不代表不友善、冷漠或不合作。它描述的是表达直接和问题的重视程度高于关系的重视程度，不等于缺乏同理心或社交能力。",
    "high-neuroticism": "高神经质 / 高情绪敏感性不代表心理不健康、脆弱或不适合承担责任。它描述的是对风险信号的敏感度和情绪体验强度，不等于无法应对压力。许多高敏感者在需要细致判断和风险管控的领域表现优秀。",
    "emotional-stability": "情绪稳定性不代表不关心、不投入或缺乏感受。它描述的是情绪反应的强度和恢复速度，不等于情感深度或对他人的关怀程度。",
}

POLARITY_NEW_FAQ_ZH = {
    "high-openness": ("高开放性的人适合什么工作环境？", "高开放性通常在新想法被欢迎、允许探索和实验的环境中最舒适。创意、研发、学术和创业领域对高开放性有天然的吸引力。但适合与否还取决于其他维度和具体技能、机会，不能单靠开放性判断。"),
    "low-openness": ("低开放性的人如何拓展视野？", "低开放性不需要\u201c修复\u201d\u2014\u2014务实和专注本身就是优势。如果希望适度拓展，可以从小范围开始：每月尝试一种新活动、接触一个新领域的人、或对熟悉的领域提出一个之前没想过的问题。关键是找到适合自己的节奏而非模仿高开放性者的方式。"),
    "high-conscientiousness": ("高尽责性会过于完美主义吗？", "高尽责性与完美主义有关联但不等同。高尽责性是在意完成质量和秩序，完美主义则是将标准设到难以达到的高度并因此产生焦虑。如果高尽责性带来了过度压力，可以练习\u201c够好就行\u201d的标准\u2014\u2014区分哪些任务需要 100%，哪些 80% 就足够了。"),
    "low-conscientiousness": ("低尽责性如何提高执行力？", "低尽责性不是缺陷而是一种不同的节奏偏好。如果希望在特定任务上提高执行力，可以尝试外部结构：把大目标拆成小步骤、设置外部截止日期、邀请他人监督或协作。关键是借用环境设计来补充而非试图\u201c改变\u201d自己的倾向。"),
    "high-extraversion": ("高外向性需要刻意安排独处吗？", "是的。高外向性者通过社交获取能量，但持续的高强度社交同样会消耗资源。刻意安排独处时间\u2014\u2014即使只是每天 15 分钟的安静阅读或散步\u2014\u2014可以帮助恢复和整合社交中获得的信息，保持长期可持续的状态。"),
    "low-extraversion": ("低外向性的人如何在需要大量社交的工作中保持状态？", "低外向性者可以将社交视为一种\u201c技能\u201d而非\u201c必须享受的事\u201d。关键策略包括：提前规划社交时段并在之后安排恢复时间、将社交分解为多次短时段而非一次长时段、在社交中使用一对一的深度交流代替大群体互动。核心是管理能量而非回避社交。"),
    "high-agreeableness": ("高宜人性如何避免被过度索取？", "设置明确的边界和时间限制、练习说\u201c我现在不方便\u201d而非\u201c我不愿意\u201d、区分\u201c必须帮忙\u201d和\u201c可以选择帮忙\u201d的情境。高宜人性的优势在于建立信任和合作\u2014\u2014保护好自己的边界才能让这种优势长期可持续。"),
    "low-agreeableness": ("低宜人性的人如何在团队中更顺畅地合作？", "低宜人性的优势在于清晰和果断。在团队协作中，可以利用这种优势来提出结构化的方案和明确的分工。需要补充的是：在表达不同意见之前，先用一句话确认你理解了对方的出发点；在需要退让的场景中有意识地让步一两小步。"),
    "high-neuroticism": ("高神经质如何转化为优势？", "高神经质带来的警觉性和风险感知能力在很多领域是宝贵的\u2014\u2014质量把控、安全检查、战略预判都需要这种\u201c看到最坏情况\u201d的能力。关键是建立情绪管理策略：区分\u201c有用的警觉\u201d和\u201c无用的反复担忧\u201d，前者值得重视，后者需要学会搁置。"),
    "emotional-stability": ("情绪稳定和情感冷漠有什么区别？", "情绪稳定是指你不会因为日常压力和挫折而产生大幅情绪波动，恢复速度较快。情感冷漠则是对他人的感受缺乏关注和回应。两者完全不同\u2014\u2014一个情绪稳定的人可以非常温暖和共情，只是情绪基线更平稳。"),
}

# ============================================================================
# EN CONTENT (lighter translations)
# ============================================================================

HUB_EN = {
    "quick_answer": "The Big Five is not a table of fixed personality types. It uses five continuous dimensions: openness, conscientiousness, extraversion, agreeableness, and neuroticism or emotional sensitivity. Each dimension gives a continuous score — there is no high-is-better or low-is-worse.",
    "how_to_read": "The useful question is not which box a person belongs in, but where a tendency helps, where it costs something, and what adjustment would improve the next situation. Higher and lower describe how readily a tendency appears — not a ranking.",
    "five_domains": "Openness concerns exploration and curiosity; conscientiousness execution and order; extraversion energy source and social rhythm; agreeableness cooperation and boundaries; neuroticism stress signals and recovery.",
    "high_low_poles": "High and low poles describe how readily a tendency appears. Higher is not better, and lower is not a flaw — both ends have usable strengths in the right context.",
    "facets_overview": "Inside each of the five broad domains, there are six narrower facets (30 total) that describe more specific behavioral and tendency differences — for example, imagination, aesthetics, and ideas under Openness.",
    "use_cases": "Use Big Five language for self-understanding, communication-style exploration, learning reflection, and collaboration design — not for diagnosis, screening, or labeling a person.",
    "not_for": "The Big Five is not used for clinical diagnosis, hiring, ability assessment, intelligence evaluation, or deciding career or relationship questions. It is a reference framework for understanding personality language, not a decision tool.",
    "example_path": "If openness is high: easily excited by new ideas, likes exploring different fields; but may frequently start new projects while struggling to finish. Being aware of this, you can consciously borrow conscientiousness strategies for tasks that need deep focus.",
    "method_boundary": "This page explains public knowledge about Big Five personality and how to talk about it. It does not interpret individual assessment results or substitute for professional judgment. Scores can vary over time and do not represent a fixed identity.",
    "action_prompt": "Think of a recent situation: what did this tendency help you accomplish, and what might it have caused you to overlook?",
    "related_links": "Explore detailed breakdowns of all five dimensions, learn about the 30 facets, and compare the Big Five with the MBTI.",
}

HUB_EN_NEW = {
    "test_intro": "The Big Five test uses about 120 self-report items to measure stable personality tendencies across five independent dimensions, typically taking 15–20 minutes. The test is not a diagnostic tool and does not judge right/wrong, good/bad, or ability — it provides a reference framework for understanding behavioral preferences and communication styles. Each dimension yields a continuous score, helping answer: 'In what situations do I tend to do what, and where might I need a complementary strategy?' Scores may change over time and do not represent a fixed identity.",
    "self_reflection": "These questions help you build intuition before taking the test. They are not a substitute for test results but a guide to noticing tendencies you may overlook in daily life.\n\n**Openness**: When was the last time a new idea or unfamiliar art form captured your attention? In your familiar routines, what do you still prefer to do the old way? If you had to learn something completely unfamiliar tomorrow, would your first reaction be excitement or resistance?\n\n**Conscientiousness**: When was the last time you felt frustrated because a plan got disrupted? Do you enjoy the process of planning more, or the satisfaction of completing a plan? Without anyone supervising, does your productivity go up or down?\n\n**Extraversion**: After a social event, does your energy typically feel depleted or recharged? Do you prefer deep conversations with a few people, or freely moving among a larger group? When you need to think through an important issue, do you tend to discuss it or sort it out alone?\n\n**Agreeableness**: In a conflict, do you first try to understand the other person's feelings or first state your position? Do you value harmony more, or clarity more? When someone makes an unreasonable request, how do you typically respond?\n\n**Neuroticism / Emotional Sensitivity**: The last time you felt stressed, how long did that feeling last? Are you more likely to notice what could go wrong, or what is already going well? When your emotions fluctuate, how long does it take you to return to baseline?",
    "scientific_background": "The five dimensions of the Big Five were not designed by any single researcher — they emerged naturally through decades of cross-language, cross-cultural lexical research and factor analysis.\n\n**Origins**\nIn the early 20th century, researchers Allport and Odbert extracted thousands of personality-descriptive words from the English dictionary. Subsequent statistical analysis showed these words consistently converged into five major factors — hence the name 'Big Five.'\n\n**Major Theoretical Traditions**\n- **Five Factor Model (FFM)**: Proposed by Costa and McCrae, represented by the NEO-PI-R inventory, including a hierarchical structure of 30 facets.\n- **Big Five (Lexical)**: From the lexical research tradition, developed by Goldberg, John, and others, represented by BFI and IPIP, emphasizing cross-language replicability.\n- **IPIP (International Personality Item Pool)**: An open-source item pool, often used as an alternative to NEO in research.\n\nFFM and Big Five share the same five dimension names and highly cross-reference each other in research, but differ in theoretical foundation and scale development approaches. The Big Five dimensions have accumulated substantial empirical evidence for cross-cultural replicability, test-retest reliability, and associations with behavioral indicators.",
}

DOMAIN_HL_EN = {
    "openness": "**High** tendencies: Curious about new ideas and experiences, willing to try different paths, aesthetics and abstract thinking are easily engaged, adapts quickly to change.\n\n**Low** tendencies: Prefers familiar and predictable structures, values practicality and efficiency, digs deep within known frameworks rather than exploring new directions, has stable comfort with routine and tradition.\n\nNeither high nor low is a flaw. The challenge of high openness is the risk of overlooking depth and persistence — frequently starting new projects but struggling to finish, or underestimating the reliability of existing methods due to novelty. The advantage of low openness is focus and stability — refining one approach to mastery and sustaining long-term effort.\n\n**Scenario**: Facing an innovation task, a high-openness person might propose five directions before narrowing down; a low-openness person might first pick one reliable path and then optimize. Both strategies can succeed in different tasks — the key is understanding your default tendency and consciously borrowing strategies from the other end when needed.",
    "conscientiousness": "**High** tendencies: Values planning and order, driven by completion and structure, strong self-discipline, steady execution in tasks requiring long-term persistence.\n\n**Low** tendencies: Prefers flexibility and spontaneity, quickly reprioritizes based on the moment, feels constrained by rigid processes and deadlines, more comfortable in open and changing environments.\n\nBoth ends suit different contexts. The challenge of high conscientiousness is over-control — frustration when plans are disrupted, or delayed action due to perfectionism. The advantage of low conscientiousness is adaptability — quick pivoting when things change, and not losing opportunities by clinging to the original plan.\n\n**Scenario**: For a project that must be delivered, a high-scoring person may break it into tasks, set milestones, and check progress daily; a low-scoring person may concentrate effort near the deadline while keeping options open. Both rhythms are useful — the key is matching them to the task and team.",
    "extraversion": "**High** tendencies: Gains energy from social interaction, skilled at initiating conversation and energizing a group, direct and expressive, comfortable in settings requiring quick connection and teamwork.\n\n**Low** tendencies: Recovers energy through solitude and deep thinking, prefers small-group or one-on-one interaction, more reserved in expression, has advantages in tasks requiring independent focus and deep processing.\n\nHigh and low reflect differences in energy source and expression style, not social skill. The challenge of high extraversion is neglecting the need for solitary recovery — burnout from back-to-back high-intensity socializing, or difficulty settling into deep-focus work. The advantage of low extraversion is sustained independent productivity — producing high-quality work in quiet and solitude.\n\n**Scenario**: In a team brainstorm, a high-extraversion person may speak first and drive the discussion; a low-extraversion person may listen to the whole session and then offer one deeply considered insight. Both contributions have value — good teams make room for both rhythms.",
    "agreeableness": "**High** tendencies: Values cooperation and relational harmony, good at sensing others' needs and emotional signals, tends to understand and empathize first in conflict, willingly takes coordination and support roles in teams.\n\n**Low** tendencies: Values directness and candor, tends to clarify the issue and their position before attending to emotions, shows clear decisiveness in situations requiring principle and independent judgment.\n\nBoth ends have strengths. The challenge of high agreeableness is over-accommodation — suppressing one's own needs to maintain harmony, or blurring boundaries when a clear no is needed. The advantage of low agreeableness is clarity and efficiency — avoiding emotional interference in tasks requiring fast decisions and clear rules.\n\n**Scenario**: When the team disagrees, a high-agreeableness person may first check everyone's feelings before seeking consensus; a low-agreeableness person may directly name the substance of the disagreement and propose a resolution framework. Both approaches work in different cultures and task types — the key is knowing your default and flexing when needed.",
    "neuroticism": "**High** tendencies: More sensitive to risk and threat signals in the environment, more intense emotional reactions with longer recovery time, under stress tends to ruminate and rehearse worst-case scenarios, lower tolerance for uncertainty.\n\n**Low** tendencies: More even emotional state, faster recovery from stress, less attention to negative signals, can maintain a relatively steady rhythm in uncertain and high-pressure environments.\n\nHigh and low reflect how your nervous system filters and reacts to environmental information, not a judgment of mental health. The value of high neuroticism is alertness and caution — spotting risks others miss, providing protective thoroughness in tasks requiring detail. The challenge is the cost — sustained high alertness increases recovery cost and may affect decision efficiency and quality of life. The advantage of low neuroticism is stability and efficiency — maintaining execution and emotional resources under pressure and change.\n\n**Scenario**: Facing an uncertain decision, a high-neuroticism person may spend more time scanning risks and considering all possible negative outcomes before acting; a low-neuroticism person may judge faster and move to execution. Both ways have value: the former reduces unexpected risks, the latter increases action speed. The key is knowing when vigilance is needed and when relaxed judgment serves better.",
}

DOMAIN_EXTRA_EN = {
    "agreeableness": {
        "cooperation_boundaries": "The core tension in agreeableness lies between cooperation and personal boundaries. In contexts requiring collaboration and empathy (team support, client relations), higher agreeableness is a clear advantage; but in contexts requiring firm principles or refusal of unreasonable requests, lower agreeableness can be more effective. The key to understanding agreeableness is this: it's not a simple judgment of being 'nice' or 'difficult' — it's about how much weight you give to relational factors in your decisions. A high-agreeableness person who knows their boundaries, and a low-agreeableness person who knows when to show care, can both be more adaptive than someone locked into a single strategy.",
    },
    "neuroticism": {
        "emotional_regulation": "The practical impact of neuroticism isn't only about whether you feel stress — it's about the recovery process and regulation strategies afterward. Higher scores typically mean faster emotional activation, higher peaks, and longer recovery to baseline — this does not mean you cannot regulate, just that recovery costs more. Lower scores typically mean milder emotional reactions and faster return to baseline. Whether high or low, emotional regulation is a trainable skill. Understanding your baseline patterns lets you consciously build recovery strategies at your own rhythm — solitude, exercise, structured reflection, or social support — rather than treating emotional fluctuation as a problem.",
    },
}

POLARITY_STRENGTHS_EN = {
    "high-openness": "High openness provides clear advantages in scenarios requiring creativity, flexible adaptation, and multi-perspective thinking. It helps you identify new opportunities faster, make reasonable exploratory judgments with limited information, and connect diverse ideas across domains. This advantage stands out in entrepreneurship, R&D, education, and the arts.",
    "low-openness": "Low openness provides clear advantages in scenarios requiring stability, deep focus, and pragmatic execution. It helps you drill deep in familiar territory, maintain consistency in process-based work, and sustain motivation in long-term projects beyond the initial novelty. This advantage stands out in precision manufacturing, financial auditing, and traditional craftsmanship.",
    "high-conscientiousness": "High conscientiousness provides clear advantages in scenarios requiring long-term planning, reliable delivery, and meticulous management. It helps you build sustainable work rhythms, meet deadlines consistently, and become a dependable pillar in teams. This advantage stands out in project management, engineering, and quality control.",
    "low-conscientiousness": "Low conscientiousness provides clear advantages in scenarios requiring flexibility, quick adaptation, and improvisation. It helps you reposition quickly when plans are disrupted, act decisively with incomplete information, and stay open during exploratory phases. This advantage stands out in creative industries, startups, and crisis handling.",
    "high-extraversion": "High extraversion provides clear advantages in scenarios requiring rapid relationship-building, team atmosphere, and public expression. It helps you expand your network, spark more interaction in team discussions, and appear natural in public speaking and external communication. This advantage stands out in sales, PR, and teaching.",
    "low-extraversion": "Low extraversion provides clear advantages in scenarios requiring deep thinking, independent work, and detailed analysis. It helps you maintain intense focus in quiet environments, engage in systematic independent thinking on complex problems, and catch details in listening and observation. This advantage stands out in R&D, writing, and data analysis.",
    "high-agreeableness": "High agreeableness provides clear advantages in scenarios requiring collaboration, trust-building, and conflict resolution. It helps you quickly perceive others' emotional states and needs, naturally take coordination and support roles in teams, and facilitate cooperation in complex multi-stakeholder communication. This advantage stands out in service, education, and team leadership.",
    "low-agreeableness": "Low agreeableness provides clear advantages in scenarios requiring independent judgment, principled stands, and efficient decision-making. It helps you maintain rational judgment under emotional pressure, act decisively when boundaries and rules are needed, and protect your legitimate interests in competitive environments. This advantage stands out in negotiation, law, and strategic decision-making.",
    "high-neuroticism": "High neuroticism provides clear advantages in scenarios requiring risk alertness, detail-checking, and deep reflection. It helps you spot risk signals others may miss, stay vigilant amid uncertainty with contingency plans, and be especially thorough in judgments involving safety, quality, and compliance. This advantage stands out in safety engineering, quality management, and healthcare.",
    "emotional-stability": "Emotional stability provides clear advantages in scenarios requiring high-pressure decisions, sustained steady output, and crisis response. It helps you maintain judgment under pressure, preserve psychological resources through long high-intensity work, and sustain team confidence through uncertainty and challenge. This advantage stands out in emergency response, aviation, and executive decision-making.",
}

POLARITY_TRADEOFFS_EN = {
    "high-openness": "Over-reliance on openness can lead to scattered attention, frequent direction changes that prevent depth, or neglecting to deepen and refine existing approaches in pursuit of novelty. In contexts requiring strict process adherence (safety operations, financial compliance), unchecked high openness can be a risk factor.",
    "low-openness": "Over-reliance on low openness can lead to lagging response to change, lack of exploration when innovation is needed, or missed opportunities due to preference for familiar patterns. In rapidly changing industries, fully rejecting new directions and external input may gradually narrow your methods and perspective.",
    "high-conscientiousness": "Over-reliance on conscientiousness can lead to rigidity and over-control — planning and order becoming uncompromising perfectionism, setting unrealistic standards for self and others, or losing windows of opportunity in settings that demand efficiency and flexibility.",
    "low-conscientiousness": "Over-reliance on low conscientiousness can lead to unreliable commitments, repeated task delays, or cumulative delays in long-term projects from lack of systematic planning. In contexts with rigid requirements for reliability and precision, this can have real consequences.",
    "high-extraversion": "Over-reliance on extraversion can lead to depending on external stimulation to maintain state — feeling empty when alone, struggling to settle into deep-focus work, or ignoring inner needs in favor of external feedback. This can be an obstacle in contexts requiring deep analysis and independent work.",
    "low-extraversion": "Over-reliance on introversion can lead to missed opportunities in scenarios requiring active expression, relationship-building, and influence. In highly social or culture-driven teams, passive communication may be misread as lack of engagement or poor collaboration.",
    "high-agreeableness": "Over-reliance on agreeableness can lead to blurred boundaries and resource drain — over-accommodating others for harmony's sake, struggling to say no when needed, or accumulating hidden emotional cost and resentment through one-sided giving over time.",
    "low-agreeableness": "Over-reliance on low agreeableness can create friction in contexts requiring collaboration and relationship maintenance — direct expression being misinterpreted as aggression, principled stands being seen as refusing to cooperate, or lacking connection when emotional support and team cohesion are needed.",
    "high-neuroticism": "Over-reliance on high sensitivity can bring chronic energy drain and sustained anxiety — being hyper-alert to every risk signal leads to decision fatigue and excessive recovery cost. In fields requiring quick judgment and bold action, excessive caution can be a real obstacle.",
    "emotional-stability": "Emotional stability, if over-expressed in some contexts, may be misread as insufficient concern or urgency — in situations requiring timely response to others' emotional shifts or high-risk scenarios, an overly even reaction can make others feel unheard.",
}

POLARITY_MISUNDERSTANDING_EN = {
    "high-openness": "High openness does not mean more intelligent, more creative, or better suited to innovative work. It describes comfort with novelty and change, not intellectual ability or output quality. An engineer with low openness may produce more original solutions.",
    "low-openness": "Low openness does not mean conservative, stubborn, or lacking creativity. It describes preference for familiarity and stability, not resistance to change or lack of ability. Many domain experts reach the top precisely through deep, sustained focus rather than constant switching.",
    "high-conscientiousness": "High conscientiousness does not mean more successful, more efficient, or more liked. It describes a tendency toward order and persistence, which may actually be mismatched in certain loose and creativity-driven cultures.",
    "low-conscientiousness": "Low conscientiousness does not mean irresponsible, lazy, or incapable. It describes a preference for flexible and spontaneous rhythms, not inability to deliver quality output. Many highly productive people are short-burst, concentrated producers rather than steady, consistent outputters.",
    "high-extraversion": "High extraversion does not mean better at communication, more suited to leadership, or more liked. It describes a preference for how energy is obtained, not social skill level. Effective communication and leadership come in many styles.",
    "low-extraversion": "Low extraversion does not mean socially unskilled, reclusive, or incapable. It describes a preference for how energy is obtained, not social ability. Many low-extraversion individuals excel at deep conversation and one-on-one communication.",
    "high-agreeableness": "High agreeableness does not mean having no opinions, being easily exploited, or unsuitable for leadership. It describes the weight given to relational factors in decisions, not lack of judgment. Many high-agreeableness leaders are known for building trust and empowering teams.",
    "low-agreeableness": "Low agreeableness does not mean unfriendly, cold, or uncooperative. It describes valuing directness and clarity over relationship preservation in decisions, not lack of empathy or social skills.",
    "high-neuroticism": "High neuroticism / high emotional sensitivity does not mean psychologically unhealthy, fragile, or unfit for responsibility. It describes sensitivity to risk signals and emotional experience intensity, not inability to cope with stress. Many highly sensitive individuals excel in fields requiring nuanced judgment and risk management.",
    "emotional-stability": "Emotional stability does not mean uncaring, disengaged, or lacking feeling. It describes intensity and recovery speed of emotional reactions, not emotional depth or care for others.",
}

POLARITY_NEW_FAQ_EN = {
    "high-openness": ("What work environments suit high-openness people?", "High openness is most comfortable in environments where new ideas are welcomed and exploration is encouraged. Creativity, R&D, academia, and entrepreneurship naturally attract high-openness individuals. But suitability also depends on other dimensions and specific skills and opportunities — openness alone cannot determine career fit."),
    "low-openness": ("How can low-openness people broaden their horizons?", "Low openness does not need 'fixing' — pragmatism and focus are strengths in themselves. To broaden moderately, start small: try one new activity per month, connect with someone from a new field, or ask a question about a familiar domain that you haven't thought of before. The key is finding your own rhythm, not mimicking a high-openness style."),
    "high-conscientiousness": ("Can high conscientiousness become perfectionism?", "High conscientiousness and perfectionism are related but not the same. High conscientiousness is about caring about quality and order; perfectionism is setting standards impossibly high and experiencing distress because of it. If high conscientiousness causes excessive pressure, practice the 'good enough' standard — distinguish which tasks need 100% and where 80% is sufficient."),
    "low-conscientiousness": ("How can low-conscientiousness people improve execution?", "Low conscientiousness is not a flaw but a different rhythm. To improve execution on specific tasks, try external structure: break large goals into small steps, set external deadlines, invite someone to supervise or collaborate. The key is using environmental design to supplement — not 'change' — your natural tendencies."),
    "high-extraversion": ("Do high-extraversion people need intentional alone time?", "Yes. High-extraversion individuals gain energy from socializing, but sustained high-intensity socializing also depletes resources. Intentionally scheduling alone time — even just 15 minutes of quiet reading or walking daily — can help recover and process information gathered during social times, keeping you sustainable long-term."),
    "low-extraversion": ("How can low-extraversion people sustain themselves in high-social jobs?", "Low-extraversion individuals can treat socializing as a 'skill' rather than 'something you must enjoy.' Key strategies: pre-plan social windows with recovery time afterward, break social time into multiple short segments rather than one long one, and use deep one-on-one interaction instead of large-group dynamics. The core is managing energy, not avoiding socializing."),
    "high-agreeableness": ("How can high-agreeableness people avoid being over-demanded?", "Set clear boundaries and time limits, practice saying 'I'm not available right now' instead of 'I don't want to,' and distinguish 'must-help' from 'can-choose-to-help' situations. The advantage of high agreeableness is building trust and cooperation — protecting your boundaries is what makes this advantage sustainable."),
    "low-agreeableness": ("How can low-agreeableness people collaborate more smoothly in teams?", "Low agreeableness's strength is clarity and decisiveness. In team collaboration, leverage this to propose structured plans and clear roles. To supplement: before expressing disagreement, first acknowledge you understand the other person's starting point with one sentence; when concession is needed, consciously give one or two small steps."),
    "high-neuroticism": ("How can high neuroticism be turned into an advantage?", "The alertness and risk perception that come with high neuroticism are valuable in many fields — quality control, safety checks, and strategic planning all need the ability to see the worst case. The key is building emotional management strategies: distinguish 'useful vigilance' from 'unproductive worry' — the former deserves attention, the latter needs to be set aside."),
    "emotional-stability": ("What is the difference between emotional stability and emotional coldness?", "Emotional stability means you do not experience large emotional fluctuations from daily stress and frustration, and recover faster. Emotional coldness is lacking attention and response to others' feelings. They are completely different — an emotionally stable person can be very warm and empathic, just with a more even emotional baseline."),
}

# ============================================================================
# APPLY UPDATES
# ============================================================================

def find_section(sections, key):
    for s in sections:
        if s["key"] == key:
            return s
    return None

for asset in assets:
    et = asset["entity_type"]
    code = asset["code"]
    loc = asset["locale"]

    if et == "hub":
        content = HUB_ZH if loc == "zh-CN" else HUB_EN
        content_new = HUB_ZH_NEW if loc == "zh-CN" else HUB_EN_NEW
        evidence = ["A1", "A5", "I2", "I4"]

        for key, body in content.items():
            sec = find_section(asset["sections"], key)
            if sec:
                sec["body"] = body
        # Add 3 new sections
        for key in ["test_intro", "self_reflection", "scientific_background"]:
            if not find_section(asset["sections"], key):
                asset["sections"].append({
                    "key": key,
                    "title": {"test_intro": "大五人格测试介绍" if loc == "zh-CN" else "What is the Big Five Test",
                              "self_reflection": "五个维度的自省题" if loc == "zh-CN" else "Self-Reflection Questions",
                              "scientific_background": "大五人格的科学背景" if loc == "zh-CN" else "How Was the Big Five Created",
                             }[key],
                    "body": content_new[key],
                    "evidence_ids": evidence,
                })
        updated += 1

    elif et == "domain":
        if code in DOMAIN_HL_ZH:
            hl_body = DOMAIN_HL_ZH[code] if loc == "zh-CN" else DOMAIN_HL_EN[code]
            sec = find_section(asset["sections"], "higher_and_lower")
            if sec:
                sec["body"] = hl_body
        if loc == "zh-CN" and code in DOMAIN_ACTION_ZH:
            sec = find_section(asset["sections"], "action_prompt")
            if sec:
                sec["body"] = DOMAIN_ACTION_ZH[code]
        # Add extra sections for agreeableness/neuroticism
        extra_map = DOMAIN_EXTRA_ZH if loc == "zh-CN" else DOMAIN_EXTRA_EN
        if code in extra_map:
            for extra_key, extra_body in extra_map[code].items():
                if not find_section(asset["sections"], extra_key):
                    evidence = ["A1", "A5", "I2"]
                    asset["sections"].append({
                        "key": extra_key,
                        "title": {
                            "cooperation_boundaries": "合作与边界" if loc == "zh-CN" else "Cooperation and Boundaries",
                            "emotional_regulation": "情绪调节与恢复" if loc == "zh-CN" else "Emotional Regulation and Recovery",
                        }[extra_key],
                        "body": extra_body,
                        "evidence_ids": evidence,
                    })
        updated += 1

    elif et == "polarity":
        content_s = POLARITY_STRENGTHS_ZH if loc == "zh-CN" else POLARITY_STRENGTHS_EN
        content_t = POLARITY_TRADEOFFS_ZH if loc == "zh-CN" else POLARITY_TRADEOFFS_EN
        content_m = POLARITY_MISUNDERSTANDING_ZH if loc == "zh-CN" else POLARITY_MISUNDERSTANDING_EN
        faq = POLARITY_NEW_FAQ_ZH if loc == "zh-CN" else POLARITY_NEW_FAQ_EN

        if code in content_s:
            sec = find_section(asset["sections"], "possible_strengths")
            if sec and len(sec.get("body","")) < 150:
                sec["body"] = content_s[code]
        if code in content_t:
            sec = find_section(asset["sections"], "possible_tradeoffs")
            if sec and len(sec.get("body","")) < 150:
                sec["body"] = content_t[code]
        if code in content_m:
            sec = find_section(asset["sections"], "common_misunderstanding")
            if sec and len(sec.get("body","")) < 150:
                sec["body"] = content_m[code]
        if code in faq:
            q, a = faq[code]
            existing_qs = {f["question"] for f in asset["faq"]}
            if q not in existing_qs:
                faq_id = f"{code}-faq-extra"
                asset["faq"].append({
                    "id": faq_id,
                    "question": q,
                    "answer": a,
                    "evidence_ids": ["A5", "I4", "I2"],
                })
        updated += 1

# Write back
with open(SEED, "w", encoding="utf-8") as f:
    json.dump(seed, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"Updated {updated} entries.")
print(f"Total assets: {len(assets)}")

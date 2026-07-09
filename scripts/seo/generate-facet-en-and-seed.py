#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate en-locale facet content-package.json + seed entries for big_five_v1_seed.json.

Usage: python3 scripts/seo/generate-facet-en-and-seed.py
"""

import json
import os

# Paths
ZH_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "../../generated/public-profile-assets/big-five-v1-editorial-repair-01/packages/zh-CN"
)
EN_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "../../generated/public-profile-assets/big-five-v1-editorial-repair-01/packages/en"
)
SEED_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "../../../fap-api/backend/content_assets/personality_public/big_five_v1_seed.json"
)

os.makedirs(EN_DIR, exist_ok=True)

# English facet definitions
FACET_EN = {
    "imagination": {
        "title": "Imagination (Openness)",
        "summary": "Imagination describes the tendency toward a rich inner world, fantasy, and creative imagination. It is the facet of Openness related to inner experience.",
        "body1": "Imagination is the facet of Openness most oriented toward inner experience. High-scoring individuals typically have a rich inner world, readily generate imagery and alternative scenarios, and find mental simulation and ideation to be natural ways of thinking. Low-scoring individuals tend to focus more on reality and present facts, with more grounded, practical thinking. Imagination is not the only source of creativity \u2014 pragmatism and focus are equally essential to creative work.",
        "body2": "**High-scoring individuals** tend to: easily construct rich scenarios and alternatives in their mind, experience strong inner responses when reading fiction or viewing art, have frequent daydreams and fantasies, and may sometimes get lost in imagination at the expense of present tasks.\n\n**Low-scoring individuals** tend to: focus more on immediate facts and practical problems, think in concrete and utilitarian terms, rely less on mental imagery to support thinking, and have an advantage in tasks requiring real-world detail and execution.",
        "faq": {"q": "Are imagination and creativity the same thing?", "a": "Not exactly. Imagination is the ability to generate rich mental imagery. Creativity also includes the execution side \u2014 turning ideas into actual outcomes. High imagination provides inspiration, but creativity requires coordination with other Openness facets (like Actions, Ideas) and Conscientiousness."},
    },
    "aesthetics": {
        "title": "Aesthetics (Openness)",
        "summary": "Aesthetics describes sensitivity to art, beauty, and natural beauty. It is the facet of Openness related to perception and appreciation.",
        "body1": "Aesthetics is the facet of Openness related to artistic and aesthetic experience. High-scoring individuals typically have strong responses to music, visual art, literature, and natural beauty, with beautiful things evoking deep emotional reactions. Low-scoring individuals tend to pay less attention to art and aesthetics, valuing functionality and practicality more. Aesthetics is not about taste \u2014 low levels do not mean a lack of appreciation ability, only that beauty and art carry less weight in daily decisions.",
        "body2": "**High-scoring individuals** tend to: be moved by architecture, music, design, or natural landscapes, consider beauty and atmosphere important when choosing environments and objects, and may invest time and energy in art appreciation and creation.\n\n**Low-scoring individuals** tend to: not use aesthetics as a primary decision criterion, have lower sensitivity to environmental appearance and artistic expression, and value function, efficiency, and practicality more, which is advantageous in scenarios requiring fast decisions and resource optimization.",
        "faq": {"q": "Does a low aesthetics level mean no artistic talent?", "a": "No. Your aesthetics level reflects how much you value beauty and art, not your artistic ability or taste. Many excellent engineers and designers level low on aesthetics \u2014 they focus more on function and logic but can still produce excellent designs."},
    },
    "feelings": {
        "title": "Feelings (Openness)",
        "summary": "Feelings describes awareness of and attention to one's own inner emotional states. It is the facet of Openness related to emotional awareness.",
        "body1": "Feelings is the facet of Openness related to inner emotional awareness. High-scoring individuals typically value their emotional experiences, see emotions as important sources of information in life, and are willing to spend time understanding and expressing inner feelings. Low-scoring individuals tend to place less value on emotions, believing emotions should not overly influence judgment and decisions. This facet describes how much you value emotions, not how intense your emotions are \u2014 the latter relates more to the Neuroticism dimension.",
        "body2": "**High-scoring individuals** tend to: finely distinguish different emotional states, willingly express and share inner feelings, see emotional experience as an important part of a fulfilling life, and may incorporate intuition and emotional feelings into decision-making.\n\n**Low-scoring individuals** tend to: rely more on logic and facts for decisions, spend less time analyzing their emotional states, express inner feelings less frequently, and have an advantage in situations requiring calm and rational judgment.",
        "faq": {"q": "Does a high feelings level mean being emotional?", "a": "No. Feelings describes how much you value and attend to emotions. The Neuroticism dimension describes emotional reaction intensity and recovery speed. Someone high in Feelings may be skilled at understanding and expressing emotions while remaining emotionally stable."},
    },
    "actions": {
        "title": "Actions (Openness)",
        "summary": "Actions describes willingness to try new activities, experiences, and different lifestyles. It is the facet of Openness related to behavioral exploration.",
        "body1": "Actions is the facet of Openness related to behavioral exploration. High-scoring individuals typically enjoy trying new activities, foods, travel destinations, and lifestyles, embodying openness to new experiences in actual behavior. Low-scoring individuals tend to prefer familiar activities and stable life rhythms, finding satisfaction and comfort within known boundaries. Actions is different from impulsiveness \u2014 the former is conscious exploratory intent, the latter is uncontrolled immediate reaction.",
        "body2": "**High-scoring individuals** tend to: actively seek new experiences, frequently vary travel, food, and hobbies, respond to new activities with a try it attitude, and may struggle to sustain a single project long-term due to pursuit of variety.\n\n**Low-scoring individuals** tend to: prefer stable and predictable activity patterns, feel comfortable and safe in familiar environments, enjoy depth over breadth in exploration, and have an advantage in tasks requiring long-term focus and sustained depth.",
        "faq": {"q": "Does high actions lead to a lack of focus?", "a": "Not necessarily. Actions reflects breadth of exploratory desire, not strength of persistence. High-actions individuals can manage exploration structurally \u2014 alternating depth across domains, or preserving exploration space outside their main focus."},
    },
    "ideas": {
        "title": "Ideas (Openness)",
        "summary": "Ideas describes interest in abstract concepts, philosophical questions, and intellectual challenges. It is the facet of Openness related to cognitive curiosity.",
        "body1": "Ideas is the facet of Openness related to intellectual curiosity. High-scoring individuals typically enjoy abstract thinking, have natural interest in philosophical questions, theoretical frameworks, and complex concepts, and enjoy discussing and debating ideas. Low-scoring individuals tend to have less interest in abstract thinking, preferring to focus on concrete, practical, actionable problems. This facet describes preference in thinking content (abstract vs. concrete), not thinking ability.",
        "body2": "**High-scoring individuals** tend to: enjoy exploring why-type questions, feel excited by theoretical frameworks and conceptual models, enjoy intellectual challenges and viewpoint debates, and may encounter practical difficulties from overly abstract thinking.\n\n**Low-scoring individuals** tend to: prefer handling specific, clear problems, have limited interest in abstract theories, value practical experience and verifiable results more, and have an advantage in situations requiring focused execution and practical problem-solving.",
        "faq": {"q": "Is ideas related to IQ?", "a": "Ideas is your degree of interest in abstract thinking, not your intelligence level. Someone with a high IQ may level low on Ideas because they prefer focusing their energy on concrete problems."},
    },
    "values": {
        "title": "Values (Openness)",
        "summary": "Values describes willingness to re-examine social norms, traditions, and authority. It is the facet of Openness related to attitudinal flexibility.",
        "body1": "Values is the facet of Openness related to attitudinal and belief flexibility. High-scoring individuals typically are willing to challenge traditional views and re-examine social norms, holding inclusive attitudes toward different values and lifestyles. Low-scoring individuals tend to respect tradition and established norms more, preferring to maintain stable and predictable social structures. Values openness does not mean having no stance or anything goes \u2014 it means staying open to the possibility that things may not be as I thought.",
        "body2": "**High-scoring individuals** tend to: hold open attitudes toward social issues and value discussions, willingly re-examine their own positions from different angles, and have high acceptance of different cultures, religions, and lifestyles.\n\n**Low-scoring individuals** tend to: value tradition, rules, and the stability of established order more, prefer maintaining verified social norms, and have an advantage in situations requiring consistency, rule enforcement, and maintaining collective identity.",
        "faq": {"q": "Does values openness mean having no principles?", "a": "No. High values openness means you are willing to examine and re-evaluate your values, not that you lack firm beliefs. This openness is cognitive flexibility, not an absence of stance."},
    },
    "competence": {
        "title": "Competence (Conscientiousness)",
        "summary": "Competence describes confidence in one's ability to effectively complete tasks. It is the facet of Conscientiousness related to self-efficacy.",
        "body1": "Competence is the facet of Conscientiousness related to self-efficacy. High-scoring individuals typically feel confident in their ability to complete tasks, believe their efforts will produce expected results, and tend to persist rather than give up when facing difficulties. Low-scoring individuals tend to have lower confidence in their abilities, often accompanied by hesitation and self-doubt when making decisions. Competence reflects subjective belief, not objective ability \u2014 someone with strong actual abilities may also level low on competence.",
        "body2": "**High-scoring individuals** tend to: believe they can handle new tasks, maintain a positive mindset in the face of challenges, have confidence in their judgment and decisions, and may underestimate task difficulty due to overconfidence.\n\n**Low-scoring individuals** tend to: take a cautious attitude toward their abilities, prefer thorough preparation and repeated verification before acting, have an advantage in situations requiring careful planning and risk control, but may miss opportunities due to self-doubt.",
        "faq": {"q": "Are competence and actual ability the same?", "a": "No. Competence is your subjective belief in your abilities. Actual ability is objective skill and knowledge. The two are not always aligned \u2014 some highly capable people level low on competence, and vice versa. One way to build competence is to record experiences of successfully completing tasks."},
    },
    "order": {
        "title": "Order (Conscientiousness)",
        "summary": "Order describes preference for organization, tidiness, and structure. It is the facet of Conscientiousness related to structured environments.",
        "body1": "Order is the facet of Conscientiousness related to structural preference. High-scoring individuals typically like clean, organized environments, work methodically, keep clear schedules, and find chaos and disorder uncomfortable. Low-scoring individuals tend to not require high environmental order, can work efficiently in relatively casual and flexible spaces, and may not equate tidy with efficient. Order preference reflects comfort with structured environments, not self-discipline ability.",
        "body2": "**High-scoring individuals** tend to: keep a clean desk, clearly categorized files, organized plans, items in their designated places, have natural advantage in tasks requiring standardized processes and precise management, and may spend excessive time organizing due to over-pursuit of order.\n\n**Low-scoring individuals** tend to: maintain efficiency in relatively casual environments, not get distracted by imperfect item placement or process details, have advantage in creative work and situations requiring flexible adaptation, but may miss key information due to lack of organization.",
        "faq": {"q": "Are high-order people necessarily more efficient?", "a": "Not necessarily. Order preference reflects comfort with structured environments. Efficiency depends on task type. Some creative work needs a certain organized chaos for inspiration, while precise process work suits high-order preference better."},
    },
    "dutifulness": {
        "title": "Dutifulness (Conscientiousness)",
        "summary": "Dutifulness describes tendency to follow rules, honor commitments, and adhere to ethical principles. It is the facet of Conscientiousness related to sense of obligation.",
        "body1": "Dutifulness is the facet of Conscientiousness related to obligation and rule-following. High-scoring individuals typically value commitments and rules, see honoring agreements and social norms as important, and are reliable team members. Low-scoring individuals tend to hold more flexible attitudes toward rules and agreements, preferring to adjust behavior based on specific situations, and may not believe all rules must be strictly followed. Dutifulness is not a moral judgment \u2014 it reflects the degree to which you are driven by internalized sense of obligation.",
        "body2": "**High-scoring individuals** tend to: try to complete what they commit to, value punctuality and integrity, prefer following processes and standards, have significant advantage in roles requiring reliability and consistency, and may struggle when flexibility is needed due to rigid rule adherence.\n\n**Low-scoring individuals** tend to: take a more elastic attitude toward rules and commitments, judge what is more reasonable based on context, have advantage in situations requiring breaking conventions and innovative solutions, but may have gaps in tasks requiring long-term commitment and stable delivery.",
        "faq": {"q": "Is dutifulness related to moral level?", "a": "Dutifulness is a personality trait describing your tendency to follow commitments and rules, not your moral level. Someone low in dutifulness may have strong personal ethical principles but simply not believe all forms of rules and commitments need equal treatment."},
    },
    "achievement-striving": {
        "title": "Achievement Striving (Conscientiousness)",
        "summary": "Achievement striving describes tendency to set high goals and work hard to achieve them. It is the facet of Conscientiousness related to ambition and drive.",
        "body1": "Achievement striving is the facet of Conscientiousness related to goal-setting and drive. High-scoring individuals typically have strong achievement motivation, enjoy setting challenging goals and working toward them, and find satisfaction in progress and accomplishments. Low-scoring individuals tend to pursue achievement more moderately, not necessarily needing constant higher goals for satisfaction, and can maintain balance without imposing additional achievement pressure. High achievement striving brings drive but may also bring burnout risk.",
        "body2": "**High-scoring individuals** tend to: frequently set higher goals for themselves, have clear aspirations for career and personal growth, quickly seek the next challenge after completing tasks, have advantage in competitive environments and roles requiring continuous progress, and may neglect rest and relationships due to over-pursuit.\n\n**Low-scoring individuals** tend to: value process over outcomes, can enjoy work and life without deliberate pursuit, are less anxious about external achievement standards, and have advantage in situations requiring steady output and long-term balance.",
        "faq": {"q": "Does low achievement striving mean lack of ambition?", "a": "No. Low achievement striving does not equal lack of ambition, just that high-standard goals are not your primary driver. You may care more about the meaning of work itself, relationship quality, or life balance \u2014 these are equally positive life attitudes."},
    },
    "self-discipline": {
        "title": "Self-Discipline (Conscientiousness)",
        "summary": "Self-discipline describes ability to start tasks and persist in completing them. It is the facet of Conscientiousness related to execution and perseverance.",
        "body1": "Self-discipline is the facet of Conscientiousness related to execution persistence. High-scoring individuals typically can proactively start unpleasant tasks and persist to completion, are not easily interrupted by distractions and temptations, and have stable execution in projects requiring long-term investment. Low-scoring individuals tend to have difficulty starting and persisting in tasks, are easily interrupted by external distractions or internal diversions, and prefer concentrating effort near deadlines. Self-discipline is a trainable capacity, not entirely determined by innate tendencies.",
        "body2": "**High-scoring individuals** tend to: persist even when tasks are boring or unpleasant, resist short-term temptations to achieve long-term goals, have strong internal drive in daily behavior, have significant advantage in tasks requiring sustained discipline, and may impose unnecessary pressure on themselves due to excessive strictness.\n\n**Low-scoring individuals** tend to: work efficiently when motivated, produce quickly under deadline pressure, have advantage in tasks requiring quick response and flexible adjustment, but may struggle in long-term projects requiring sustained investment.",
        "faq": {"q": "Are low self-discipline people lazy?", "a": "No. Self-discipline reflects how easily you self-drive in the absence of external constraints. Many low self-discipline individuals perform excellently in environments with clear external structure (deadlines, team collaboration, role division). Understanding your self-discipline pattern allows you to compensate through environmental design \u2014 like breaking goals into small steps or finding accountability partners."},
    },
    "deliberation": {
        "title": "Deliberation (Conscientiousness)",
        "summary": "Deliberation describes tendency to think carefully and evaluate consequences before making decisions. It is the facet of Conscientiousness related to decision caution.",
        "body1": "Deliberation is the facet of Conscientiousness related to pre-decision thinking. High-scoring individuals typically weigh pros and cons carefully before acting, prefer gathering sufficient information before deciding, and are not prone to impulsive actions. Low-scoring individuals tend to decide more quickly, not inclined to spend much time weighing and analyzing, and trust their intuition and immediate judgment more. Deliberation and decisiveness are two ends of the same dimension \u2014 the value of each depends on task nature.",
        "body2": "**High-scoring individuals** tend to: conduct systematic analysis and information gathering before major decisions, are not easily driven by impulse or emotion into hasty decisions, have significant advantage in high-risk, high-consequence scenarios, and may miss time windows due to repeated deliberation.\n\n**Low-scoring individuals** tend to: decide decisively and act quickly, have advantage in situations requiring quick response and flexible adjustment, do not fall into analysis paralysis, but may pay a price in important decisions due to insufficient deliberation.",
        "faq": {"q": "What is the difference between deliberation and indecisiveness?", "a": "Deliberation is consciously considering consequences before acting \u2014 a controllable strategic choice. Indecisiveness is inability to decide even after having sufficient information, usually accompanied by anxiety and avoidance. Highly deliberative people can decide decisively once information is sufficient."},
    },
    "warmth": {
        "title": "Warmth (Extraversion)",
        "summary": "Warmth describes tendency to build friendly, warm relationships with others. It is the facet of Extraversion related to affiliation and friendliness.",
        "body1": "Warmth is the facet of Extraversion related to interpersonal warmth. High-scoring individuals typically easily build friendly relationships, show genuine care and goodwill in initial interactions, and make others feel comfortable and accepted. Low-scoring individuals tend to maintain some distance in relationships, not proactively expressing friendliness, but are equally sincere in established deep relationships. Warmth is more about the tendency to actively extend goodwill, rather than empathy ability \u2014 the latter relates more to Agreeableness.",
        "body2": "**High-scoring individuals** tend to: proactively express friendliness and care to others, easily build rapport with new acquaintances, make others feel welcome in social situations, and have advantage in service and collaboration scenarios requiring rapid trust-building.\n\n**Low-scoring individuals** tend to: express friendliness more subtly, not rush to show closeness, value relationship authenticity and depth over breadth, and have advantage in situations requiring professional distance and objective judgment.",
        "faq": {"q": "Does low warmth mean unfriendly?", "a": "No. Warmth reflects the frequency and intensity with which you actively extend goodwill, not your true attitude toward others. Someone low in warmth may care deeply about others but express it more reservedly and subtly."},
    },
    "gregariousness": {
        "title": "Gregariousness (Extraversion)",
        "summary": "Gregariousness describes preference for being with others and feeling comfortable in social settings. It is the facet of Extraversion related to social preference.",
        "body1": "Gregariousness is the facet of Extraversion related to social quantity and frequency. High-scoring individuals typically enjoy being with others, feel energized in crowds, and actively seek social opportunities. Low-scoring individuals tend to not particularly rely on social interaction for satisfaction, are equally or more comfortable alone, and have lower need for large-scale social activities. Gregariousness is not social ability \u2014 you can be highly skilled socially while preferring solitude.",
        "body2": "**High-scoring individuals** tend to: feel comfortable and fulfilled in crowds, actively organize and participate in social activities, feel stifled by too much alone time, and have advantage in roles requiring frequent interpersonal interaction and team collaboration.\n\n**Low-scoring individuals** tend to: enjoy alone time, do not need frequent socializing to maintain psychological balance, are more comfortable in small groups or one-on-one interactions than large groups, and have advantage in tasks requiring independent focus.",
        "faq": {"q": "Does low gregariousness mean social anxiety?", "a": "No. Low gregariousness simply means you have lower need for social quantity rather than quality. Social anxiety is fear and avoidance of social situations. They are different. Someone low in gregariousness may feel comfortable in social settings but just not actively seek lots of socializing."},
    },
    "assertiveness": {
        "title": "Assertiveness (Extraversion)",
        "summary": "Assertiveness describes tendency to express positions, take charge, and influence others in groups. It is the facet of Extraversion related to leadership expression.",
        "body1": "Assertiveness is the facet of Extraversion related to dominance and influence expression. High-scoring individuals typically dare to express views and guide direction in groups, do not avoid conflict and competition, and are good at securing resources and opportunities. Low-scoring individuals tend to prefer following rather than leading in groups, not rushing to express positions, and preferring to listen to all perspectives before stating their view. Assertiveness is not a judgment of ability \u2014 a low-key person can have equally profound influence.",
        "body2": "**High-scoring individuals** tend to: actively speak in meetings and discussions, dare to say no to differing opinions, have advantage in situations requiring quick decisions and leadership, and may suppress others' space for expression by being overly dominant.\n\n**Low-scoring individuals** tend to: observe and listen before judging, not rush to claim speaking rights, have advantage in situations requiring multi-party coordination and consensus-building, but may not act quickly enough when quick opportunity capture is needed.",
        "faq": {"q": "Can people low in assertiveness be leaders?", "a": "Yes. Leadership has many styles. Low-assertiveness leaders typically guide teams through questioning, empowerment, and consensus-building, which can be more effective than high assertiveness in scenarios requiring long-term strategy and team depth."},
    },
    "activity": {
        "title": "Activity (Extraversion)",
        "summary": "Activity describes tendency to stay busy, maintain fast pace, and have high energy. It is the facet of Extraversion related to energy level and action speed.",
        "body1": "Activity is the facet of Extraversion related to energy level and action rhythm. High-scoring individuals typically enjoy being busy and having a fast-paced life, cannot stand being idle, and are always looking for the next task or activity. Low-scoring individuals tend to prefer a slower pace, feel comfortable in quietness and rest, and do not need constant activity to maintain satisfaction. Activity reflects rhythm preference of energy output, not efficiency or output.",
        "body2": "**High-scoring individuals** tend to: have a full schedule, abundant energy, dislike being idle for long periods, perform well in fast-paced multi-tasking environments, and may neglect rest and recovery due to sustained high-speed operation.\n\n**Low-scoring individuals** tend to: prefer moderate pace, can accept or even enjoy idle moments, have advantage in tasks requiring patience and sustained steady output, but may struggle in scenarios requiring quick response and high-intensity output.",
        "faq": {"q": "Does low activity mean low efficiency?", "a": "No. Activity reflects how fast a pace you prefer to maintain, not how much you accomplish per unit time. A low-activity person may complete higher quality work in less time because they focus more on depth than speed."},
    },
    "excitement-seeking": {
        "title": "Excitement Seeking (Extraversion)",
        "summary": "Excitement seeking describes need for and appreciation of exciting, novel, and stimulating experiences. It is the facet of Extraversion related to sensory stimulation preference.",
        "body1": "Excitement seeking is the facet of Extraversion related to excitement and novelty stimulation. High-scoring individuals typically enjoy high-intensity sensory experiences and excitement, like stimulating environments, new adventures, and heart-pounding activities. Low-scoring individuals tend to prefer calm and predictable environments, have lower need for high-intensity stimulation, and feel comfortable in quiet and soothing settings. Excitement seeking has some correlation with risk-taking behavior but is not the same thing.",
        "body2": "**High-scoring individuals** tend to: enjoy exciting activities like travel adventures, extreme sports, or lively social occasions, have high need for sensory stimulation, have advantage in situations requiring quick adaptation to change and accepting challenges, and may neglect risk assessment in pursuit of excitement.\n\n**Low-scoring individuals** tend to: prefer quiet and comfortable environments, have lower need for high-intensity sensory stimulation, have advantage in tasks requiring stability, patience, and fine operations, and can find satisfaction in daily life rather than relying on external stimulation.",
        "faq": {"q": "Are high excitement seekers more likely to take risks?", "a": "There is some correlation but not causation. High excitement seekers are more attracted to the thrill of risk, but whether they actually act depends on deliberation (a Conscientiousness facet), risk assessment, and specific context."},
    },
    "positive-emotions": {
        "title": "Positive Emotions (Extraversion)",
        "summary": "Positive emotions describes frequency and intensity of experiencing positive emotions like joy, enthusiasm, and contentment. It is the facet of Extraversion related to subjective well-being.",
        "body1": "Positive emotions is the facet of Extraversion related to positive emotional experience. High-scoring individuals typically frequently experience joy, enthusiasm, gratitude, and contentment, hold positive expectations for life, and have strong recovery tendencies during low points. Low-scoring individuals tend to experience positive emotions less frequently and less intensely, with a more even and neutral emotional tone. This facet is complementary to the experience frequency of negative emotions in the Neuroticism dimension \u2014 a person can simultaneously experience high levels of both positive and negative emotions.",
        "body2": "**High-scoring individuals** tend to: frequently feel happy and content, hold optimistic attitudes toward the future, find joy in small daily things, recover emotionally quickly, and re-enter positive states faster when facing setbacks.\n\n**Low-scoring individuals** tend to: have more even emotional experiences, not frequently feel intense joy or excitement, but also not fluctuate greatly due to external events, and have advantage in situations requiring calm analysis and objective judgment.",
        "faq": {"q": "Does low positive emotions mean unhappiness?", "a": "Not necessarily. This facet measures frequency and intensity of positive emotional experience. Some people do not need frequent intense positive emotions to feel content \u2014 their well-being comes from calmness, meaning, or relationship depth."},
    },
    "trust": {
        "title": "Trust (Agreeableness)",
        "summary": "Trust describes tendency to believe others' intentions are benevolent. It is the facet of Agreeableness related to basic interpersonal attitude.",
        "body1": "Trust is the most foundational interpersonal attitude facet of Agreeableness. High-scoring individuals typically tend to believe others' motives are benevolent, think most people are trustworthy, and hold open and friendly attitudes in initial interactions. Low-scoring individuals tend to be cautious about others' motives, prefer to observe before judging, and do not easily assume others mean well. Trust is not naivety \u2014 high-trust individuals can equally recognize malice, they just have different default assumptions.",
        "body2": "**High-scoring individuals** tend to: hold open and benevolent presuppositions when interacting with others, willingly extend trust before waiting for the other to prove themselves, have advantage in situations requiring rapid cooperation and trust-building, and may maintain a high trust baseline even after negative experiences.\n\n**Low-scoring individuals** tend to: be more vigilant about their own and others' boundaries, prefer to verify before trusting, have advantage in situations requiring risk control and critical assessment, but may miss opportunities for deep relationships due to overly high trust thresholds.",
        "faq": {"q": "Does trust conflict with judgment?", "a": "Not necessarily. High trust reflects your default assumption \u2014 you believe most people's intentions are benevolent. This does not mean you lose the ability to judge and identify malice. Trust is a social strategy; judgment is a cognitive ability. Both can coexist."},
    },
    "straightforwardness": {
        "title": "Straightforwardness (Agreeableness)",
        "summary": "Straightforwardness describes tendency to communicate in a candid, direct manner. It is the facet of Agreeableness related to communication style.",
        "body1": "Straightforwardness is the facet of Agreeableness related to communication candor. High-scoring individuals typically communicate candidly and directly, do not like beating around the bush or strategic expression, and believe honesty is a form of respect. Low-scoring individuals tend to be more nuanced and strategic in communication, preferring to consider the potential impact of expression before choosing words. Straightforwardness reflects communication style, not honesty level \u2014 someone who expresses strategically can equally be honest.",
        "body2": "**High-scoring individuals** tend to: speak directly, dislike indirect communication, have advantage in situations requiring quick clarification and transparent communication, and may cause discomfort in sensitive topics due to direct expression style.\n\n**Low-scoring individuals** tend to: consider wording and timing before expressing, are good at conveying information in ways the other person can accept, have advantage in situations requiring relationship maintenance and sensitive communication, but may cause information distortion due to insufficiently direct expression.",
        "faq": {"q": "Does high straightforwardness mean speaking harshly?", "a": "No. Straightforwardness reflects how directly you tend to express thoughts, not whether you care about others' feelings. A high-straightforwardness person can be both candid and kind \u2014 the key is whether the candid content is constructive or aggressive."},
    },
    "altruism": {
        "title": "Altruism (Agreeableness)",
        "summary": "Altruism describes tendency to proactively care for and help others. It is the facet of Agreeableness related to helping motivation.",
        "body1": "Altruism is the facet of Agreeableness related to helping behavior. High-scoring individuals typically are willing to proactively help others, feel an internal drive to help when seeing others in need, and derive satisfaction from helping. Low-scoring individuals tend to have weaker internal drive to help others, preferring to let each person solve their own problems, and not seeing self-sacrifice to help others as necessary. Altruism reflects internal motivation for helping, not actual helping behavior \u2014 you may not have internal drive but still lend a hand when needed.",
        "body2": "**High-scoring individuals** tend to: proactively notice others' difficulties and offer help, take on additional supportive work in teams, derive satisfaction from others' improvement, have advantage in roles requiring high collaboration and humanistic care, and may neglect their own needs due to over-giving.\n\n**Low-scoring individuals** tend to: believe each person should first be responsible for themselves, help others more based on rational judgment than emotional drive, and have advantage in situations requiring independent judgment and resource optimization.",
        "faq": {"q": "Does low altruism mean selfishness?", "a": "No. Low altruism only means weaker internal drive to help others, not that you are selfish or would not help. You may help others based on principle or rational decision, just not seeing it as an automatic obligation."},
    },
    "compliance": {
        "title": "Compliance (Agreeableness)",
        "summary": "Compliance describes tendency to yield and cooperate in conflicts. It is the facet of Agreeableness related to conflict-handling style.",
        "body1": "Compliance is the facet of Agreeableness related to conflict avoidance and cooperation willingness. High-scoring individuals typically tend to yield and seek reconciliation in conflicts, dislike confrontation and competition, and believe maintaining relationship harmony matters more than winning the argument. Low-scoring individuals tend to not avoid confrontation in conflicts, dare to stand their ground and challenge differing opinions, and believe clarifying the issue matters more than superficial harmony. Compliance is not weakness \u2014 it is a difference in whether you prioritize relationship or position in conflict.",
        "body2": "**High-scoring individuals** tend to: first consider how to maintain the relationship in conflict, do not mind making concessions to reach consensus, have advantage in situations requiring multi-stakeholder coordination and conflict resolution, and may suppress their own legitimate needs due to excessive concession.\n\n**Low-scoring individuals** tend to: not avoid debate in conflict, willingly face disagreements and stand their ground, have advantage in situations requiring principle maintenance and driving change, but may pay higher communication costs in relationship maintenance.",
        "faq": {"q": "What is the difference between compliance and people-pleasing?", "a": "Compliance is the strategic tendency to choose cooperation and concession in conflict, presupposing you know your position and voluntarily choose to yield. People-pleasing is suppressing genuine needs out of fear of rejection or being disliked, often accompanied by anxiety and self-negation. The former is strategy; the latter is defense."},
    },
    "modesty": {
        "title": "Modesty (Agreeableness)",
        "summary": "Modesty describes tendency toward understated self-presentation of achievements. It is the facet of Agreeableness related to self-presentation style.",
        "body1": "Modesty is the facet of Agreeableness related to self-presentation. High-scoring individuals typically do not tend to talk about their achievements and strengths, evaluate themselves conservatively and with restraint, and let others have the chance to shine. Low-scoring individuals tend to have higher awareness and willingness to express their achievements and strengths, and do not avoid showcasing their capabilities. Modesty is not low self-esteem \u2014 highly modest people can clearly know their strengths but choose not to actively display them.",
        "body2": "**High-scoring individuals** tend to: dislike being the center of attention, understate their achievements, tend to attribute success to external factors, have advantage in situations requiring team collaboration and low-key leadership, and may lose out in environments requiring self-promotion.\n\n**Low-scoring individuals** tend to: express confidence in their abilities, do not avoid talking about their achievements and strengths, have advantage in situations requiring personal capability highlighting and competitive display, but may be seen as insufficiently humble in cultures emphasizing team harmony.",
        "faq": {"q": "Does high modesty mean low self-esteem?", "a": "Absolutely not. Modesty is a social style \u2014 how you choose to present yourself. A highly modest person can be very confident but just feel no need to say it out loud. Low self-esteem is deep internal self-negation. The psychological mechanisms are completely different."},
    },
    "tender-mindedness": {
        "title": "Tender-Mindedness (Agreeableness)",
        "summary": "Tender-mindedness describes tendency to feel sympathy and care for others' situations. It is the facet of Agreeableness related to empathic sensitivity.",
        "body1": "Tender-mindedness is the facet of Agreeableness related to empathy and care. High-scoring individuals typically are easily moved by others' difficulties and emotions, have strong care and protective instincts toward vulnerable groups, and prioritize feeling factors when making decisions involving people. Low-scoring individuals tend to rely more on logic and principles in decision-making, are less easily influenced by emotions or others' situations, and can maintain rationality in situations requiring objective judgment. Tender-mindedness is not coldness \u2014 low-scoring individuals can still care about others, just in a more rational and principle-oriented way.",
        "body2": "**High-scoring individuals** tend to: easily be moved by touching stories or others' difficult situations, prioritize impact on people when making decisions, have natural advantage in humanistic care roles (nursing, education, counseling), and may hesitate in tough decisions due to emotional factors.\n\n**Low-scoring individuals** tend to: rely more on logic and objective criteria in decision-making, are less easily swayed by emotional appeals, and have advantage in situations requiring impartial handling, strict standard enforcement, and crisis decision-making.",
        "faq": {"q": "Does low tender-mindedness mean cold and heartless?", "a": "No. Low tender-minded individuals tend to guide care for others through rationality and principles rather than emotions. A surgeon may level low on tender-mindedness but can save lives through professional ability and precise judgment \u2014 that is another form of care."},
    },
    "anxiety": {
        "title": "Anxiety (Neuroticism)",
        "summary": "Anxiety describes tendency to feel worried and tense about the future and uncertainty. It is the facet of Neuroticism related to anticipatory worry.",
        "body1": "Anxiety is the facet of Neuroticism related to future-oriented worry and tension. High-scoring individuals typically easily worry about the future and uncertainty, frequently mentally rehearse negative possibilities, and feel stronger tension in ambiguous situations. Low-scoring individuals tend to worry less about the future, can stay calm amid uncertainty, and do not easily fall into repetitive negative rehearsal. Anxiety reflects worry tendency, not a criterion for anxiety disorders \u2014 the latter requires professional diagnosis.",
        "body2": "**High-scoring individuals** tend to: easily feel tension and worry in uncertain situations, tend to rehearse various negative possibilities, have value in tasks requiring risk alertness and detailed checking \u2014 high-anxiety individuals are often the first to spot potential problems, but also consume significant psychological resources through sustained high alertness.\n\n**Low-scoring individuals** tend to: stay relatively calm when facing uncertainty and risk, are less easily distracted by what-if worries, and have advantage in situations requiring calm judgment and quick decisions.",
        "faq": {"q": "Does high anxiety mean anxiety disorder?", "a": "No. Anxiety level reflects worry tendency \u2014 a personality trait. Anxiety disorder is a clinical diagnosis requiring specific symptom criteria and functional impairment. If you are troubled by your anxiety level, we recommend consulting professional mental health services."},
    },
    "anger": {
        "title": "Anger (Neuroticism)",
        "summary": "Anger describes tendency to experience feelings of anger, frustration, and resentment. It is the facet of Neuroticism related to hostile reactions.",
        "body1": "Anger is the facet of Neuroticism related to hostility and frustration. High-scoring individuals typically easily experience anger due to unfairness, blockage, or disappointment, have a lower threshold for anger trigger, and may find it harder to calm down after frustration. Low-scoring individuals tend to not be easily provoked, have higher tolerance for frustration and offense, and recover from negative emotions faster. Anger itself is a normal and sometimes necessary emotion \u2014 this facet measures how easily anger is triggered and sustained.",
        "body2": "**High-scoring individuals** tend to: react strongly to unfairness and unreasonable situations, have frustration easily triggered, have advantage in situations requiring justice maintenance and challenging injustice \u2014 high-anger individuals are often important forces driving change, but also need to manage anger expression to avoid damaging relationships.\n\n**Low-scoring individuals** tend to: not easily angered by external events, have high tolerance for frustration and offense, and have advantage in communication situations requiring patience and emotional stability.",
        "faq": {"q": "Does low anger mean having no temper?", "a": "No. Low anger simply means you are not easily triggered to experience anger by external events. This can be an advantage when facing provocation, but may also mean you do not express anger when you should \u2014 appropriate anger is valuable for maintaining boundaries and justice."},
    },
    "depression": {
        "title": "Depression (Neuroticism)",
        "summary": "Depression describes tendency to experience sadness, low mood, and feelings of helplessness. It is the facet of Neuroticism related to negative mood.",
        "body1": "Depression is the facet of Neuroticism related to sadness and low mood. High-scoring individuals typically more easily experience sadness, helplessness, and defeat, have longer low periods after setbacks, and may hold more pessimistic expectations for the future. Low-scoring individuals tend to experience sadness and low mood less frequently and recover faster after setbacks. Important distinction: this facet measures sadness experience tendency, not a depression diagnosis criterion.",
        "body2": "**High-scoring individuals** tend to: have stronger emotional reactions to loss and setbacks, experience sadness and loss more deeply and recover more slowly, have unique sensitivity in activities requiring deep emotional understanding and artistic expression, but also consume more psychological resources due to longer recovery cycles.\n\n**Low-scoring individuals** tend to: recover to normal state faster after setbacks, are less occupied by low mood, and have advantage in situations requiring sustained steady output.",
        "faq": {"q": "What is the relationship between high depression level and clinical depression?", "a": "The depression facet reflects tendency to experience sadness and low mood \u2014 a personality trait dimension. Clinical depression is a diagnosis requiring professional assessment. A high level does not mean you have depression, but if you chronically feel unshakable low mood, we recommend seeking professional help."},
    },
    "self-consciousness": {
        "title": "Self-Consciousness (Neuroticism)",
        "summary": "Self-consciousness describes tendency to feel awkward, uncomfortable, and scrutinized in social situations. It is the facet of Neuroticism related to social sensitivity.",
        "body1": "Self-consciousness is the facet of Neuroticism related to self-awareness and discomfort in social situations. High-scoring individuals typically easily feel watched and judged in social settings, care about how others perceive them, and often have the feeling that everyone is looking at me in crowds. Low-scoring individuals tend to feel less uncomfortable in social situations, do not overly worry about how others see them, and appear natural in public settings. Self-consciousness relates to but is not identical to shyness \u2014 you can be shy without strong self-consciousness.",
        "body2": "**High-scoring individuals** tend to: easily feel uncomfortable and scrutinized in social situations, have high attention to their appearance and behavior, have advantage in situations requiring precise self-monitoring and social etiquette, but may be overly nervous in contexts requiring natural and relaxed expression.\n\n**Low-scoring individuals** tend to: be naturally relaxed in social and public situations, not overly care about others' gaze, have advantage in situations requiring public expression and improvisation, but may not be alert enough in contexts requiring refined etiquette and social sensitivity.",
        "faq": {"q": "Is high self-consciousness social anxiety disorder?", "a": "No. High self-consciousness only means you care more about your performance in social situations but typically do not avoid socializing because of it. If this concern has become so severe that you avoid social activities and it affects your quality of life, it may involve social anxiety disorder. We recommend consulting professional help."},
    },
    "impulsiveness": {
        "title": "Impulsiveness (Neuroticism)",
        "summary": "Impulsiveness describes ability to control impulses when facing temptation and desire. It is the facet of Neuroticism related to self-control.",
        "body1": "Impulsiveness is the facet of Neuroticism related to impulse control. High-scoring individuals typically find it harder to control impulses when facing immediate temptation, easily make decisions they later regret, and have stronger cravings for immediate gratification. Low-scoring individuals tend to have better impulse control, can resist short-term temptations to pursue long-term goals, and have advantage in situations requiring waiting and delayed gratification. Impulsiveness describes difficulty controlling impulses, not a moral judgment \u2014 high impulsiveness does not equal weak will.",
        "body2": "**High-scoring individuals** tend to: have difficulty resisting immediate temptations (food, shopping, social media), prefer spontaneity over pre-planning, may have advantage in fields requiring quick reaction and immediate action, but may struggle in areas requiring long-term self-discipline and delayed gratification.\n\n**Low-scoring individuals** tend to: have good impulse control, are not easily swayed by immediate temptations, and have advantage in tasks requiring long-term planning and sustained self-discipline.",
        "faq": {"q": "Does high impulsiveness mean poor self-control?", "a": "Impulsiveness reflects how strongly you feel impulses when facing temptation, not whether you ultimately give in. Someone high in impulsiveness can still effectively manage behavior through environmental strategies (removing temptations, setting clear rules)."},
    },
    "vulnerability": {
        "title": "Vulnerability (Neuroticism)",
        "summary": "Vulnerability describes ability to cope and recover under stress. It is the facet of Neuroticism related to stress tolerance.",
        "body1": "Vulnerability is the facet of Neuroticism related to stress coping ability. High-scoring individuals typically easily feel helpless and overwhelmed under stress, have decreased coping ability in emergency and high-pressure situations, and need longer time to return to normal. Low-scoring individuals tend to stay relatively calm and cope effectively under stress, maintain judgment and action ability in emergencies, and recover faster. Vulnerability reflects ease of coping under stress, not a judgment of weakness or strength.",
        "body2": "**High-scoring individuals** tend to: easily feel overwhelmed and resource-depleted in high-pressure situations, need clear support and recovery time, have alerting value in tasks requiring high vigilance and risk sensitivity, but high-pressure scenarios themselves bring higher recovery cost.\n\n**Low-scoring individuals** tend to: maintain relatively stable judgment and execution under stress and emergency, recover faster, and have advantage in situations requiring crisis handling and high-pressure decisions.",
        "faq": {"q": "Are people high in vulnerability poor at handling pressure?", "a": "Vulnerability reflects your subjective experience of difficulty under stress. Some people who appear to handle pressure poorly may, all else being equal, just need more recovery time rather than lacking ability. Moreover, high vulnerability can be an advantage in jobs requiring high vigilance and risk sensitivity."},
    },
}

# =========================================================================
# 1. GENERATE EN FACET CONTENT PACKAGES
# =========================================================================

file_date = "2026-07-08"

domain_slugs = {
    "openness": "openness",
    "conscientiousness": "conscientiousness",
    "extraversion": "extraversion",
    "agreeableness": "agreeableness",
    "neuroticism": "neuroticism",
}

domain_labels = {
    "openness": "Openness",
    "conscientiousness": "Conscientiousness",
    "extraversion": "Extraversion",
    "agreeableness": "Agreeableness",
    "neuroticism": "Neuroticism / Emotional Sensitivity",
}

# Read zh-CN facet packages to get domain mapping
facet_domains = {}
for fname in sorted(os.listdir(ZH_DIR)):
    if not fname.endswith(".content-package.json"):
        continue
    path = os.path.join(ZH_DIR, fname)
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if data.get("entity_type") != "facet_detail":
        continue
    code = data["code"]
    # Extract domain from internal links
    for link in data.get("internal_links", []):
        if link.get("relationship") == "domain":
            domain_path = link.get("href", "")
            domain_slug = domain_path.rstrip("/").split("/")[-1] if domain_path else ""
            if domain_slug in domain_slugs:
                facet_domains[code] = domain_slug
    if code not in facet_domains:
        print(f"  WARNING: Could not determine domain for {code}")
        facet_domains[code] = "openness"  # fallback

for code, en_data in FACET_EN.items():
    domain_slug = facet_domains.get(code, "openness")
    domain_label = domain_labels.get(domain_slug, "Openness")

    pkg = {
        "package_id": f"big_five:en:{code}:editorial-repair-01",
        "framework": "big_five",
        "entity_type": "facet_detail",
        "code": code,
        "locale": "en",
        "slug": f"big-five/facets/{code}",
        "title": en_data["title"],
        "summary": en_data["summary"],
        "seo": {
            "title": f"{en_data['title'].split(' (')[0]} | Big Five 30 Facets",
            "description": en_data["summary"],
        },
        "canonical": {
            "path": f"/en/personality/big-five/facets/{code}",
        },
        "hreflang": {
            "zh-CN": f"/zh/personality/big-five/facets/{code}",
            "en": f"/en/personality/big-five/facets/{code}",
        },
        "robots": "noindex,follow",
        "launch_state": "content_ready",
        "index_eligible": False,
        "sitemap_eligible": False,
        "llms_eligible": False,
        "sections": [
            {
                "key": "quick_answer",
                "title": "Quick Answer",
                "body": en_data["summary"],
                "evidence_ids": ["A1", "A8"],
            },
            {
                "key": "what_is",
                "title": f"What is {en_data['title'].split(' (')[0]}?",
                "body": en_data["body1"],
                "evidence_ids": ["A1", "A8"],
            },
            {
                "key": "high_low",
                "title": "High vs Low",
                "body": en_data["body2"],
                "evidence_ids": ["A1", "A8"],
            },
        ],
        "faq": [
            {
                "id": f"{code}-faq-1",
                "question": en_data["faq"]["q"],
                "answer": en_data["faq"]["a"],
                "evidence_ids": ["A1", "A8"],
            },
        ],
        "media": {
            "status": "placeholder",
            "image_url": None,
            "alt": f"Big Five placeholder image for {en_data['title'].split(' (')[0]}, no MBTI branding.",
        },
        "schema": {
            "type": "Article",
            "status": "noindex_repaired_content",
            "framework": "big_five",
            "entity_type": "facet_detail",
        },
        "method_boundary": {
            "summary": "This page explains public knowledge about Big Five personality. It does not interpret individual assessment results or substitute for professional judgment.",
            "not_for": [
                "Clinical diagnosis",
                "Psychological treatment advice",
                "Hiring or screening",
                "Ability or intelligence assessment",
                "Career or relationship decisions",
            ],
        },
        "evidence_notes": [
            "This page is written based on the public research tradition of the Big Five as a continuous trait model, referencing BFI-2, Five-Factor Model reviews, the IPIP public item pool ecosystem, and 30-facet literature.",
            "These explanations are for understanding personality language and communication differences, not for clinical diagnosis, psychological treatment, hiring, ability assessment, or career decisions.",
            "Competitor pages are used only to identify user problems and content gaps, not to copy their structure, examples, or wording.",
        ],
        "internal_links": [
            {"label": "Big Five", "href": "/en/personality/big-five", "relationship": "hub"},
            {"label": "30 Facets", "href": "/en/personality/big-five/facets", "relationship": "facet_overview"},
            {"label": domain_label, "href": f"/en/personality/big-five/{domain_slug}", "relationship": "domain"},
        ],
        "source_ledger_refs": ["A1", "A2", "A5", "A8", "I2", "I4"],
        "model_output_refs": ["BIG-FIVE-V1-CONTENT-EDITORIAL-REPAIR-01"],
        "last_reviewed_at": file_date,
    }

    out_path = os.path.join(EN_DIR, f"{code}.content-package.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(pkg, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"  EN: {code}.content-package.json")

print(f"\nGenerated {len(FACET_EN)} en-locale facet packages.")

# =========================================================================
# 2. GENERATE SEED ENTRIES
# =========================================================================

def pkg_to_seed(pkg, locale):
    """Convert a content-package.json to seed format."""
    return {
        "framework": pkg["framework"],
        "entity_type": pkg["entity_type"],
        "code": pkg["code"],
        "entity_key": pkg["code"],
        "slug": pkg["slug"],
        "locale": locale,
        "title": pkg["title"],
        "summary": pkg["summary"],
        "seo": {
            "title": pkg["seo"]["title"],
            "description": pkg["seo"]["description"],
        },
        "robots": pkg["robots"],
        "canonical_path": pkg["canonical"]["path"],
        "canonical": {"path": pkg["canonical"]["path"]},
        "hreflang": pkg["hreflang"],
        "sections": [
            {
                "key": s["key"],
                "title": s["title"],
                "body": s["body"],
                "evidence_ids": s.get("evidence_ids", []),
            }
            for s in pkg.get("sections", [])
        ],
        "faq": [
            {
                "id": faq.get("id", f"{pkg['code']}-{i}"),
                "question": faq["question"],
                "answer": faq["answer"],
                "evidence_ids": faq.get("evidence_ids", []),
            }
            for i, faq in enumerate(pkg.get("faq", []), 1)
        ],
        "media": pkg.get("media", {"status": "placeholder", "image_url": None, "alt": ""}),
        "method_boundary": pkg.get("method_boundary", {}),
        "internal_links": [
            {
                "label": link["label"],
                "href": link["href"],
                "relationship": link.get("relationship"),
                "target_code": link.get("target_code"),
            }
            for link in pkg.get("internal_links", [])
        ],
        "evidence_notes": [
            {"note": note} if isinstance(note, str) else note
            for note in pkg.get("evidence_notes", [])
        ],
        "launch_state": pkg.get("launch_state", "content_ready"),
        "review_state": pkg.get("review_state", "reviewed"),
        "index_eligible": pkg.get("index_eligible", False),
        "sitemap_eligible": pkg.get("sitemap_eligible", False),
        "llms_eligible": pkg.get("llms_eligible", False),
        "is_public": True,
        "schema_runtime_eligible": False,
        "org_id": 0,
    }

# Read existing seed
with open(SEED_FILE, "r", encoding="utf-8") as f:
    seed = json.load(f)

existing_codes = {(a["entity_type"], a["code"], a["locale"]) for a in seed["assets"]}

# Check existing facet_detail entries
existing_facet_detail = [c for c in existing_codes if c[0] == "facet_detail"]
print(f"\nExisting facet_detail entries in seed: {len(existing_facet_detail)}")

# Generate zh-CN seed entries
zh_seed_entries = []
for code in sorted(FACET_EN.keys()):
    zh_path = os.path.join(ZH_DIR, f"{code}.content-package.json")
    if not os.path.exists(zh_path):
        print(f"  MISSING zh-CN: {code}.content-package.json")
        continue
    with open(zh_path, "r", encoding="utf-8") as f:
        zh_pkg = json.load(f)
    entry = pkg_to_seed(zh_pkg, "zh-CN")
    key = (entry["entity_type"], entry["code"], entry["locale"])
    if key in existing_codes:
        print(f"  SKIP (exists): {code} zh-CN")
        continue
    zh_seed_entries.append(entry)
    print(f"  SEED zh-CN: {code}")

# Generate en seed entries
en_seed_entries = []
for code in sorted(FACET_EN.keys()):
    en_path = os.path.join(EN_DIR, f"{code}.content-package.json")
    if not os.path.exists(en_path):
        print(f"  MISSING EN: {code}.content-package.json")
        continue
    with open(en_path, "r", encoding="utf-8") as f:
        en_pkg = json.load(f)
    entry = pkg_to_seed(en_pkg, "en")
    key = (entry["entity_type"], entry["code"], entry["locale"])
    if key in existing_codes:
        print(f"  SKIP (exists): {code} en")
        continue
    en_seed_entries.append(entry)
    print(f"  SEED en: {code}")

new_entries = zh_seed_entries + en_seed_entries
print(f"\nNew seed entries to add: {len(new_entries)} ({len(zh_seed_entries)} zh-CN + {len(en_seed_entries)} en)")

if new_entries:
    seed["assets"].extend(new_entries)
    total = len(seed["assets"])
    new_count = len(new_entries)
    print(f"Total seed assets after: {total} (was {total - new_count}, +{new_count})")

    with open(SEED_FILE, "w", encoding="utf-8") as f:
        json.dump(seed, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Wrote updated seed to: {SEED_FILE}")
else:
    print("No new entries to add. Seed file unchanged.")

print("\nDone.")

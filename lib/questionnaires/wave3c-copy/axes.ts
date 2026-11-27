import type { TrilingualReading } from "./types";

export const axisReadings = {
  empathy: [
    ["关怀线索", "情境回应", "自述倾向", "你这轮记下了自己在不同场合怎样体会他人的感受。"],
    ["關懷線索", "情境回應", "自述傾向", "你這輪記下自己在不同場合怎麼體會他人的感受。"],
    ["Compassion", "Context", "Self-Reflection", "Your answers reflect when you notice or respond to others' feelings."],
  ],
  "growth-mindset-fixed-mindset": [
    ["可变信念", "学习视角", "自述倾向", "你怎么看能力能否改变，这轮选择留下了当下的想法。"],
    ["可變信念", "學習視角", "自述傾向", "你怎麼看能力能不能改變，這輪選擇留下當下的想法。"],
    ["Belief in Change", "Learning Outlook", "Self-Reflection", "Your answers capture how you think about change and learning right now."],
  ],
  "locus-of-control": [
    ["影响感受", "处境线索", "控制信念", "你这轮的回答，记录了你怎样看待行动对结果的影响。"],
    ["影響感受", "處境線索", "控制信念", "你這輪的回答，記下你怎麼看待行動對結果的影響。"],
    ["Sense of Control", "Context Cues", "Personal Outlook", "Your answers show how you see the links between actions and outcomes."],
  ],
  "social-intelligence-test": [
    ["互动感受", "社交线索", "自述倾向", "你这轮记录的是自己怎么看互动中发生的事。"],
    ["互動感受", "社交線索", "自述傾向", "你這輪記下了自己怎麼看互動中發生的事。"],
    ["Social Context", "Interaction Cues", "Self-Reflection", "Your answers reflect how you see what happens in social situations."],
  ],
  "tech-savvy": [
    ["工具信心", "使用感受", "今日刻度", "你这轮记下的是用工具的信心，换个场景也许会不同。"],
    ["工具信心", "使用感受", "當下刻度", "你這輪記下的是使用工具的信心，換個情境可能不同。"],
    ["Tool Confidence", "Task Context", "Current Snapshot", "Your confidence with these tools can shift when the task changes."],
  ],
  "freelance-ready": [
    ["接案准备", "行动阶段", "分项记录", "你这轮记下了接案准备的各个部分，可以分开看。"],
    ["接案準備", "行動階段", "分項紀錄", "你這輪記下接案準備的各個部分，可以分開來看。"],
    ["Freelance Setup", "Action Stages", "Separate Notes", "You can see where each part of your freelance preparation stands."],
  ],
  "remote-work": [
    ["远程安排", "行动阶段", "分项记录", "你这轮记下了眼前的远程安排，各环节进度可以不同。"],
    ["遠距安排", "行動階段", "分項紀錄", "你這輪記下目前的遠距安排，各環節可以有不同進度。"],
    ["Remote Setup", "Action Stages", "Separate Notes", "Your remote work setup can be at different stages in different areas."],
  ],
} satisfies Record<string, TrilingualReading>;

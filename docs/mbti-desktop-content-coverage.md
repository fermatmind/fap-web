# MBTI Desktop content coverage

## Authoring model
- base registry: `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/content/*.zh.ts`
- fullCode patch registry: `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/content/variants/*.zh.ts`
- flattened runtime registry: `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/content/index.ts`

## Ownership boundary
- runtime still owns: `fullCode`, `baseCode`, display title, bars, tools, unlock actions, runtime price
- fullCode registry now owns: hero, intro, traits copy, career, growth, relationships, final offer
- asset slots remain placeholder-only until the later AI illustration replacement PR
- next step after this PR: move the fullCode registry into the future CMS / DB owner without redesigning the 32-type content shape

## Coverage table

| FullCode | BaseCode | Base file | Patch file | Source | Hero | Intro | Traits | Career | Growth | Relationships | Final Offer | Asset slots |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INTJ-A | INTJ | `content/intj.zh.ts` | `variants/intj-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| INTJ-T | INTJ | `content/intj.zh.ts` | `variants/intj-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| INTP-A | INTP | `content/intp.zh.ts` | `variants/intp-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| INTP-T | INTP | `content/intp.zh.ts` | `variants/intp-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ENTJ-A | ENTJ | `content/entj.zh.ts` | `variants/entj-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ENTJ-T | ENTJ | `content/entj.zh.ts` | `variants/entj-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ENTP-A | ENTP | `content/entp.zh.ts` | `variants/entp-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ENTP-T | ENTP | `content/entp.zh.ts` | `variants/entp-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| INFJ-A | INFJ | `content/infj.zh.ts` | `variants/infj-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| INFJ-T | INFJ | `content/infj.zh.ts` | `variants/infj-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| INFP-A | INFP | `content/infp.zh.ts` | `variants/infp-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| INFP-T | INFP | `content/infp.zh.ts` | `variants/infp-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ENFJ-A | ENFJ | `content/enfj.zh.ts` | `variants/enfj-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ENFJ-T | ENFJ | `content/enfj.zh.ts` | `variants/enfj-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ENFP-A | ENFP | `content/enfp.zh.ts` | `variants/enfp-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ENFP-T | ENFP | `content/enfp.zh.ts` | `variants/enfp-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ISTJ-A | ISTJ | `content/istj.zh.ts` | `variants/istj-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ISTJ-T | ISTJ | `content/istj.zh.ts` | `variants/istj-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ISFJ-A | ISFJ | `content/isfj.zh.ts` | `variants/isfj-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ISFJ-T | ISFJ | `content/isfj.zh.ts` | `variants/isfj-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ESTJ-A | ESTJ | `content/estj.zh.ts` | `variants/estj-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ESTJ-T | ESTJ | `content/estj.zh.ts` | `variants/estj-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ESFJ-A | ESFJ | `content/esfj.zh.ts` | `variants/esfj-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ESFJ-T | ESFJ | `content/esfj.zh.ts` | `variants/esfj-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ISTP-A | ISTP | `content/istp.zh.ts` | `variants/istp-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ISTP-T | ISTP | `content/istp.zh.ts` | `variants/istp-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ISFP-A | ISFP | `content/isfp.zh.ts` | `variants/isfp-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ISFP-T | ISFP | `content/isfp.zh.ts` | `variants/isfp-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ESTP-A | ESTP | `content/estp.zh.ts` | `variants/estp-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ESTP-T | ESTP | `content/estp.zh.ts` | `variants/estp-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ESFP-A | ESFP | `content/esfp.zh.ts` | `variants/esfp-a.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |
| ESFP-T | ESFP | `content/esfp.zh.ts` | `variants/esfp-t.zh.ts` | flattened fullCode | yes | yes | yes | yes | yes | yes | yes | placeholder |

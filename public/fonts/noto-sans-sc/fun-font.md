# Entertainment content image font

`fun-700.ttf` is a 700-weight subset of Noto Sans SC for the public entertainment quiz topics and portrait names, plus the short bilingual image labels. It is used only by `/og/fun/{slug}`; normal page text does not load this file.

Source: [Google Fonts Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc), `NotoSansSC[wght].ttf`. The original source digest at authoring was `a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da`. Retain the supplied `fun-OFL.txt` license.

The subset was generated with FontTools: instantiate weight 700, populate the subset from both languages of `seo.topic` and all result titles in `lib/entertainment/data`, printable ASCII, and `完整内容免费仅供娱乐原创趣味测试公开画像指南·—`. Update the subset when those displayed labels change. There is no runtime font-network request.

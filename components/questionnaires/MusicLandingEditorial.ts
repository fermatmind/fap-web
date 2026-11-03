import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "pop": {
    "zh": "流行音乐：从副歌旋律、人声位置和段落变化辨别喜好。可以比较同一首歌主歌与副歌最吸引你的地方；喜欢流行不等于只听热门榜单。",
    "en": "Pop: distinguish returning choruses, foreground vocals and section changes. Compare what attracts you in a verse and chorus; liking pop does not mean listening only to chart hits."
  },
  "rock": {
    "zh": "摇滚音乐：回看电吉他、贝斯、鼓与乐队展开的变化。试着区分吸引你的是重复乐句、节奏推进还是整体音色，而不由喜好推断叛逆或性格强弱。",
    "en": "Rock: revisit guitar, bass, drums and changes in a band’s sound. Separate repeated figures, rhythmic drive and overall timbre without inferring rebellion or strength of character."
  },
  "hip-hop": {
    "zh": "嘻哈音乐：观察语句怎样穿过节拍，鼓与低音怎样形成律动。可以留意同一段人声的停顿与重音；对声音的喜欢不代表赞同歌词或某种身份。",
    "en": "Hip-hop: explore phrasing around a beat and the groove of drums with bass. Notice pauses and accents in a vocal passage; liking the sound does not establish agreement with lyrics or a social identity."
  },
  "electronic": {
    "zh": "电子音乐：比较合成音色、层次进出和处理后的空间感。可以听听节拍不变时有哪些声音进入或退出；电子偏好并不限定舞曲、夜生活或高音量。",
    "en": "Electronic: compare synthesised timbres, entering layers and processed space. Notice what changes over a steady beat; this preference is not restricted to dance music, nightlife or high volume."
  },
  "jazz": {
    "zh": "爵士音乐：从独奏乐句、节奏重音和合奏回应找到具体线索。可以只跟随一个乐器的一小段变化，无需懂乐理，也不把喜好当作智力或教育程度。",
    "en": "Jazz: find specific cues in solo phrases, rhythmic accents and ensemble responses. Follow one instrument briefly without needing theory or treating enjoyment as intelligence or education."
  },
  "western-classical": {
    "zh": "西方古典器乐：观察主题怎样变化，以及弦乐、管乐和钢琴的声音层次。可以比较主题再次出现时的配器；本范围不代表全球古典传统或更高级的品味。",
    "en": "Western classical instrumental: notice transformed themes and layers of strings, winds and piano. Compare instrumentation when a theme returns; this scope represents neither all classical traditions nor superior taste."
  },
  "acoustic-folk": {
    "zh": "原声民谣：比较弦乐与歌声的关系、稀疏编排和讲述感。可以在熟悉作品中留意一个拨弦或人声细节；乐器较少不自动等于更真实或更有内涵。",
    "en": "Acoustic folk: compare strings with vocals, sparse arrangements and storytelling. Notice a plucked-string or vocal detail in familiar music; fewer instruments do not automatically imply authenticity or depth."
  },
  "country": {
    "zh": "乡村音乐：回看旋律叙事、歌声与弦乐，以及拨弦、滑音或拉弦的细节。可以与原声民谣比较共同声音，不据此推断乡居经历、政治立场或个人品格。",
    "en": "Country: revisit melodic storytelling, singing with strings, and plucked, sliding or bowed details. Compare shared cues with acoustic folk without inferring rural experience, politics or personal character."
  }
};

export function musicLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

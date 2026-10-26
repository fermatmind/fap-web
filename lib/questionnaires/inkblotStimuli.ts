export type InkblotStimulus = { questionId: string; src: string; sha256: string; description: { en: string; zh: string } };

const stimuli: readonly InkblotStimulus[] = [
  {
    "questionId": "INK_01",
    "src": "/images/questionnaires/inkblot-original/fm-inkblot-01.svg",
    "sha256": "4c5135893f14ab216177a6dd887506392bbaeb309f3fe7c4197a4f682161f34a",
    "description": {
      "zh": "白底上两块分开的深青色竖形，左右镜像；内部各有浅绿色斑块，边缘附近有小墨点。",
      "en": "On white, two separated dark-teal vertical forms mirror each other. Each contains a pale-green patch, with small dots near the edges."
    }
  },
  {
    "questionId": "INK_02",
    "src": "/images/questionnaires/inkblot-original/fm-inkblot-02.svg",
    "sha256": "c2f6708bf9f4dd6366cc1ef635c44f759978ef35ea0214345bcfb7872e108a9a",
    "description": {
      "zh": "白底上两块细长紫色形状左右镜像，靠近中间但保留白隙；各有暖棕色内斑和外侧小点。",
      "en": "On white, two slender purple mirrored forms approach a central white gap, each with a warm-brown inner patch and small outer dots."
    }
  },
  {
    "questionId": "INK_03",
    "src": "/images/questionnaires/inkblot-original/fm-inkblot-03.svg",
    "sha256": "25c5eb332c2cb4c974e39b43fa6a4a36f1421ad12b165272ebcb30a43a5e2ec5",
    "description": {
      "zh": "白底上的青色形状沿水平方向展开，在中部靠近相接；左右各有较浅的灰绿色斑块。",
      "en": "A teal form extends horizontally on white, with mirrored sides meeting near the middle and a paler grey-green patch on each side."
    }
  },
  {
    "questionId": "INK_04",
    "src": "/images/questionnaires/inkblot-original/fm-inkblot-04.svg",
    "sha256": "a99dc8ad798f550ac8002516f57439ef6c65a6ad0bed129917f40cd65c758257",
    "description": {
      "zh": "白底上较宽的蓝紫色形状左右镜像，中央相连；内部灰紫色较浅斑块与外侧小点可见。",
      "en": "A broad blue-violet mirrored form joins centrally on white, with paler grey-violet inner patches and small outer dots."
    }
  },
  {
    "questionId": "INK_05",
    "src": "/images/questionnaires/inkblot-original/fm-inkblot-05.svg",
    "sha256": "37ff39c1eceb456d8cdd02b5b963b7bec3d4d324bf264e7be57af96a6806113e",
    "description": {
      "zh": "白底上两块分开的暗玫紫色竖形，中间有明显白色间隔；内部各有偏棕的浅斑块。",
      "en": "Two separated dark-rose vertical forms stand on white with a clear central gap, each containing a lighter brownish patch."
    }
  },
  {
    "questionId": "INK_06",
    "src": "/images/questionnaires/inkblot-original/fm-inkblot-06.svg",
    "sha256": "426d94a65a9a3e8bf66423efbd6603c4a25ef9140e46982add83251af8597fbf",
    "description": {
      "zh": "白底上深青色左右相接，构成较扁的整体；内部浅绿色斑块靠近中部，两端附近有小点。",
      "en": "Dark-teal mirrored sides join into a low, wide form on white. Pale-green patches sit toward the middle, with dots near the outer ends."
    }
  },
  {
    "questionId": "INK_07",
    "src": "/images/questionnaires/inkblot-original/fm-inkblot-07.svg",
    "sha256": "8737e879e629ab91b50bab32c8272a26a1005af4605a1c60e03e329147f15576",
    "description": {
      "zh": "白底上两块宽紫色形状左右镜像，中间有折线状白色间隔，内部是偏灰粉色的浅斑块。",
      "en": "Two broad purple mirrored forms on white leave an angular central gap and contain paler muted-pink patches."
    }
  },
  {
    "questionId": "INK_08",
    "src": "/images/questionnaires/inkblot-original/fm-inkblot-08.svg",
    "sha256": "d9f25687e344ea54d2141e00ff5b3912527453fdf9c597f306316499edc0a170",
    "description": {
      "zh": "白底上两块高窄的灰蓝色形状左右镜像，靠中部相接；内部各有浅橄榄色斑块，上部附近有小点。",
      "en": "Two tall, narrow slate-blue mirrored forms approach and join centrally on white, with pale-olive inner patches and dots toward the top."
    }
  },
  {
    "questionId": "INK_09",
    "src": "/images/questionnaires/inkblot-original/fm-inkblot-09.svg",
    "sha256": "7b963d86c58ced71a6af1ea5253c914214d07104aa4114c5c0dff7f9c9e25a14",
    "description": {
      "zh": "白底上暗玫紫色形状横向展开并在中间相接，两边内部有浅棕色斑块，周围有散落小点。",
      "en": "A dark-rose form extends sideways and joins centrally on white, with pale-brown patches on both sides and scattered dots nearby."
    }
  },
  {
    "questionId": "INK_10",
    "src": "/images/questionnaires/inkblot-original/fm-inkblot-10.svg",
    "sha256": "8d9246c63d19633b14e61553820d0f76660981189cdcbe21cd2aa8317d892456",
    "description": {
      "zh": "白底上两块高低起伏的深蓝色形状左右镜像，中间靠近相接；浅蓝灰色斑块位于内侧。",
      "en": "Two uneven dark-blue mirrored forms approach and join centrally on white, with pale blue-grey patches toward the inside."
    }
  }
];

// Only these ten original local assets belong to this question bank.
export function getInkblotStimulus(questionId: string | undefined): InkblotStimulus | undefined {
  return stimuli.find(stimulus => stimulus.questionId === questionId);
}

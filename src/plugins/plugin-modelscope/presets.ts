// 内置 LoRA 别名预设
// 这些是社区常用的 LoRA 配置，用户可以快速导入使用

import type { LoraAlias } from './config'

/** 内置 LoRA 别名预设 */
export const builtinLoraPresets: LoraAlias[] = [
  // === 基础模型 ===
  {
    alias: 'qwen',
    repoId: 'Qwen/Qwen-Image',
    description: '通用基础模型'
  },

  // === 风格模型 ===
  {
    alias: 'mj',
    repoId: 'merjic/majicbeauty-qwen1',
    triggerWords: 'mj',
    description: '清冷风美人'
  },
  {
    alias: 'void',
    repoId: 'violetzzzz/void_0',
    triggerWords: 'void 0 style',
    description: 'void_0风格二次元'
  },
  {
    alias: 'film',
    repoId: 'dominik0420/august_film_2',
    description: '电影风格增强'
  },
  {
    alias: 'wlop',
    repoId: 'vioaki/wlop_year2018_dim64_5e-4_fl',
    triggerWords: 'wlop style',
    description: 'wlop风格模型'
  },
  {
    alias: 'sgs',
    repoId: 'vioaki/sgs',
    triggerWords: 'sgs style',
    description: '三国杀插图风格'
  },
  {
    alias: 'JLT4n',
    repoId: 'vioaki/JLT4n',
    description: '二次元插画风格'
  },
  {
    alias: 'blue_archive',
    repoId: 'violetzzzz/blue_archive',
    description: '蔚蓝档案CG风格'
  },
  {
    alias: 'AteyGhailan',
    repoId: 'violetzzzz/AteyGhailan',
    description: '欧美油画感厚涂风格'
  },
  {
    alias: 'photo',
    repoId: 'violetzzzz/picture',
    description: '温馨摄影图片风格'
  },
  {
    alias: 'JiankunYu',
    repoId: 'violetzzzz/JiankunYu',
    description: '二次元叙事感绘画风格'
  },
  {
    alias: 'jky',
    repoId: 'violetzzzz/jiankunyu_v3',
    triggerWords: 'jiankunyu style',
    description: 'jiankunyu style v3'
  },
  {
    alias: '2d',
    repoId: 'Or4ng3/2DPixelArtBackground',
    description: '2d像素风'
  },
  {
    alias: 'msw',
    repoId: 'whiteside123/qwenmsw2',
    triggerWords: 'art by msw',
    description: '米山舞画风二次元'
  },
  {
    alias: 'chibi',
    repoId: 'MTWLDFC/miratsu_style',
    triggerWords: 'miratsu style,chibi',
    description: '初音未来专用Q版chibi风格'
  },
  {
    alias: 'reina',
    repoId: 'xianienie/reina_style_neta_lumina',
    triggerWords: 'this picture is drawn by reina',
    description: 'reina画风，角色有流萤申鹤八重等二游角色'
  },

  // === 特化模型 ===
  {
    alias: 'hs',
    repoId: 'xmwd2009/qwen_image_xmwd_black_pantyhose_feet_lora',
    triggerWords: 'close-up of pantyhose feet',
    description: '黑丝特化'
  },
  {
    alias: 'bs',
    repoId: 'xmwd2009/qwen_image_xmwd_white_pantyhose_feet_lora',
    triggerWords: 'close-up of pantyhose feet',
    description: '白色丝袜特化'
  },
  {
    alias: 'rs',
    repoId: 'xmwd2009/qwen_image_xmwd_nude_pantyhose_feet_lora',
    triggerWords: 'close-up of pantyhose feet',
    description: '肉色丝袜特化'
  },

  // === 崩坏星穹铁道角色 ===
  {
    alias: 'firefly',
    repoId: 'firefly123123/firefly',
    triggerWords: 'liuying',
    description: '崩坏星穹铁道角色流萤'
  },
  {
    alias: 'hh',
    repoId: 'aojiepp/huahuo-D2',
    description: '崩坏星穹铁道角色花火/Sparkle真人cos'
  },
  {
    alias: 'kfk',
    repoId: 'Zyw3040622524/kafuka2',
    triggerWords: 'kafuka',
    description: '崩坏星穹铁道角色卡夫卡'
  },
  {
    alias: 'cyy',
    repoId: 'skyrimpasser/Evernight_Honkai_Star_Rail_character_lora',
    triggerWords: 'changyeyue',
    description: '崩坏星穹铁道角色长夜月（三月七黑化）'
  },
  {
    alias: 'zgn',
    repoId: 'zhouwenbin1994/zhigengniao',
    triggerWords: 'zhigengniao',
    description: '崩坏星穹铁道角色知更鸟cos'
  },
  {
    alias: 'kldl',
    repoId: 'Shushu97/mhy-kl',
    triggerWords: 'kldl',
    description: '崩坏星穹铁道角色刻律德菈'
  },
  {
    alias: 'fj',
    repoId: 'lelexiong1025/Nova-Anime-XL-Illustrious-IL',
    description: '崩坏星穹铁道角色风瑾'
  },
  {
    alias: 'sfhj11',
    repoId: 'zc1992591/sfhj11',
    triggerWords: 'sfhj11',
    description: '崩坏星穹铁道角色飞霄'
  },

  // === 原神角色 ===
  {
    alias: 'nxd',
    repoId: 'windsing/nahida_Qwen_1',
    triggerWords: 'nahida',
    description: '原神角色纳西妲'
  },
  {
    alias: 'sllh',
    repoId: 'LukeChen/KamisatoAyaka-FlawlessRadiance',
    triggerWords: 'kamisatoayaka',
    description: '原神角色神里绫华'
  },
  {
    alias: 'furina',
    repoId: 'leletxh/furina',
    triggerWords: 'furina，animestyle',
    description: '原神角色芙宁娜专用模型'
  },
  {
    alias: 'kq',
    repoId: 'weiyumm/keqing_meme',
    triggerWords: 'keqing',
    description: '原神角色刻晴Q版表情包'
  },

  // === 鸣潮角色 ===
  {
    alias: 'ktxy',
    repoId: 'Liudef/XB_PONY_MC_KTXY_MAX',
    triggerWords: 'KTXY',
    description: '鸣潮角色卡提希娅'
  },
  {
    alias: 'cl',
    repoId: 'lll01001/changli1',
    triggerWords: 'changli',
    description: '鸣潮角色长离'
  },
  {
    alias: 'fb',
    repoId: 'TimelineX/feibi',
    triggerWords: 'feibi',
    description: '鸣潮角色菲比'
  },
  {
    alias: 'ktll',
    repoId: 'lll01001/ktllshaozhushiani',
    triggerWords: 'kanteleila',
    description: '鸣潮角色坎特蕾拉'
  },

  // === 其他游戏/动漫角色 ===
  {
    alias: 'mygo',
    repoId: 'nikoovo/mygo_anime_lora_testv1',
    triggerWords: 'mygo_fanju',
    description: 'mygo角色'
  },
  {
    alias: 'sl',
    repoId: 'Asense/SDLX-shenle',
    triggerWords: 'shenle',
    description: '阴阳师角色神乐'
  },
  {
    alias: 'fll',
    repoId: 'k2333333/Frieren',
    triggerWords: 'fulilian',
    description: '芙莉莲角色'
  },
  {
    alias: 'byj',
    repoId: 'c1416981454/baiyuekui',
    triggerWords: 'baiyuekui',
    description: '灵笼角色白月魁'
  },
  {
    alias: 'kn',
    repoId: 'Shinku/kanna-kamui',
    triggerWords: 'kanna kamui',
    description: '小林家的龙女仆'
  },
  {
    alias: 'akaza',
    repoId: 'Gralves/Akaza',
    triggerWords: 'akaza',
    description: '鬼灭之刃-上弦之三-猗窝座'
  },
  {
    alias: 'tzl',
    repoId: 'whoeoll/jxsajkhdasui',
    triggerWords: 'chinese',
    description: '鬼灭之刃炭治郎'
  },
  {
    alias: 'Ilyina',
    repoId: 'handsomej/lora',
    triggerWords: 'Ilyina',
    description: '魔女之旅Ilyina'
  },
  {
    alias: 'cy',
    repoId: 'cimashiro/congyu2',
    triggerWords: 'congyu',
    description: '千恋万花丛雨'
  },
  {
    alias: 'kurumi',
    repoId: 'Shinku/tokisaki-kurumi-v2',
    triggerWords: 'kurumi',
    description: '时崎狂三'
  },
  {
    alias: 'sheri',
    repoId: 'ocmirror/sherriu',
    triggerWords: 'sheri',
    description: '魔法少女的魔女审判'
  },
  {
    alias: 'Shiroko',
    repoId: 'A17318040596/Shiroko',
    triggerWords: 'Shiroko',
    description: 'q版ba角色砂狼白子'
  },
  {
    alias: 'doro',
    repoId: 'MTWLDFC/doro_2',
    triggerWords: 'Chibi，doro，pink hair',
    description: 'doro'
  },
  {
    alias: 'smd',
    repoId: 'PAseer/QwenSmolderLOL',
    triggerWords: '哈基龙_smolder',
    description: '英雄联盟角色斯莫德'
  },
  {
    alias: 'jmqs1',
    repoId: 'lan2190454541/jmqs1qianwen',
    triggerWords: 'jmqs1',
    description: '假面骑士01'
  },

  // === 卡通/虚拟角色 ===
  {
    alias: 'll',
    repoId: 'FHfanshu/capylulu',
    triggerWords: '水豚噜噜capylulu',
    description: '卡通虚拟角色水豚噜噜'
  },
  {
    alias: 'nl',
    repoId: 'xrundamlxg/nailong',
    triggerWords: '奶龙',
    description: '卡通虚拟角色奶龙（黄色）'
  },
  {
    alias: 'xb',
    repoId: 'Nana54321/Little-Eight',
    triggerWords: '小八',
    description: '小八吉伊卡哇'
  },
  {
    alias: 'nz',
    repoId: 'mailzwj/qwen-nezha',
    triggerWords: 'nezha',
    description: '电影魔童降世中哪吒形象'
  },

  // === 特定角色 ===
  {
    alias: 'ttqy',
    repoId: 'ziyi2333/Kotone_Fujita',
    triggerWords: 'Kotone_Fujita, anime style,brown eyes,long blonde hair styled in two braids',
    description: '绘制藤田琴音时，直接选择这个模型'
  }
]

/** 获取预设的分类 */
export function getPresetCategories(): { name: string, aliases: string[] }[] {
  return [
    {
      name: '风格模型',
      aliases: ['qwen', 'mj', 'void', 'film', 'wlop', 'sgs', 'JLT4n', 'blue_archive', 'AteyGhailan', 'photo', 'JiankunYu', 'jky', '2d', 'msw', 'chibi', 'reina']
    },
    {
      name: '崩坏星穹铁道',
      aliases: ['firefly', 'hh', 'kfk', 'cyy', 'zgn', 'kldl', 'fj', 'sfhj11']
    },
    {
      name: '原神',
      aliases: ['nxd', 'sllh', 'furina', 'kq']
    },
    {
      name: '鸣潮',
      aliases: ['ktxy', 'cl', 'fb', 'ktll']
    },
    {
      name: '特化模型',
      aliases: ['hs', 'bs', 'rs']
    },
    {
      name: '其他角色',
      aliases: ['mygo', 'sl', 'fll', 'byj', 'kn', 'akaza', 'tzl', 'Ilyina', 'cy', 'kurumi', 'sheri', 'Shiroko', 'doro', 'smd', 'jmqs1', 'll', 'nl', 'xb', 'nz', 'ttqy']
    }
  ]
}

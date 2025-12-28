// MiniMax T2A 连接器配置

import type { ConnectorField, CardDisplayField } from '../../core'

/** MiniMax T2A 配置字段 */
export const connectorFields: ConnectorField[] = [
  {
    key: 'apiKey',
    label: 'API Key',
    type: 'password',
    required: true,
    description: 'MiniMax API Key'
  },
  {
    key: 'endpoint',
    label: 'API 端点',
    type: 'text',
    required: false,
    default: 'https://api.minimaxi.com/v1/t2a_v2',
    placeholder: 'https://api.minimaxi.com/v1/t2a_v2',
    description: '默认使用 minimaxi.com，也可使用 minimax.io'
  },
  {
    key: 'model',
    label: '模型',
    type: 'text',
    required: false,
    default: 'speech-2.6-hd',
    placeholder: 'speech-2.6-hd',
    description: '可选: speech-2.6-hd, speech-2.6-turbo, speech-02-hd, speech-02-turbo, speech-01-hd, speech-01-turbo'
  },
  {
    key: 'voiceId',
    label: '音色 ID',
    type: 'text',
    required: false,
    default: 'female-tianmei',
    placeholder: 'female-tianmei',
    description: '中文: female-tianmei(甜美), female-yujie(御姐), male-qn-qingse(青涩青年), male-qn-jingying(精英青年); 英文: English_Graceful_Lady, English_Trustworthy_Man; 日语: Japanese_GentleButler, Japanese_KindLady'
  },
  {
    key: 'speed',
    label: '语速',
    type: 'number',
    default: 1.0,
    description: '语速，范围 0.5-2，默认 1.0'
  },
  {
    key: 'volume',
    label: '音量',
    type: 'number',
    default: 1.0,
    description: '音量，范围 0-10，默认 1.0'
  },
  {
    key: 'pitch',
    label: '音调',
    type: 'number',
    default: 0,
    description: '音调调整，范围 -12 到 12，默认 0'
  },
  {
    key: 'languageBoost',
    label: '语言增强',
    type: 'select',
    default: 'auto',
    options: [
      { value: 'auto', label: '自动检测' },
      { value: 'Chinese', label: '中文' },
      { value: 'Chinese,Yue', label: '粤语' },
      { value: 'English', label: '英语' },
      { value: 'Japanese', label: '日语' },
      { value: 'Korean', label: '韩语' },
      { value: 'French', label: '法语' },
      { value: 'German', label: '德语' },
      { value: 'Spanish', label: '西班牙语' },
      { value: 'Russian', label: '俄语' },
      { value: 'Arabic', label: '阿拉伯语' }
    ],
    description: '增强特定语言的识别'
  },
  {
    key: 'audioFormat',
    label: '音频格式',
    type: 'select',
    default: 'mp3',
    options: [
      { value: 'mp3', label: 'MP3' },
      { value: 'wav', label: 'WAV' },
      { value: 'flac', label: 'FLAC' },
      { value: 'pcm', label: 'PCM' }
    ],
    description: '输出音频格式'
  },
  {
    key: 'sampleRate',
    label: '采样率',
    type: 'select',
    default: 32000,
    options: [
      { value: 8000, label: '8000 Hz' },
      { value: 16000, label: '16000 Hz' },
      { value: 22050, label: '22050 Hz' },
      { value: 24000, label: '24000 Hz' },
      { value: 32000, label: '32000 Hz' },
      { value: 44100, label: '44100 Hz' }
    ],
    description: '音频采样率'
  },
  {
    key: 'emotion',
    label: '情感控制',
    type: 'select',
    default: '',
    options: [
      { value: '', label: '自动' },
      { value: 'happy', label: '开心' },
      { value: 'sad', label: '悲伤' },
      { value: 'angry', label: '愤怒' },
      { value: 'fearful', label: '恐惧' },
      { value: 'disgusted', label: '厌恶' },
      { value: 'surprised', label: '惊讶' },
      { value: 'calm', label: '平静' },
      { value: 'fluent', label: '流畅 (2.6+)' },
      { value: 'whisper', label: '耳语 (2.6+)' }
    ],
    description: '情感控制，默认自动选择'
  }
]

/** 卡片展示字段 */
export const connectorCardFields: CardDisplayField[] = [
  { source: 'connectorConfig', key: 'model', label: '模型' },
  { source: 'connectorConfig', key: 'voiceId', label: '音色' }
]

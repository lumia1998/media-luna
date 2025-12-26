// Suno AI 连接器配置

import type { ConnectorField, CardDisplayField } from '../../core'

/** Suno 配置字段 */
export const connectorFields: ConnectorField[] = [
  {
    key: 'apiUrl',
    label: 'API URL',
    type: 'text',
    required: true,
    default: 'https://api.goapi.ai/suno/v1/music', // 示例默认值
    placeholder: 'https://api.your-provider.com/suno/v1',
    description: '第三方 Suno API 基础地址'
  },
  {
    key: 'apiKey',
    label: 'API Key',
    type: 'password',
    required: true
  },
  {
    key: 'instrumental',
    label: '纯音乐',
    type: 'boolean',
    default: false,
    description: '是否生成无歌词的纯音乐'
  },
  {
    key: 'tags',
    label: '音乐风格 (Tags)',
    type: 'text',
    placeholder: 'pop, upbeat, electronic',
    description: '音乐风格描述标签'
  },
  {
    key: 'title',
    label: '标题',
    type: 'text',
    placeholder: 'My Song',
    description: '可选：生成歌曲的标题'
  },
  {
    key: 'makeInstrumental',
    label: '延长模式',
    type: 'boolean',
    default: false,
    description: '用于 extend (续写) 模式 (需结合 taskId)'
  },
  {
    key: 'timeout',
    label: '超时时间（秒）',
    type: 'number',
    default: 300
  }
]

/** 卡片展示字段 */
export const connectorCardFields: CardDisplayField[] = [
  { source: 'connectorConfig', key: 'tags', label: '风格' },
  { source: 'connectorConfig', key: 'instrumental', label: '纯音乐', format: 'boolean' }
]

// Chat API 连接器配置

import type { ConnectorField, CardDisplayField } from '../../core'

/** Chat API 配置字段 */
export const connectorFields: ConnectorField[] = [
  {
    key: 'apiUrl',
    label: 'API URL',
    type: 'text',
    required: true,
    default: 'https://api.openai.com/v1',
    placeholder: 'https://api.openai.com/v1',
    description: 'OpenAI 兼容 API 的基础 URL（无需包含 /chat/completions）'
  },
  {
    key: 'apiKey',
    label: 'API Key',
    type: 'password',
    required: true
  },
  {
    key: 'model',
    label: '模型',
    type: 'text',
    required: true,
    default: 'gpt-4o',
    placeholder: 'gpt-4o',
    description: '模型名称'
  },
  {
    key: 'systemPrompt',
    label: '系统提示词',
    type: 'textarea',
    default: 'You are a helpful assistant that generates images. Please respond with image URLs.',
    description: '系统提示词，用于引导模型生成多媒体内容'
  },
  {
    key: 'extractMode',
    label: '提取模式',
    type: 'select',
    default: 'auto',
    options: [
      { label: '自动检测', value: 'auto' },
      { label: 'URL 提取', value: 'url' },
      { label: 'Markdown 图片', value: 'markdown' },
      { label: 'Base64 图片', value: 'base64' },
      { label: '纯文本返回', value: 'text' }
    ],
    description: '从回复中提取多媒体内容的方式'
  },
  {
    key: 'temperature',
    label: '温度',
    type: 'number',
    default: 0.7,
    description: '生成随机性，0-2 之间'
  },
  {
    key: 'topP',
    label: 'Top P',
    type: 'number',
    default: 1,
    description: '核采样阈值，0-1 之间'
  },
  {
    key: 'presencePenalty',
    label: '存在惩罚',
    type: 'number',
    default: 0,
    description: '存在惩罚，-2.0 到 2.0 之间'
  },
  {
    key: 'frequencyPenalty',
    label: '频率惩罚',
    type: 'number',
    default: 0,
    description: '频率惩罚，-2.0 到 2.0 之间'
  },
  {
    key: 'stream',
    label: '流式响应',
    type: 'boolean',
    default: false,
    description: '是否启用流式传输'
  },
  {
    key: 'maxTokens',
    label: '最大 Token 数',
    type: 'number',
    default: 40960,
    description: '回复的最大 token 数量'
  },
  {
    key: 'timeout',
    label: '超时时间（秒）',
    type: 'number',
    default: 600
  }
]

/** 卡片展示字段 */
export const connectorCardFields: CardDisplayField[] = [
  { source: 'connectorConfig', key: 'model', label: '模型' }
]

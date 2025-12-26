// Stability AI 连接器配置

import type { ConnectorField, CardDisplayField } from '../../core'

/** Stability AI 配置字段 */
export const connectorFields: ConnectorField[] = [
  {
    key: 'apiKey',
    label: 'API Key',
    type: 'password',
    required: true,
    description: 'Stability AI API Key (sk-...)'
  },
  {
    key: 'model',
    label: '模型',
    type: 'text',
    required: true,
    placeholder: 'sd3-large',
    description: 'sd3-large, sd3-large-turbo, sd3-medium, core'
  },
  {
    key: 'aspectRatio',
    label: '宽高比',
    type: 'select',
    options: [
      { label: '1:1', value: '1:1' },
      { label: '16:9', value: '16:9' },
      { label: '21:9', value: '21:9' },
      { label: '2:3', value: '2:3' },
      { label: '3:2', value: '3:2' },
      { label: '4:5', value: '4:5' },
      { label: '5:4', value: '5:4' },
      { label: '9:16', value: '9:16' },
      { label: '9:21', value: '9:21' }
    ],
    description: '生成图像的宽高比'
  },
  {
    key: 'negativePrompt',
    label: '负面提示词',
    type: 'textarea',
    description: '仅部分模型支持 (如 sd3-large, core)'
  },
  {
    key: 'seed',
    label: '种子',
    type: 'number',
    description: '0 为随机'
  },
  {
    key: 'outputFormat',
    label: '输出格式',
    type: 'select',
    options: [
      { label: 'PNG', value: 'png' },
      { label: 'JPEG', value: 'jpeg' }
    ]
  },
  {
    key: 'timeout',
    label: '超时时间（秒）',
    type: 'number',
    default: 60
  }
]

/** 卡片展示字段 */
export const connectorCardFields: CardDisplayField[] = [
  { source: 'connectorConfig', key: 'model', label: '模型' },
  { source: 'connectorConfig', key: 'aspectRatio', label: '比例' }
]

// Stable Diffusion WebUI 连接器配置

import type { ConnectorField, CardDisplayField } from '../../core'

/** SD WebUI 配置字段 */
export const connectorFields: ConnectorField[] = [
  {
    key: 'apiUrl',
    label: 'API URL',
    type: 'text',
    required: true,
    default: 'http://127.0.0.1:7860',
    placeholder: 'http://127.0.0.1:7860'
  },
  {
    key: 'model',
    label: '模型',
    type: 'text',
    placeholder: '留空使用当前加载的模型'
  },
  {
    key: 'sampler',
    label: '采样器',
    type: 'text',
    placeholder: 'Euler a',
    description: '常用：Euler a、DPM++ 2M Karras、DPM++ SDE Karras、DDIM'
  },
  {
    key: 'steps',
    label: '步数',
    type: 'number'
  },
  {
    key: 'cfgScale',
    label: 'CFG Scale',
    type: 'number'
  },
  {
    key: 'width',
    label: '宽度',
    type: 'number'
  },
  {
    key: 'height',
    label: '高度',
    type: 'number'
  },
  {
    key: 'negativePrompt',
    label: '负面提示词',
    type: 'textarea'
  },
  {
    key: 'batchSize',
    label: '批量大小',
    type: 'number'
  },
  {
    key: 'seed',
    label: '种子',
    type: 'number',
    placeholder: '-1 为随机'
  },
  {
    key: 'denoisingStrength',
    label: '去噪强度 (img2img)',
    type: 'number'
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
  { source: 'connectorConfig', key: 'model', label: '模型' },
  { source: 'connectorConfig', key: 'width', label: '宽' },
  { source: 'connectorConfig', key: 'height', label: '高' },
  { source: 'connectorConfig', key: 'sampler', label: '采样器' }
]

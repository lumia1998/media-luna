// Midjourney 连接器配置

import type { ConnectorField, CardDisplayField } from '../../core'

/** Midjourney 配置字段 */
export const connectorFields: ConnectorField[] = [
  {
    key: 'apiUrl',
    label: 'API URL',
    type: 'text',
    required: true,
    default: 'https://api.midjourneyapi.xyz/mj/v2',
    placeholder: 'https://api.midjourneyapi.xyz/mj/v2',
    description: 'MJ Proxy 服务的基础地址'
  },
  {
    key: 'apiKey',
    label: 'API Key',
    type: 'password',
    required: true,
    description: 'Proxy 服务商提供的 API Key'
  },
  {
    key: 'webhookUrl',
    label: 'Webhook 回调地址',
    type: 'text',
    placeholder: 'https://your-domain.com/mj-webhook',
    description: '可选：用于接收任务完成通知（若服务商支持且您配置了公网回调）'
  },
  {
    key: 'aspectRatio',
    label: '默认宽高比 (--ar)',
    type: 'text',
    description: '默认宽高比，如 16:9, 9:16, 2:3'
  },
  {
    key: 'mode',
    label: '模式',
    type: 'select',
    options: [
      { label: 'Fast (快速)', value: 'fast' },
      { label: 'Relax (慢速)', value: 'relax' },
      { label: 'Turbo (极速)', value: 'turbo' }
    ]
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
  { source: 'connectorConfig', key: 'mode', label: '模式' },
  { source: 'connectorConfig', key: 'aspectRatio', label: '比例' }
]

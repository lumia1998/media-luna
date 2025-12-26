// Runway 连接器配置

import type { ConnectorField, CardDisplayField } from '../../core'

/** Runway 配置字段 */
export const connectorFields: ConnectorField[] = [
  {
    key: 'apiUrl',
    label: 'API URL',
    type: 'text',
    required: true,
    default: 'https://api.runwayml.com/v1', // 示意地址
    placeholder: 'https://api.your-provider.com/runway',
    description: 'Runway API 基础地址'
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
    placeholder: 'gen-3-alpha, gen-2',
    description: '模型名称'
  },
  {
    key: 'duration',
    label: '时长 (秒)',
    type: 'select',
    options: [
      { label: '5 秒', value: '5' },
      { label: '10 秒', value: '10' }
    ],
    description: '生成视频的时长'
  },
  {
    key: 'aspectRatio',
    label: '宽高比',
    type: 'select',
    options: [
      { label: '16:9', value: '16:9' },
      { label: '9:16', value: '9:16' }
    ]
  },
  {
    key: 'seed',
    label: '种子',
    type: 'number',
    placeholder: '留空随机'
  },
  {
    key: 'timeout',
    label: '超时时间（秒）',
    type: 'number',
    default: 600 // 视频生成很慢
  }
]

/** 卡片展示字段 */
export const connectorCardFields: CardDisplayField[] = [
  { source: 'connectorConfig', key: 'model', label: '模型' },
  { source: 'connectorConfig', key: 'duration', label: '时长' }
]

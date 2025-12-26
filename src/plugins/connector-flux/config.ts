// Flux 连接器配置

import type { ConnectorField, CardDisplayField } from '../../core'

/** Flux 配置字段 */
export const connectorFields: ConnectorField[] = [
  {
    key: 'apiUrl',
    label: 'API URL',
    type: 'text',
    required: true,
    default: 'https://api.replicate.com/v1/predictions',
    placeholder: 'https://api.replicate.com/v1/predictions'
  },
  {
    key: 'apiKey',
    label: 'API Key',
    type: 'password',
    required: true
  },
  {
    key: 'model',
    label: '模型版本',
    type: 'text',
    required: true,
    default: 'flux-schnell',
    placeholder: 'flux-schnell',
    description: '常用：flux-schnell、flux-dev、flux-pro、flux-1.1-pro'
  },
  {
    key: 'aspectRatio',
    label: '宽高比',
    type: 'text',
    description: '常用：1:1、16:9、9:16、4:3、3:4、21:9'
  },
  {
    key: 'outputFormat',
    label: '输出格式',
    type: 'text',
    description: '支持：webp、png、jpg'
  },
  {
    key: 'outputQuality',
    label: '输出质量',
    type: 'number'
  },
  {
    key: 'numOutputs',
    label: '生成数量',
    type: 'number'
  },
  {
    key: 'seed',
    label: '种子',
    type: 'number',
    placeholder: '留空随机'
  },
  {
    key: 'guidanceScale',
    label: 'Guidance Scale',
    type: 'number'
  },
  {
    key: 'numInferenceSteps',
    label: '推理步数',
    type: 'number'
  },
  {
    key: 'disableSafetyChecker',
    label: '禁用安全检查',
    type: 'boolean'
  },
  {
    key: 'timeout',
    label: '超时时间（秒）',
    type: 'number',
    default: 600
  },
  {
    key: 'pollInterval',
    label: '轮询间隔（毫秒）',
    type: 'number',
    default: 2000
  }
]

/** 卡片展示字段 */
export const connectorCardFields: CardDisplayField[] = [
  { source: 'connectorConfig', key: 'model', label: '模型' },
  { source: 'connectorConfig', key: 'aspectRatio', label: '宽高比' }
]

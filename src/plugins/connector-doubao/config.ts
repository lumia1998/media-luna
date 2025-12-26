// 豆包/火山引擎 Seedream 连接器配置

import type { ConnectorField, CardDisplayField } from '../../core'

/** 豆包配置字段 */
export const connectorFields: ConnectorField[] = [
  {
    key: 'apiUrl',
    label: 'API URL',
    type: 'text',
    required: true,
    default: 'https://api.volcengine.com/v1/images/generations',
    placeholder: 'https://api.volcengine.com/v1/images/generations'
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
    default: 'Doubao-Seedream-4.5',
    placeholder: 'Doubao-Seedream-4.5',
    description: '模型名称，如 Doubao-Seedream-4.5'
  },
  {
    key: 'size',
    label: '图片尺寸',
    type: 'text',
    description: '分辨率模式：2K、4K；或具体尺寸如 2048x2048、2560x1440'
  },
  {
    key: 'scale',
    label: '文本影响程度',
    type: 'number',
    description: '文本描述影响程度，值越大文本影响越大、图片影响越小。范围 0-1'
  },
  {
    key: 'forceSingle',
    label: '强制单图',
    type: 'boolean',
    default: false,
    description: '是否强制生成单图，可减少延迟和成本'
  },
  {
    key: 'optimizePromptMode',
    label: '提示词优化模式',
    type: 'text',
    description: 'standard（标准，质量高但慢）或 fast（快速）'
  },
  {
    key: 'enableImageBase64',
    label: '返回 Base64',
    type: 'boolean',
    default: false,
    description: '是否在响应中返回图像的 Base64 编码'
  },
  {
    key: 'enableImageOriginData',
    label: '返回原始数据',
    type: 'boolean',
    default: true,
    description: '是否在响应中包含原始响应数据'
  },
  {
    key: 'enableImageInput',
    label: '允许图片输入',
    type: 'boolean',
    default: true,
    description: '是否允许发送参考图片用于图生图'
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
  { source: 'connectorConfig', key: 'size', label: '尺寸', format: 'size' }
]

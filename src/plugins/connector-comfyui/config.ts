// ComfyUI 连接器配置

import type { ConnectorField, CardDisplayField } from '../../core'

/** ComfyUI 配置字段 */
export const connectorFields: ConnectorField[] = [
  {
    key: 'apiUrl',
    label: 'API URL',
    type: 'text',
    required: true,
    default: 'http://127.0.0.1:8188',
    placeholder: 'http://127.0.0.1:8188',
    description: 'ComfyUI 服务地址'
  },
  {
    key: 'workflow',
    label: '默认工作流 (JSON)',
    type: 'textarea',
    description: '默认的 workflow_api.json 内容 (必须包含 KSampler 和 SaveImage 节点)',
    default: ''
  },
  {
    key: 'promptNodeId',
    label: 'Prompt 节点 ID',
    type: 'text',
    default: '6', // 默认 workflow 通常是 6
    description: '输入正向提示词的 CLIPTextEncode 节点 ID'
  },
  {
    key: 'seedNodeId',
    label: 'Seed 节点 ID',
    type: 'text',
    default: '3', // 默认 workflow KSampler 通常是 3
    description: 'KSampler 节点 ID (用于设置随机种子)'
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
  { source: 'connectorConfig', key: 'apiUrl', label: '节点' }
]

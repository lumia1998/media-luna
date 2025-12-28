// Vits 插件配置

import type { ConfigField } from '../../types'

/** Vits 插件配置 */
export interface VitsPluginConfig {
  /** 是否注册为 Koishi vits 服务 */
  registerVitsService: boolean
}

/** 默认配置 */
export const defaultVitsConfig: VitsPluginConfig = {
  registerVitsService: true
}

/** 配置字段定义 */
export const vitsConfigFields: ConfigField[] = [
  {
    key: 'registerVitsService',
    label: '注册 vits 服务',
    type: 'boolean',
    default: true,
    description: '将 text2audio 渠道注册为 Koishi vits 服务，供其他插件调用。未指定 speaker_id 时自动使用第一个可用的渠道。'
  }
]

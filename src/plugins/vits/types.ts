// Vits 插件类型定义

import type { h } from 'koishi'

/** Speaker 信息 */
export interface VitsSpeaker {
  /** Speaker ID（唯一标识） */
  id: number
  /** Speaker 名称 */
  name: string
  /** 来源渠道 ID */
  channelId: number
}

/** Vits say 接口参数 */
export interface VitsSayOptions {
  /** 输入文本 */
  input: string
  /** Speaker ID */
  speaker_id: number
  /** 可选的 session（用于传递上下文） */
  session?: any
}

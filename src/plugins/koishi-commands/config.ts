// Koishi 指令配置

import type { ConfigField } from '../../types'

/** Koishi 指令插件配置 */
export interface KoishiCommandsConfig {
  /** 是否启用指令注册 */
  enabled: boolean
  /** 预设列表指令名称 */
  presetsCommand: string
  /** 预设详情指令名称 */
  presetCommand: string
  /** 模型列表指令名称 */
  modelsCommand: string
  /** 我的画图记录指令名称 */
  myTasksCommand: string
  /** 任务详情指令名称 */
  taskDetailCommand: string
  /** 我的记录默认显示数量 */
  myTasksDefaultCount: number
  /** 收集模式超时时间（秒） */
  collectTimeout: number
  /** 直接触发所需的最小图片数量 */
  directTriggerImageCount: number
}

/** 默认配置 */
export const defaultKoishiCommandsConfig: KoishiCommandsConfig = {
  enabled: true,
  presetsCommand: 'presets',
  presetCommand: 'preset',
  modelsCommand: 'models',
  myTasksCommand: 'mytasks',
  taskDetailCommand: 'taskinfo',
  myTasksDefaultCount: 5,
  collectTimeout: 120,
  directTriggerImageCount: 2
}

/** 配置字段定义 */
export const koishiCommandsConfigFields: ConfigField[] = [
  {
    key: 'enabled',
    label: '启用指令',
    type: 'boolean',
    default: true,
    description: '是否启用 Koishi 聊天指令（渠道名.预设名）'
  },
  {
    key: 'presetsCommand',
    label: '预设列表指令',
    type: 'text',
    default: 'presets',
    description: '查看预设列表的指令名称'
  },
  {
    key: 'presetCommand',
    label: '预设详情指令',
    type: 'text',
    default: 'preset',
    description: '查看预设详情的指令名称'
  },
  {
    key: 'modelsCommand',
    label: '模型列表指令',
    type: 'text',
    default: 'models',
    description: '查看可用模型（渠道）列表的指令名称'
  },
  {
    key: 'myTasksCommand',
    label: '我的记录指令',
    type: 'text',
    default: 'mytasks',
    description: '查看自己画图记录的指令名称'
  },
  {
    key: 'taskDetailCommand',
    label: '任务详情指令',
    type: 'text',
    default: 'taskinfo',
    description: '查看任务详细信息的指令名称'
  },
  {
    key: 'myTasksDefaultCount',
    label: '默认显示数量',
    type: 'number',
    default: 5,
    description: '我的记录指令默认显示的任务数量'
  },
  {
    key: 'collectTimeout',
    label: '收集超时（秒）',
    type: 'number',
    default: 120,
    description: '收集模式下等待用户输入的超时时间'
  },
  {
    key: 'directTriggerImageCount',
    label: '直接触发图片数',
    type: 'number',
    default: 2,
    description: '图片数量达到此值时直接触发生成，否则进入收集模式'
  }
]

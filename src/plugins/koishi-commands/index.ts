// Koishi 指令插件入口
// 注册渠道名指令，支持收集模式

import { definePlugin } from '../../core'
import type { PluginContext } from '../../core/types'
import {
  koishiCommandsConfigFields,
  defaultKoishiCommandsConfig,
  type KoishiCommandsConfig
} from './config'
import type { FileData, GenerationResult } from '../../types'
import { h, type Session } from 'koishi'

/** 收集状态 */
interface CollectState {
  files: FileData[]
  processedUrls: Set<string>
  prompts: string[]
  presetName?: string
}

export default definePlugin({
  id: 'koishi-commands',
  name: 'Koishi 指令',
  description: '注册 Koishi 聊天指令，支持预设查询',
  version: '1.0.0',

  configFields: koishiCommandsConfigFields,
  configDefaults: defaultKoishiCommandsConfig,

  async onLoad(pluginCtx) {
    const ctx = pluginCtx.ctx
    const config = pluginCtx.getConfig<KoishiCommandsConfig>()
    const logger = pluginCtx.logger

    // 使用实例级 Map/Array 存储 dispose 函数，而不是模块级变量
    // 这样每次插件重载都会创建新的存储，避免状态残留
    const channelCommandDisposables = new Map<string, () => void>()
    const presetCommandDisposables: Array<() => void> = []

    // 保存 mediaLuna 引用
    let mediaLunaRef: any = null

    // 刷新生成指令的函数
    const refreshGenerateCommands = async () => {
      if (!mediaLunaRef) {
        logger.warn('MediaLuna service not available')
        return
      }

      // 获取当前渠道-预设组合
      const combinations = await mediaLunaRef.getChannelPresetCombinations()
      const currentChannelIds = new Set(combinations.map((c: any) => c.channel.id))

      // 注销已删除或禁用的渠道指令
      for (const [channelId, dispose] of channelCommandDisposables) {
        if (!currentChannelIds.has(channelId)) {
          try {
            dispose()
          } catch (e) {
            // ignore
          }
          channelCommandDisposables.delete(channelId)
          logger.debug(`Unregistered command for channel: ${channelId}`)
        }
      }

      // 注册新渠道或更新已有渠道
      for (const { channel, presets } of combinations) {
        // 如果已注册，先注销
        if (channelCommandDisposables.has(channel.id)) {
          try {
            channelCommandDisposables.get(channel.id)!()
          } catch (e) {
            // ignore
          }
          channelCommandDisposables.delete(channel.id)
        }

        // 检查渠道级配置是否禁用了 koishi-commands
        if (!mediaLunaRef.isPluginEnabledForChannel('koishi-commands', channel)) {
          logger.debug(`Channel ${channel.name}: koishi-commands disabled, skipping`)
          continue
        }

        // 注册渠道指令
        const dispose = registerChannelCommand(ctx, mediaLunaRef, channel, presets, config, logger)
        channelCommandDisposables.set(channel.id, dispose)
      }

      logger.info(`Refreshed generate commands: ${channelCommandDisposables.size} channels`)
    }

    // 注册预设指令的函数
    const registerPresetCommands = () => {
      // /presets [tag] - 查看预设列表
      const presetsCmd = ctx.command(`${config.presetsCommand} [tag:string]`, '查看可用预设')
        .action(async (_: any, tag: string) => {
          const presetService = mediaLunaRef?.presets
          if (!presetService) {
            return '预设服务不可用'
          }

          let presets = await presetService.listEnabled()

          if (tag) {
            presets = presets.filter((p: any) => p.tags.includes(tag))
            if (presets.length === 0) {
              return `没有找到标签为 [${tag}] 的预设`
            }
          }

          if (presets.length === 0) {
            return '没有可用的预设'
          }

          const lines: string[] = []
          lines.push('━━━━━━━━━━━━━━')
          if (tag) {
            lines.push(`📂 标签 [${tag}] 下的预设`)
          } else {
            lines.push('📂 可用预设列表')
          }
          lines.push(`共 ${presets.length} 个预设`)
          lines.push('━━━━━━━━━━━━━━')
          lines.push('')

          for (const preset of presets) {
            if (preset.tags && preset.tags.length > 0) {
              lines.push(`• ${preset.name}  [${preset.tags.join(', ')}]`)
            } else {
              lines.push(`• ${preset.name}`)
            }
          }

          lines.push('')
          lines.push('━━━━━━━━━━━━━━')

          const content = lines.join('\n')

          if (content.length > 500) {
            return `<message forward><message>${content}</message></message>`
          }

          return content
        })

      presetCommandDisposables.push(() => presetsCmd.dispose())

      // /preset <name> - 查看预设详情
      const presetCmd = ctx.command(`${config.presetCommand} <name:string>`, '查看预设详情')
        .action(async ({ session }: { session?: Session }, name: string) => {
          if (!name) {
            return '请指定预设名称'
          }

          const presetService = mediaLunaRef?.presets
          if (!presetService) {
            return '预设服务不可用'
          }

          const preset = await presetService.getByName(name)
          if (!preset) {
            return `未找到预设: ${name}`
          }

          const templateLength = preset.promptTemplate?.length || 0
          const useForward = templateLength > 200

          if (useForward) {
            const forwardMessages: string[] = []

            const basicLines: string[] = []
            basicLines.push('━━━━━━━━━━━━━━')
            basicLines.push(`📋 预设：${preset.name}`)
            basicLines.push('━━━━━━━━━━━━━━')
            if (preset.tags && preset.tags.length > 0) {
              basicLines.push(`🏷️ 标签: ${preset.tags.join(', ')}`)
            }
            if (preset.referenceImages && preset.referenceImages.length > 0) {
              basicLines.push(`🖼️ 参考图: ${preset.referenceImages.length} 张`)
            }
            basicLines.push('━━━━━━━━━━━━━━')
            forwardMessages.push(`<message>${basicLines.join('\n')}</message>`)

            if (preset.thumbnail) {
              forwardMessages.push(`<message><image url="${preset.thumbnail}"/></message>`)
            }

            if (preset.promptTemplate) {
              forwardMessages.push(`<message>📝 Prompt 模板:\n${preset.promptTemplate}</message>`)
            }

            return `<message forward>${forwardMessages.join('')}</message>`
          } else {
            const messages: string[] = []

            if (preset.thumbnail) {
              messages.push(`<image url="${preset.thumbnail}"/>`)
            }

            const lines: string[] = []
            lines.push('━━━━━━━━━━━━━━')
            lines.push(`📋 预设：${preset.name}`)
            lines.push('━━━━━━━━━━━━━━')

            if (preset.tags && preset.tags.length > 0) {
              lines.push(`🏷️ 标签: ${preset.tags.join(', ')}`)
            }

            if (preset.promptTemplate) {
              lines.push(`📝 模板: ${preset.promptTemplate}`)
            }

            if (preset.referenceImages && preset.referenceImages.length > 0) {
              lines.push(`🖼️ 参考图: ${preset.referenceImages.length} 张`)
            }

            lines.push('━━━━━━━━━━━━━━')

            messages.push(lines.join('\n'))

            return messages.join('\n')
          }
        })

      presetCommandDisposables.push(() => presetCmd.dispose())

      // /models - 查看可用模型
      const modelsCmd = ctx.command(`${config.modelsCommand}`, '查看可用模型')
        .action(async () => {
          const channels = await mediaLunaRef.channels.listEnabled()

          if (!channels || channels.length === 0) {
            return '没有可用的模型'
          }

          const lines: string[] = []
          lines.push('可用模型')
          lines.push('')

          for (const channel of channels) {
            let line = `  ${channel.name}`

            if (channel.tags && channel.tags.length > 0) {
              line += `  #${channel.tags.join(' #')}`
            }

            const cost = channel.pluginOverrides?.billing?.cost
            if (cost !== undefined && cost > 0) {
              const currencyLabel = channel.pluginOverrides?.billing?.currencyLabel || '积分'
              line += `  ${cost}${currencyLabel}/次`
            } else if (cost === 0) {
              line += '  免费'
            }

            lines.push(line)
          }

          lines.push('')
          lines.push(`共 ${channels.length} 个模型`)
          lines.push('用法: 模型名 [预设名] 提示词')

          const content = lines.join('\n')

          return `<message forward><message>${content}</message></message>`
        })

      presetCommandDisposables.push(() => modelsCmd.dispose())

      logger.info('Preset query commands registered')
    }

    // 等待 mediaLuna 服务就绪后注册指令
    ctx.on('ready', async () => {
      mediaLunaRef = ctx.mediaLuna
      await refreshGenerateCommands()
      // 预设查询指令使用全局配置
      if (mediaLunaRef.isPluginEnabledForChannel('koishi-commands', null)) {
        registerPresetCommands()
      }
    })

    // 监听渠道变化，动态刷新指令
    ctx.on('mediaLuna/channel-updated' as any, async () => {
      if (!mediaLunaRef) return
      logger.debug('Channel updated, refreshing commands...')
      await refreshGenerateCommands()
    })

    // 清理 - 注销所有指令
    pluginCtx.onDispose(() => {
      logger.debug('Disposing koishi-commands: %d channel commands, %d preset commands',
        channelCommandDisposables.size, presetCommandDisposables.length)

      for (const dispose of channelCommandDisposables.values()) {
        try {
          dispose()
        } catch (e) {
          // ignore
        }
      }
      channelCommandDisposables.clear()

      for (const dispose of presetCommandDisposables) {
        try {
          dispose()
        } catch (e) {
          // ignore
        }
      }
      presetCommandDisposables.length = 0

      logger.debug('koishi-commands disposed')
    })
  }
})

/**
 * 注册单个渠道指令
 */
function registerChannelCommand(
  ctx: any,
  mediaLuna: any,
  channel: any,
  presets: any[],
  config: KoishiCommandsConfig,
  logger: any
): () => void {
  // 构建预设名集合（小写）用于匹配
  const presetNamesLower = new Set(presets.map((p: any) => p.name.toLowerCase()))
  // 保存原始预设名映射
  const presetNameMap = new Map(presets.map((p: any) => [p.name.toLowerCase(), p.name]))

  // 注册渠道指令（使用 rest 参数捕获所有输入）
  const channelCmd = ctx.command(`${channel.name} [...rest:string]`, `${channel.name} 生成`)
    .option('image', '-i <url:string> 输入图片URL')
    .usage(`用法: ${channel.name} [预设名] <提示词>\n可用预设: ${presets.map((p: any) => p.name).join(', ') || '无'}`)
    .action(async ({ session, options }: { session: Session; options: any }) => {
      // 初始化收集状态（预设名稍后解析）
      const state: CollectState = {
        files: [],
        processedUrls: new Set(),
        prompts: [],
        presetName: undefined
      }

      // 创建提取器
      const extractor = new MessageExtractor(ctx, logger, state)

      // 从当前消息提取所有内容（图片、at、引用、文本）
      const messageText = await extractor.extractAll(session)

      // 使用从消息元素中提取的纯文本作为提示词
      // 注意：不使用 rest 参数，因为它可能包含未解析的 HTML 标签（如 <img>）
      // messageText 是通过 h.select(elements, 'text') 正确提取的纯文本内容
      //
      // 重要：session.elements 包含原始完整消息，包括命令名
      // 需要去除开头的命令名（channel.name），只保留命令后的内容
      if (messageText.trim()) {
        let promptText = messageText.trim()
        // 检查是否以命令名开头（不区分大小写）
        const cmdName = channel.name.toLowerCase()
        const promptLower = promptText.toLowerCase()
        if (promptLower.startsWith(cmdName)) {
          // 去除命令名和后面的空格
          promptText = promptText.substring(cmdName.length).trimStart()
        }
        if (promptText) {
          state.prompts.push(promptText)
        }
      }

      // 如果命令行指定了图片 URL，也获取
      if (options?.image) {
        await extractor.fetchImage(options.image, 'input')
      }

      // 判断是否直接触发
      if (state.files.length >= config.directTriggerImageCount) {
        // 图片数量足够，直接生成
        return executeGenerateWithPresetCheck(ctx, session, channel, state, presetNamesLower, presetNameMap, config, mediaLuna)
      }

      // 进入收集模式
      return enterCollectMode(ctx, session, channel, state, presetNamesLower, presetNameMap, config, mediaLuna, logger)
    })

  logger.debug(`Registered command: ${channel.name} (${presets.length} presets available)`)
  return () => channelCmd.dispose()
}

/**
 * 消息内容提取器
 * 统一处理图片、at、引用消息等元素的提取
 */
class MessageExtractor {
  private ctx: any
  private logger: any
  private state: CollectState

  constructor(ctx: any, logger: any, state: CollectState) {
    this.ctx = ctx
    this.logger = logger
    this.state = state
  }

  /**
   * 从 Session 提取所有内容（图片、at、引用、文本）
   */
  async extractAll(session: Session | undefined): Promise<string> {
    if (!session?.elements) return ''

    // 提取媒体内容
    await this.extractMedia(session)

    // 提取文本
    return this.extractText(session.elements)
  }

  /**
   * 从 Session 只提取媒体内容（图片、at、引用），不提取文本
   * 用于第一次提取，因为文本中可能包含预设名需要单独处理
   */
  async extractMedia(session: Session | undefined): Promise<void> {
    if (!session?.elements) return

    // 提取图片
    await this.extractImages(session.elements)

    // 提取 at 用户头像
    await this.extractAtAvatars(session)

    // 提取引用消息中的图片
    await this.extractFromQuote(session.elements)
  }

  /**
   * 从元素数组中提取图片
   */
  async extractImages(elements: any[]): Promise<void> {
    const imageElements = h.select(elements, 'img,image')
    for (const img of imageElements) {
      await this.fetchImage(img.attrs?.src || img.attrs?.url, 'input')
    }
  }

  /**
   * 从 Session 中提取 at 用户的头像
   */
  async extractAtAvatars(session: Session): Promise<void> {
    if (!session.elements) return

    const atElements = h.select(session.elements, 'at')
    for (const at of atElements) {
      const userId = at.attrs?.id
      if (userId && session.bot) {
        try {
          const user = await session.bot.getUser(userId)
          const avatarUrl = user?.avatar
          if (avatarUrl) {
            await this.fetchImage(avatarUrl, `avatar_${userId}`)
            this.logger.debug('Extracted avatar for user %s', userId)
          }
        } catch (e) {
          this.logger.warn('Failed to get user info for %s: %s', userId, e)
        }
      }
    }
  }

  /**
   * 从引用消息中提取图片
   */
  async extractFromQuote(elements: any[]): Promise<void> {
    const quoteElements = h.select(elements, 'quote')
    for (const quote of quoteElements) {
      if (quote.children && quote.children.length > 0) {
        const quoteImages = h.select(quote.children, 'img,image')
        for (const img of quoteImages) {
          await this.fetchImage(img.attrs?.src || img.attrs?.url, 'quote')
        }
      }
    }
  }

  /**
   * 从元素数组中提取文本
   */
  extractText(elements: any[]): string {
    const textElements = h.select(elements, 'text')
    return textElements.map(el => el.attrs?.content || '').join('').trim()
  }

  /**
   * 获取图片并添加到 state
   */
  async fetchImage(url: string | undefined, prefix: string): Promise<boolean> {
    if (!url || this.state.processedUrls.has(url)) return false

    this.state.processedUrls.add(url)
    try {
      const response = await this.ctx.http.get(url, { responseType: 'arraybuffer' })
      const buffer = Buffer.from(response)
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
      this.state.files.push({
        data: arrayBuffer,
        mime: 'image/png',
        filename: `${prefix}_${this.state.files.length}.png`
      })
      return true
    } catch (e) {
      this.logger.warn('Failed to fetch image from %s: %s', prefix, e)
      return false
    }
  }

  /**
   * 添加文本到提示词
   */
  addPrompt(text: string): void {
    if (text && !['开始', 'go', 'start', '取消', 'cancel'].includes(text.toLowerCase())) {
      this.state.prompts.push(text)
    }
  }
}

/**
 * 解析预设名并执行生成
 * 从 prompts 的第一个词判断是否为预设名
 */
async function executeGenerateWithPresetCheck(
  ctx: any,
  session: Session | undefined,
  channel: any,
  state: CollectState,
  presetNamesLower: Set<string>,
  presetNameMap: Map<string, string>,
  config: KoishiCommandsConfig,
  mediaLuna: any
): Promise<string> {
  // 合并所有提示词
  const fullPrompt = state.prompts.join(' ').trim()
  const words = fullPrompt.split(/\s+/)

  let presetName: string | undefined
  let actualPrompt = fullPrompt

  // 检查第一个词是否是预设名
  if (words.length > 0 && words[0]) {
    const firstWord = words[0].toLowerCase()
    if (presetNamesLower.has(firstWord)) {
      presetName = presetNameMap.get(firstWord)
      actualPrompt = words.slice(1).join(' ')
    }
  }

  // 严格标签匹配检查
  if (config.strictTagMatch && presetName) {
    const presetService = mediaLuna?.presets
    if (presetService) {
      const presetData = await presetService.getByName(presetName)
      if (presetData) {
        const channelTags = channel.tags || []
        const presetTags = presetData.tags || []
        const hasMatch = channelTags.length === 0 ||
          presetTags.some((t: string) => channelTags.includes(t))

        if (!hasMatch) {
          await session?.send(`该模型类别不支持预设「${presetName}」，输入"确认"继续，输入其他取消`)
          const confirmInput = await session?.prompt(config.confirmTimeout * 1000)

          if (confirmInput?.trim() !== '确认') {
            return '已取消'
          }
        }
      }
    }
  }

  // 构建生成摘要信息
  const summaryParts: string[] = []
  if (presetName) {
    summaryParts.push(`预设: ${presetName}`)
  } else {
    summaryParts.push('无预设')
  }
  summaryParts.push(`提示词: ${actualPrompt.length} 字`)
  summaryParts.push(`图片: ${state.files.length} 张`)

  const summaryMsg = `开始生成 | ${summaryParts.join(' | ')}`

  // 执行生成
  return executeGenerate(ctx, session, mediaLuna, {
    channelName: channel.name,
    presetName,
    prompt: actualPrompt,
    files: state.files,
    summaryMsg
  })
}

/**
 * 进入收集模式
 * 使用中间件捕获完整消息（包括图片）
 */
async function enterCollectMode(
  ctx: any,
  session: Session | undefined,
  channel: any,
  state: CollectState,
  presetNamesLower: Set<string>,
  presetNameMap: Map<string, string>,
  config: KoishiCommandsConfig,
  mediaLuna: any,
  logger: any
): Promise<string> {
  if (!session) {
    return '会话不可用'
  }

  // 发送收集模式提示
  const hintMsgIds = await session.send(
    `已进入收集模式，请继续发送图片/@用户/文字\n发送「开始」触发生成，发送「取消」退出\n当前已收集: ${state.files.length} 张图片`
  )

  const timeoutMs = config.collectTimeout * 1000
  const extractor = new MessageExtractor(ctx, logger, state)

  // 使用 Promise 来等待收集完成
  return new Promise<string>((resolve) => {
    let disposed = false

    // 超时处理
    const timeoutHandle = setTimeout(async () => {
      if (disposed) return
      disposed = true
      disposeMiddleware()
      await deleteMessages(session, hintMsgIds)
      resolve('收集超时，已取消')
    }, timeoutMs)

    // 注册中间件来捕获消息
    const disposeMiddleware = ctx.middleware(async (sess: Session, next: () => Promise<void>) => {
      // 只处理同一用户、同一频道的消息
      if (disposed) return next()
      if (sess.userId !== session.userId) return next()
      if (sess.channelId !== session.channelId) return next()

      // 提取文本
      const textContent = extractor.extractText(sess.elements || []).toLowerCase()

      // 检查触发词
      if (textContent === '开始' || textContent === 'go' || textContent === 'start') {
        if (disposed) return
        disposed = true
        clearTimeout(timeoutHandle)
        disposeMiddleware()
        await deleteMessages(session, hintMsgIds)

        // 检查是否有内容可生成
        if (state.files.length === 0 && state.prompts.length === 0) {
          resolve('没有可生成的内容')
          return
        }

        // 开始生成（带预设检查）
        const result = await executeGenerateWithPresetCheck(
          ctx, session, channel, state,
          presetNamesLower, presetNameMap, config, mediaLuna
        )
        resolve(result)
        return
      }

      if (textContent === '取消' || textContent === 'cancel') {
        if (disposed) return
        disposed = true
        clearTimeout(timeoutHandle)
        disposeMiddleware()
        await deleteMessages(session, hintMsgIds)
        resolve('已取消')
        return
      }

      // 从消息中提取所有内容
      const text = await extractor.extractAll(sess)
      extractor.addPrompt(text)

      // 不传递给下一个中间件，阻止其他指令处理
    }, true) // true 表示优先级高
  })
}

/**
 * 删除消息
 */
async function deleteMessages(session: Session, msgIds: string[]): Promise<void> {
  if (!msgIds || msgIds.length === 0) return

  for (const msgId of msgIds) {
    try {
      await session.bot?.deleteMessage(session.channelId!, msgId)
    } catch (e) {
      // 忽略删除失败（可能没有权限或消息已删除）
    }
  }
}

/**
 * 执行生成请求
 */
async function executeGenerate(
  ctx: any,
  session: Session | undefined,
  mediaLuna: any,
  options: {
    channelName: string
    presetName?: string
    prompt: string
    files: FileData[]
    summaryMsg?: string
  }
): Promise<string> {
  const logger = ctx.logger('media-luna/commands')

  // 获取用户 ID
  const uid = (session as any)?.user?.id

  // 用于存储"正在生成中"消息的 ID，以便后续撤回
  let generatingMsgIds: string[] | undefined

  try {
    const result: GenerationResult = await mediaLuna.generateByName({
      channelName: options.channelName,
      presetName: options.presetName,
      prompt: options.prompt,
      files: options.files,
      session,
      uid,
      // prepare 阶段完成后的回调：将 before hints 和状态消息合并发送
      onPrepareComplete: async (beforeHints: string[]) => {
        if (!session) return

        // 构建合并后的状态消息
        const parts: string[] = []

        // 添加 before hints（如预扣费信息）
        if (beforeHints.length > 0) {
          parts.push(beforeHints.join('\n'))
        }

        // 添加摘要信息
        if (options.summaryMsg) {
          parts.push(options.summaryMsg)
        }

        // 添加"正在生成中"
        parts.push('正在生成中...')

        const statusMsg = parts.join('\n')
        generatingMsgIds = await session.send(statusMsg)
      }
    })

    // 如果没有触发 onPrepareComplete（如 prepare 阶段抛出异常），需要撤回可能的消息
    // 撤销"正在生成中"消息
    if (session && generatingMsgIds) {
      await deleteMessages(session, generatingMsgIds)
    }

    return formatResult(result)
  } catch (error) {
    // 撤销"正在生成中"消息
    if (session && generatingMsgIds) {
      await deleteMessages(session, generatingMsgIds)
    }

    logger.error('Generate failed: %s', error)
    return `生成失败: ${error instanceof Error ? error.message : '未知错误'}`
  }
}

/**
 * 格式化生成结果
 */
function formatResult(result: GenerationResult): string {
  const messages: string[] = []

  // before hints 已通过 onPrepareComplete 回调与状态消息合并发送，不需要再显示

  // 添加生成后提示（来自中间件，如 billing 结算）
  if (result.hints?.after && result.hints.after.length > 0) {
    messages.push(result.hints.after.join('\n'))
  }

  if (!result.success) {
    messages.push(`生成失败: ${result.error || '未知错误'}`)
    return messages.join('\n')
  }

  if (!result.output || result.output.length === 0) {
    messages.push('生成完成，但没有输出')
    return messages.join('\n')
  }

  // 构建输出消息
  for (const asset of result.output) {
    if (asset.kind === 'image' && asset.url) {
      messages.push(`<image url="${asset.url}"/>`)
    } else if (asset.kind === 'audio' && asset.url) {
      messages.push(`<audio url="${asset.url}"/>`)
    } else if (asset.kind === 'video' && asset.url) {
      messages.push(`<video url="${asset.url}"/>`)
    }
  }

  return messages.join('\n')
}

// 导出类型
export type { KoishiCommandsConfig } from './config'

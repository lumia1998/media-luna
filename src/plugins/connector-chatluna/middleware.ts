// ChatLuna 提示词润色中间件
// 使用 ChatLuna 的 LLM 能力来优化和扩展生成提示词

import type {
  MiddlewareDefinition,
  MiddlewareContext,
  MiddlewareRunStatus,
  FileData
} from '../../core'

/** 触发模式 */
export type TriggerMode = 'always' | 'keyword'

/** 中间件配置 */
export interface ChatLunaPromptEnhanceConfig {
  /** 触发模式：always=始终润色，keyword=仅当包含触发词时润色 */
  triggerMode: TriggerMode
  /** 触发词列表（逗号分隔） */
  triggerKeywords: string
  /** 是否移除触发词 */
  removeTriggerKeyword: boolean
  /** ChatLuna 适配器（用于筛选模型） */
  platform: string
  /** ChatLuna 模型（格式: platform/model） */
  model: string
  /** 系统提示词（指导 AI 如何润色） */
  systemPrompt: string
  /** 超时时间（秒） */
  timeout: number
  /** 最大输出 token */
  maxTokens: number
}

/** 默认系统提示词 */
const DEFAULT_SYSTEM_PROMPT = `You are an expert at writing image generation prompts. Your task is to enhance and expand the user's prompt to create a more detailed and effective image generation prompt.

Guidelines:
- Preserve the user's original intent and core concepts
- Add relevant details about composition, lighting, style, and atmosphere
- Use comma-separated tags/descriptors that work well with image generation models
- Keep the output concise but comprehensive
- If reference images are provided, incorporate their visual elements into the prompt
- Output only the enhanced prompt, no explanations or markdown`

/** 默认触发词 */
const DEFAULT_TRIGGER_KEYWORDS = '润色,优化,enhance,polish'

/**
 * 创建 ChatLuna 提示词润色中间件
 */
export function createChatLunaPromptEnhanceMiddleware(): MiddlewareDefinition {
  return {
    name: 'chatluna-prompt-enhance',
    displayName: 'ChatLuna 提示词润色',
    description: '使用 ChatLuna 的 LLM 模型来优化和扩展生成提示词',
    category: 'transform',
    phase: 'lifecycle-pre-request',
    // 在预设处理之后执行，这样可以看到完整的提示词
    after: ['preset'],
    configGroup: 'connector-chatluna',

    async execute(context: MiddlewareContext, next): Promise<MiddlewareRunStatus> {
      // 从插件配置获取 promptEnhance 子配置
      const pluginConfig = await context.getMiddlewareConfig<{ promptEnhance?: ChatLunaPromptEnhanceConfig }>('chatluna-prompt-enhance')
      const config = pluginConfig?.promptEnhance

      // 中间件启用状态由管道控制，这里只检查配置是否存在
      if (!config) {
        return next()
      }

      if (!config.model) {
        context.ctx.logger('media-luna').warn('[ChatLunaPromptEnhance] No model configured')
        return next()
      }

      // 检查触发条件
      let promptToEnhance = context.prompt
      let shouldEnhance = false
      let matchedKeyword: string | null = null

      if (config.triggerMode === 'always') {
        shouldEnhance = true
      } else if (config.triggerMode === 'keyword') {
        // 解析触发词列表
        const keywords = (config.triggerKeywords || DEFAULT_TRIGGER_KEYWORDS)
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0)

        // 检查是否包含任一触发词
        for (const keyword of keywords) {
          if (promptToEnhance.includes(keyword)) {
            shouldEnhance = true
            matchedKeyword = keyword
            break
          }
        }

        // 如果配置了移除触发词
        if (shouldEnhance && matchedKeyword && config.removeTriggerKeyword) {
          promptToEnhance = promptToEnhance.replace(matchedKeyword, '').trim()
        }
      }

      if (!shouldEnhance) {
        return next()
      }

      const chatluna = (context.ctx as any).chatluna
      if (!chatluna) {
        context.ctx.logger('media-luna').warn('[ChatLunaPromptEnhance] ChatLuna service not available')
        return next()
      }

      try {
        const originalPrompt = context.prompt
        const enhancedPrompt = await enhancePrompt(
          context.ctx,
          chatluna,
          config,
          promptToEnhance,
          context.files
        )

        if (enhancedPrompt && enhancedPrompt !== promptToEnhance) {
          context.prompt = enhancedPrompt

          context.setMiddlewareLog('chatluna-prompt-enhance', {
            success: true,
            model: config.model,
            triggerMode: config.triggerMode,
            matchedKeyword,
            originalPrompt,
            promptAfterKeywordRemoval: promptToEnhance !== originalPrompt ? promptToEnhance : undefined,
            enhancedPrompt,
            imageCount: context.files.filter(f => f.mime.startsWith('image/')).length
          })
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e)
        context.ctx.logger('media-luna').warn('[ChatLunaPromptEnhance] Failed to enhance prompt, using original: %s', errorMessage)

        // 记录错误到日志，但继续使用原始提示词
        context.setMiddlewareLog('chatluna-prompt-enhance', {
          success: false,
          skipped: true,
          error: errorMessage,
          model: config.model,
          originalPrompt: context.prompt
        })
      }

      return next()
    }
  }
}

/**
 * 使用 ChatLuna 润色提示词
 */
async function enhancePrompt(
  ctx: any,
  chatluna: any,
  config: ChatLunaPromptEnhanceConfig,
  prompt: string,
  files: FileData[]
): Promise<string> {
  try {
    // 解析 platform/modelName 格式
    const [platform, modelName] = config.model.split('/')
    if (!platform || !modelName) {
      ctx.logger('media-luna').warn('[ChatLunaPromptEnhance] Invalid model format, expected platform/modelName')
      return prompt
    }

    // 使用 createChatModel 创建模型
    const modelRef = await chatluna.createChatModel(platform, modelName)
    const model = (modelRef as any).value || modelRef

    if (!model || typeof model.invoke !== 'function') {
      ctx.logger('media-luna').warn('[ChatLunaPromptEnhance] Failed to create chat model or model.invoke not available')
      return prompt
    }

    // 构建完整的 prompt
    let fullPrompt = config.systemPrompt + '\n\n'

    // 如果有图片，添加提示
    const imageFiles = files.filter(f => f.mime.startsWith('image/'))
    if (imageFiles.length > 0) {
      fullPrompt += `[Note: User provided ${imageFiles.length} reference image(s) for context]\n\n`
    }

    fullPrompt += `Please enhance this image generation prompt:\n\n${prompt}`

    // 调用模型
    const response = await model.invoke(fullPrompt)

    // 提取响应内容
    let result: string
    if (typeof response.content === 'string') {
      result = response.content
    } else if (Array.isArray(response.content)) {
      const textItem = response.content.find((item: any) => item.type === 'text' && item.text)
      result = textItem?.text || String(response.content)
    } else {
      result = String(response.content)
    }

    return result?.trim() || prompt
  } catch (e) {
    ctx.logger('media-luna').error('[ChatLunaPromptEnhance] Chat call failed:', e)
    return prompt
  }
}

/** 中间件配置字段 */
export const promptEnhanceConfigFields = [
  {
    key: 'triggerMode',
    label: '触发模式',
    type: 'select' as const,
    options: [
      { label: '始终润色', value: 'always' },
      { label: '触发词触发', value: 'keyword' }
    ],
    default: 'keyword',
    description: '选择何时触发润色：始终润色每个请求，或仅当包含特定触发词时'
  },
  {
    key: 'triggerKeywords',
    label: '触发词',
    type: 'text' as const,
    default: DEFAULT_TRIGGER_KEYWORDS,
    placeholder: '润色,优化,enhance,polish',
    description: '用逗号分隔的触发词列表，提示词中包含任一词时触发润色',
    showWhen: { field: 'triggerMode', value: 'keyword' }
  },
  {
    key: 'removeTriggerKeyword',
    label: '移除触发词',
    type: 'boolean' as const,
    default: true,
    description: '润色前从提示词中移除匹配的触发词',
    showWhen: { field: 'triggerMode', value: 'keyword' }
  },
  {
    key: 'platform',
    label: '适配器',
    type: 'select-remote' as const,
    optionsSource: 'media-luna/chatluna/platforms',
    placeholder: '可选，用于筛选模型',
    description: '选择 ChatLuna 适配器来筛选模型列表'
  },
  {
    key: 'model',
    label: '模型',
    type: 'select-remote' as const,
    optionsSource: 'media-luna/chatluna/models',
    dependsOn: 'platform',
    placeholder: '选择 ChatLuna 模型',
    description: '用于润色提示词的 LLM 模型（推荐使用支持视觉的模型以便分析参考图）'
  },
  {
    key: 'systemPrompt',
    label: '系统提示词',
    type: 'textarea' as const,
    default: DEFAULT_SYSTEM_PROMPT,
    placeholder: '指导 AI 如何润色提示词...',
    description: '定义 AI 如何优化提示词的指令'
  },
  {
    key: 'timeout',
    label: '超时时间（秒）',
    type: 'number' as const,
    default: 600,
    description: 'LLM 调用超时时间'
  },
  {
    key: 'maxTokens',
    label: '最大输出 Token',
    type: 'number' as const,
    default: 4096,
    description: '限制输出长度'
  }
]

/** 默认配置 */
export const defaultPromptEnhanceConfig: ChatLunaPromptEnhanceConfig = {
  triggerMode: 'keyword',
  triggerKeywords: DEFAULT_TRIGGER_KEYWORDS,
  removeTriggerKeyword: true,
  platform: '',
  model: '',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  timeout: 600,
  maxTokens: 4096
}

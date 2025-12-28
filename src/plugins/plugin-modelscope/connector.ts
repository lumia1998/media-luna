// ModelScope 连接器

import { Context } from 'koishi'
import type { ConnectorDefinition, OutputAsset, FileData, ConnectorRequestLog } from '../../core/types'
import { connectorFields, connectorCardFields } from './config'

/** ModelScope 生成函数 */
async function generate(
  ctx: Context,
  config: Record<string, any>,
  files: FileData[],
  prompt: string
): Promise<OutputAsset[]> {
  const {
    apiUrl = 'https://api-inference.modelscope.cn/',
    apiKey,
    model = 'MusePublic/Qwen-image',
    enableImageInput = false,
    negativePrompt,
    width,
    height,
    numImages,
    steps,
    guidance,
    seed,
    loras,
    timeout = 300,
    pollInterval = 5000
  } = config

  if (!apiKey) {
    throw new Error('ModelScope API Key is required')
  }

  const baseUrl = apiUrl.endsWith('/') ? apiUrl : apiUrl + '/'

  // 构建请求体 - 仅包含 API 支持的参数
  const requestBody: Record<string, any> = {
    model,
    prompt
  }

  // 可选参数 - 仅在有值时添加
  if (negativePrompt) {
    requestBody.negative_prompt = negativePrompt
  }

  // size 参数格式：宽x高
  if (width && height) {
    requestBody.size = `${width}x${height}`
  }

  // n 参数：生成数量
  if (numImages && numImages > 1) {
    requestBody.n = Number(numImages)
  }

  if (seed !== undefined && seed !== null && seed !== '') {
    requestBody.seed = Number(seed)
  }

  // steps 参数：采样步数
  if (steps !== undefined && steps !== null && steps !== '') {
    requestBody.steps = Number(steps)
  }

  // guidance 参数：提示词引导系数
  if (guidance !== undefined && guidance !== null && guidance !== '') {
    requestBody.guidance = Number(guidance)
  }

  // 处理图片输入（如果启用且有图片）
  if (enableImageInput && files.length > 0) {
    // 只取第一张图片作为参考图
    const imageFile = files.find(f => f.mime.startsWith('image/'))
    if (imageFile && imageFile.data) {
      // 将图片数据转为 base64 格式
      const base64 = Buffer.from(imageFile.data).toString('base64')
      requestBody.image = `data:${imageFile.mime};base64,${base64}`
      ctx.logger('media-luna').debug('[ModelScope] Image input enabled, added reference image')
    }
  }

  // 处理 LoRA 配置
  if (loras) {
    try {
      if (typeof loras === 'string') {
        const trimmed = loras.trim()
        if (trimmed.startsWith('{')) {
          // JSON 对象格式
          requestBody.loras = JSON.parse(trimmed)
        } else if (trimmed.startsWith('[')) {
          // JSON 数组格式，转换为对象
          const parsed = JSON.parse(trimmed)
          const loraObj: Record<string, number> = {}
          for (const item of parsed) {
            loraObj[item.lora_id || item.repoId || item] = item.weight ?? 1
          }
          requestBody.loras = loraObj
        } else {
          // 单个 LoRA repo ID
          requestBody.loras = trimmed
        }
      } else if (typeof loras === 'object') {
        requestBody.loras = loras
      }
    } catch (e) {
      ctx.logger('media-luna').warn('[ModelScope] Failed to parse loras config:', e)
    }
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'X-ModelScope-Async-Mode': 'true'
  }

  ctx.logger('media-luna').debug('[ModelScope] Request body: %o', requestBody)

  // 创建任务
  const createResponse = await ctx.http.post(`${baseUrl}v1/images/generations`, requestBody, {
    headers,
    timeout: 30000
  })

  ctx.logger('media-luna').debug('[ModelScope] Create response: %o', createResponse)

  const taskId = createResponse.task_id
  if (!taskId) {
    throw new Error(`No task_id in response: ${JSON.stringify(createResponse)}`)
  }

  // 轮询等待结果
  const startTime = Date.now()
  const timeoutMs = timeout * 1000

  while (Date.now() - startTime < timeoutMs) {
    await new Promise(resolve => setTimeout(resolve, pollInterval))

    const statusResponse = await ctx.http.get(`${baseUrl}v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-ModelScope-Task-Type': 'image_generation'
      },
      timeout: 30000
    })

    ctx.logger('media-luna').debug('[ModelScope] Status response: %o', statusResponse)

    const taskStatus = statusResponse.task_status

    if (taskStatus === 'SUCCEED') {
      const outputImages = statusResponse.output_images || []
      return outputImages.map((url: string) => ({
        kind: 'image' as const,
        url,
        mime: 'image/png',
        meta: { source: 'modelscope', model, taskId }
      }))
    }

    if (taskStatus === 'FAILED') {
      throw new Error(statusResponse.message || 'ModelScope generation failed')
    }
  }

  throw new Error('ModelScope generation timed out')
}

/** ModelScope 连接器定义 */
export const ModelScopeConnector: ConnectorDefinition = {
  id: 'modelscope',
  name: 'ModelScope',
  description: '阿里魔搭社区图像生成 API，支持通义万相等模型',
  icon: 'modelscope',
  supportedTypes: ['image'],
  fields: connectorFields,
  cardFields: connectorCardFields,
  defaultTags: ['text2img', 'img2img'],
  generate,

  /** 获取请求日志 */
  getRequestLog(config, files, prompt): ConnectorRequestLog {
    const {
      apiUrl = 'https://api-inference.modelscope.cn/',
      model = 'MusePublic/Qwen-image',
      enableImageInput = false,
      width,
      height,
      numImages,
      steps,
      guidance,
      seed,
      loras
    } = config

    // 计算实际会发送的图片数量
    const imageCount = enableImageInput
      ? files.filter(f => f.mime?.startsWith('image/')).length
      : 0

    return {
      endpoint: apiUrl?.split('?')[0],
      model,
      prompt,
      fileCount: imageCount,
      parameters: {
        size: width && height ? `${width}x${height}` : undefined,
        n: numImages ? Number(numImages) : undefined,
        steps: steps ? Number(steps) : undefined,
        guidance: guidance ? Number(guidance) : undefined,
        seed: seed !== undefined && seed !== null && seed !== '' ? Number(seed) : undefined,
        loras: loras || undefined,
        imageInput: enableImageInput && imageCount > 0 ? true : undefined
      }
    }
  }
}

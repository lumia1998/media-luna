// S3 工具模块
// S3 兼容存储的上传工具函数（MinIO 兼容实现）

import { createHash, createHmac } from 'crypto'

/** S3 配置接口 */
export interface S3Config {
  endpoint?: string
  region?: string
  accessKeyId?: string
  secretAccessKey?: string
  bucket?: string
  publicBaseUrl?: string
  forcePathStyle?: boolean
  acl?: 'private' | 'public-read'
}

/** 格式化日期为 AWS 格式 (ISO 8601) */
function formatAmzDate(date: Date): string {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

/** 获取日期戳 (YYYYMMDD) */
function getDateStamp(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

/** 计算 SHA256 哈希（十六进制） */
function sha256(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex')
}

/** 计算 HMAC-SHA256 */
function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest()
}

/** 计算 HMAC-SHA256（十六进制输出） */
function hmacSha256Hex(key: Buffer | string, data: string): string {
  return createHmac('sha256', key).update(data, 'utf8').digest('hex')
}

/** 获取 AWS Signature V4 签名密钥 */
function getSigningKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string
): Buffer {
  const kDate = hmacSha256('AWS4' + secretKey, dateStamp)
  const kRegion = hmacSha256(kDate, region)
  const kService = hmacSha256(kRegion, service)
  return hmacSha256(kService, 'aws4_request')
}

/** URI 编码（符合 AWS 规范） */
function uriEncode(str: string, encodeSlash = true): string {
  let result = ''
  for (const char of str) {
    if (
      (char >= 'A' && char <= 'Z') ||
      (char >= 'a' && char <= 'z') ||
      (char >= '0' && char <= '9') ||
      char === '_' ||
      char === '-' ||
      char === '~' ||
      char === '.'
    ) {
      result += char
    } else if (char === '/' && !encodeSlash) {
      result += char
    } else {
      result += '%' + char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')
    }
  }
  return result
}

/** 构建规范请求 */
function buildCanonicalRequest(
  method: string,
  canonicalUri: string,
  canonicalQueryString: string,
  headers: Record<string, string>,
  signedHeaders: string,
  payloadHash: string
): string {
  // 构建规范头部
  const sortedHeaders = Object.keys(headers)
    .map(k => k.toLowerCase())
    .sort()

  const canonicalHeaders = sortedHeaders
    .map(k => `${k}:${headers[k].trim()}\n`)
    .join('')

  return [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n')
}

/** 构建待签名字符串 */
function buildStringToSign(
  algorithm: string,
  amzDate: string,
  credentialScope: string,
  canonicalRequest: string
): string {
  return [
    algorithm,
    amzDate,
    credentialScope,
    sha256(canonicalRequest)
  ].join('\n')
}

/** 构建 Authorization 头 */
function buildAuthorizationHeader(
  algorithm: string,
  accessKeyId: string,
  credentialScope: string,
  signedHeaders: string,
  signature: string
): string {
  return `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}

/**
 * 解析 S3 端点并构建请求 URL
 */
function buildS3Url(
  config: S3Config,
  objectKey: string
): { url: string; host: string; canonicalUri: string } {
  const bucket = config.bucket!
  const region = config.region || 'us-east-1'

  let baseUrl: URL
  if (config.endpoint) {
    // 自定义端点（如 MinIO）
    baseUrl = new URL(config.endpoint)
  } else {
    // AWS S3
    baseUrl = new URL(`https://s3.${region}.amazonaws.com`)
  }

  const hostname = baseUrl.hostname
  const port = baseUrl.port ? `:${baseUrl.port}` : ''
  const protocol = baseUrl.protocol

  // 判断是否使用路径风格
  // MinIO 通常需要路径风格，特别是使用 IP 地址或端口时
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
  const hasPort = !!baseUrl.port
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  const shouldUsePathStyle = config.forcePathStyle || isIpAddress || hasPort || isLocalhost

  let host: string
  let canonicalUri: string
  let url: string

  // 对 object key 进行 URI 编码
  const encodedKey = uriEncode(objectKey, false)

  if (shouldUsePathStyle) {
    // 路径风格: http://host:port/bucket/key
    host = hostname + port
    canonicalUri = `/${bucket}/${encodedKey}`
    url = `${protocol}//${host}${canonicalUri}`
  } else {
    // 虚拟主机风格: http://bucket.host/key
    host = `${bucket}.${hostname}${port}`
    canonicalUri = `/${encodedKey}`
    url = `${protocol}//${host}${canonicalUri}`
  }

  return { url, host, canonicalUri }
}

/**
 * 上传文件到 S3 兼容存储
 */
export async function uploadToS3(
  buffer: Buffer,
  filename: string,
  mime: string,
  config: S3Config
): Promise<{ url: string; key: string }> {
  const bucket = config.bucket
  const region = config.region || 'us-east-1'
  const accessKeyId = config.accessKeyId
  const secretAccessKey = config.secretAccessKey

  if (!bucket) throw new Error('S3 缺少 bucket 配置')
  if (!accessKeyId || !secretAccessKey) throw new Error('S3 需提供访问凭证')

  const objectKey = filename
  const { url, host, canonicalUri } = buildS3Url(config, objectKey)

  // 时间戳
  const now = new Date()
  const amzDate = formatAmzDate(now)
  const dateStamp = getDateStamp(now)

  // 计算 payload 哈希
  const payloadHash = sha256(buffer)

  // 构建请求头
  const headers: Record<string, string> = {
    'Host': host,
    'Content-Length': buffer.length.toString(),
    'Content-Type': mime || 'application/octet-stream',
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate
  }

  // 添加 ACL（如果配置）
  if (config.acl) {
    headers['x-amz-acl'] = config.acl
  }

  // 计算 signed headers（按字母顺序排序的小写头名称）
  const signedHeadersList = Object.keys(headers)
    .map(k => k.toLowerCase())
    .sort()
  const signedHeaders = signedHeadersList.join(';')

  // 构建用于签名的头部对象（小写键）
  const headersForSigning: Record<string, string> = {}
  for (const key of Object.keys(headers)) {
    headersForSigning[key.toLowerCase()] = headers[key]
  }

  // 构建规范请求
  const canonicalRequest = buildCanonicalRequest(
    'PUT',
    canonicalUri,
    '', // 无查询字符串
    headersForSigning,
    signedHeaders,
    payloadHash
  )

  // 构建凭证范围
  const algorithm = 'AWS4-HMAC-SHA256'
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`

  // 构建待签名字符串
  const stringToSign = buildStringToSign(
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequest
  )

  // 计算签名
  const signingKey = getSigningKey(secretAccessKey, dateStamp, region, 's3')
  const signature = hmacSha256Hex(signingKey, stringToSign)

  // 构建 Authorization 头
  const authorization = buildAuthorizationHeader(
    algorithm,
    accessKeyId,
    credentialScope,
    signedHeaders,
    signature
  )

  // 添加 Authorization 到请求头
  headers['Authorization'] = authorization

  // 发送请求
  const response = await fetch(url, {
    method: 'PUT',
    headers: headers,
    body: new Uint8Array(buffer)
  })

  if (!response.ok) {
    // 尝试获取错误详情
    let errorDetail = ''
    try {
      const text = await response.text()
      // 尝试从 XML 中提取错误信息
      const codeMatch = text.match(/<Code>([^<]+)<\/Code>/)
      const msgMatch = text.match(/<Message>([^<]+)<\/Message>/)
      if (codeMatch || msgMatch) {
        errorDetail = ` [${codeMatch?.[1] || ''}] ${msgMatch?.[1] || ''}`
      } else if (text.length < 200) {
        errorDetail = ` ${text}`
      }
    } catch {
      // 忽略解析错误
    }
    throw new Error(`S3 上传失败: ${response.status}${errorDetail}`)
  }

  // 构建公开访问 URL
  const publicUrl = config.publicBaseUrl
    ? `${config.publicBaseUrl.replace(/\/$/, '')}/${uriEncode(objectKey, false)}`
    : url

  return { url: publicUrl, key: objectKey }
}

/**
 * 从 S3 删除文件
 */
export async function deleteFromS3(
  objectKey: string,
  config: S3Config
): Promise<void> {
  const bucket = config.bucket
  const region = config.region || 'us-east-1'
  const accessKeyId = config.accessKeyId
  const secretAccessKey = config.secretAccessKey

  if (!bucket || !accessKeyId || !secretAccessKey) return

  const { url, host, canonicalUri } = buildS3Url(config, objectKey)

  const now = new Date()
  const amzDate = formatAmzDate(now)
  const dateStamp = getDateStamp(now)

  // DELETE 请求没有 body，使用空字符串的哈希
  const payloadHash = sha256('')

  const headers: Record<string, string> = {
    'Host': host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate
  }

  const signedHeadersList = Object.keys(headers)
    .map(k => k.toLowerCase())
    .sort()
  const signedHeaders = signedHeadersList.join(';')

  const headersForSigning: Record<string, string> = {}
  for (const key of Object.keys(headers)) {
    headersForSigning[key.toLowerCase()] = headers[key]
  }

  const canonicalRequest = buildCanonicalRequest(
    'DELETE',
    canonicalUri,
    '',
    headersForSigning,
    signedHeaders,
    payloadHash
  )

  const algorithm = 'AWS4-HMAC-SHA256'
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`

  const stringToSign = buildStringToSign(
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequest
  )

  const signingKey = getSigningKey(secretAccessKey, dateStamp, region, 's3')
  const signature = hmacSha256Hex(signingKey, stringToSign)

  const authorization = buildAuthorizationHeader(
    algorithm,
    accessKeyId,
    credentialScope,
    signedHeaders,
    signature
  )

  headers['Authorization'] = authorization

  await fetch(url, {
    method: 'DELETE',
    headers: headers
  })
}

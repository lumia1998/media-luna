<template>
  <div class="ml-view-container">
    <!-- 工具栏 -->
    <div class="tasks-toolbar">
      <div class="toolbar-left">
        <!-- 时间范围切换 -->
        <div class="btn-group">
          <button
            class="group-btn"
            :class="{ active: timeRange === 'all' }"
            @click="setTimeRange('all')"
          >
            全部
          </button>
          <button
            class="group-btn"
            :class="{ active: timeRange === 'today' }"
            @click="setTimeRange('today')"
          >
            今日
          </button>
        </div>
        <!-- 视图切换 -->
        <div class="btn-group">
          <button
            class="group-btn icon-only"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
            title="列表视图"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <rect x="3" y="4" width="18" height="3" rx="1"/>
              <rect x="3" y="10.5" width="18" height="3" rx="1"/>
              <rect x="3" y="17" width="18" height="3" rx="1"/>
            </svg>
          </button>
          <button
            class="group-btn icon-only"
            :class="{ active: viewMode === 'gallery' }"
            @click="viewMode = 'gallery'"
            title="画廊视图"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <rect x="3" y="3" width="8" height="8" rx="1"/>
              <rect x="13" y="3" width="8" height="8" rx="1"/>
              <rect x="3" y="13" width="8" height="8" rx="1"/>
              <rect x="13" y="13" width="8" height="8" rx="1"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="toolbar-right">
        <button class="toolbar-btn" @click="fetchData">
          <k-icon name="refresh"></k-icon>
          <span>刷新</span>
        </button>
        <button class="toolbar-btn danger" @click="openCleanupDialog">
          <k-icon name="delete"></k-icon>
          <span>清理</span>
        </button>
      </div>
    </div>
    <div class="stats-grid" v-if="stats">
      <div class="stat-card">
        <div class="stat-icon total"><k-icon name="clipboard-list"></k-icon></div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总任务数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success"><k-icon name="check-circle"></k-icon></div>
        <div class="stat-content">
          <div class="stat-value success">{{ stats.byStatus.success }}</div>
          <div class="stat-label">成功</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon failed"><k-icon name="exclamation-triangle"></k-icon></div>
        <div class="stat-content">
          <div class="stat-value failed">{{ stats.byStatus.failed }}</div>
          <div class="stat-label">失败</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon processing"><k-icon name="clock"></k-icon></div>
        <div class="stat-content">
          <div class="stat-value pending">{{ stats.byStatus.pending + stats.byStatus.processing }}</div>
          <div class="stat-label">进行中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rate"><k-icon name="chart-pie"></k-icon></div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.successRate }}</div>
          <div class="stat-label">成功率</div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 (固定) -->
    <div class="filter-bar">
      <div class="filter-group">
        <el-select
          v-model="filter.status"
          placeholder="所有状态"
          clearable
          @change="handleFilterChange"
          style="width: 120px"
        >
          <el-option label="等待中" value="pending"></el-option>
          <el-option label="处理中" value="processing"></el-option>
          <el-option label="成功" value="success"></el-option>
          <el-option label="失败" value="failed"></el-option>
        </el-select>
        <el-select
          v-model="filter.channelId"
          placeholder="所有渠道"
          clearable
          @change="handleFilterChange"
          style="width: 140px"
        >
          <el-option
            v-for="ch in channels"
            :key="ch.id"
            :label="ch.name || `渠道 ${ch.id}`"
            :value="ch.id"
          ></el-option>
        </el-select>
        <el-input
          v-model="filter.uid"
          placeholder="用户 UID"
          clearable
          @keyup.enter="handleFilterChange"
          @clear="handleFilterChange"
          style="width: 120px"
        >
          <template #suffix>
            <span class="filter-search-btn" @click="handleFilterChange" title="搜索">
              <k-icon name="search"></k-icon>
            </span>
          </template>
        </el-input>
      </div>
      <div class="pagination-info" v-if="total > 0">
        共 {{ total }} 条记录
      </div>
    </div>

    <!-- 可滚动的内容区域 -->
    <div class="ml-view-content">
      <!-- 列表视图 -->
      <template v-if="viewMode === 'list'">
        <el-table :data="tasks" style="width: 100%" class="task-table" @row-click="openDetailDialog">
          <el-table-column prop="id" label="ID" width="80" align="center">
            <template #default="{ row }">
              <span class="mono-text">#{{ row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <StatusBadge :status="row.status" />
            </template>
          </el-table-column>

          <el-table-column prop="channelId" label="渠道" width="100" align="center" />

          <el-table-column label="提示词" min-width="300">
            <template #default="{ row }">
              <div class="prompt-cell" :title="getFinalPrompt(row)">{{ getFinalPrompt(row) }}</div>
            </template>
          </el-table-column>

          <el-table-column label="输出" width="120" align="center">
            <template #default="{ row }">
              <span v-if="row.responseSnapshot && row.responseSnapshot.length">
                {{ row.responseSnapshot.length }} 个资产
              </span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>

          <el-table-column label="耗时" width="100" align="right">
            <template #default="{ row }">
              <span v-if="row.duration">{{ formatDuration(row.duration) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column label="时间" width="180" align="right">
            <template #default="{ row }">
              <span class="time-text">{{ formatDate(row.startTime) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="" width="50" align="center">
            <template #default="{ row }">
              <span
                class="delete-btn"
                title="删除"
                @click.stop="confirmDeleteTask(row)"
              >
                <k-icon name="delete"></k-icon>
              </span>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- 画廊视图 (瀑布流) -->
      <template v-else-if="viewMode === 'gallery'">
        <div v-if="galleryItems.length === 0" class="empty-gallery">
          <k-icon name="image" class="empty-icon"></k-icon>
          <p>暂无成功生成的图片</p>
        </div>
        <div v-else class="ml-masonry">
          <div
            v-for="item in galleryItems"
            :key="item.id + '-' + item.assetIndex"
            class="ml-masonry-item"
          >
            <div class="gallery-item" @click="openGalleryDetail(item)">
              <div class="gallery-image-wrapper">
                <img
                  v-if="item.kind === 'image'"
                  :src="item.url"
                  class="gallery-image"
                  loading="lazy"
                  @error="handleImageError"
                />
                <video
                  v-else-if="item.kind === 'video'"
                  :src="item.url"
                  class="gallery-video"
                  muted
                  loop
                  @mouseenter="($event.target as HTMLVideoElement).play()"
                  @mouseleave="($event.target as HTMLVideoElement).pause()"
                />
                <div class="gallery-overlay">
                  <k-icon name="zoom-in" class="zoom-icon"></k-icon>
                </div>
              </div>
              <div class="gallery-info">
                <div class="gallery-prompt" :title="item.prompt">{{ item.prompt }}</div>
                <div class="gallery-meta">
                  <span class="gallery-time">{{ formatDate(item.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 分页 (固定在底部) -->
    <div class="pagination-bar">
      <div class="page-size-select">
        <span class="page-size-label">每页</span>
        <el-select v-model="pageSize" size="small" @change="handlePageSizeChange" style="width: 70px">
          <el-option :value="20" label="20" />
          <el-option :value="50" label="50" />
          <el-option :value="100" label="100" />
        </el-select>
        <span class="page-size-label">条</span>
      </div>
      <div class="page-nav">
        <button class="page-btn" :disabled="page <= 1" @click="goToPage(page - 1)">
          <k-icon name="chevron-left"></k-icon>
        </button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page >= totalPages" @click="goToPage(page + 1)">
          <k-icon name="chevron-right"></k-icon>
        </button>
      </div>
      <div class="page-total">共 {{ total }} 条</div>
    </div>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="任务详情"
      width="800px"
    >
      <div v-if="currentTask" class="task-detail">
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="detail-grid">
            <div class="detail-item"><span class="label">ID:</span> {{ currentTask.id }}</div>
            <div class="detail-item"><span class="label">状态:</span> <StatusBadge :status="currentTask.status" /></div>
            <div class="detail-item"><span class="label">渠道 ID:</span> {{ currentTask.channelId }}</div>
            <div class="detail-item"><span class="label">用户 UID:</span> {{ currentTask.uid ?? 'N/A' }}</div>
            <div class="detail-item"><span class="label">创建时间:</span> {{ formatDate(currentTask.startTime) }}</div>
            <div class="detail-item"><span class="label">耗时:</span> {{ formatDuration(currentTask.duration || 0) }}</div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Prompt</h3>
          <div class="code-block">{{ getFinalPrompt(currentTask) }}</div>
        </div>

        <div class="detail-section" v-if="currentTask.responseSnapshot && currentTask.responseSnapshot.length > 0">
          <h3>生成结果 ({{ currentTask.responseSnapshot.length }} 个资产)</h3>
          <div class="output-gallery">
            <div
              v-for="(asset, idx) in currentTask.responseSnapshot"
              :key="idx"
              class="output-item"
            >
              <template v-if="asset.kind === 'image' && asset.url">
                <img :src="asset.url" class="output-image" />
              </template>
              <template v-else-if="asset.kind === 'video' && asset.url">
                <video :src="asset.url" class="output-image" controls />
              </template>
              <template v-else-if="asset.kind === 'audio' && asset.url">
                <audio :src="asset.url" controls style="width: 100%;" />
              </template>
              <template v-else-if="asset.kind === 'text' && asset.content">
                <div class="text-asset">{{ asset.content }}</div>
              </template>
              <template v-else-if="asset.url">
                <a :href="asset.url" target="_blank" class="file-link">
                  <k-icon name="file"></k-icon>
                  {{ asset.meta?.filename || asset.url }}
                </a>
              </template>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="currentTask.middlewareLogs?.request?.error">
          <h3>错误信息</h3>
          <div class="code-block error">{{ currentTask.middlewareLogs.request.error }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 图片预览弹窗 -->
    <ImageLightbox
      v-model:visible="lightboxVisible"
      :task-id="lightboxTaskId"
      :initial-index="lightboxIndex"
    />

    <!-- 清理对话框 -->
    <el-dialog
      v-model="cleanupVisible"
      title="清理旧任务"
      width="400px"
    >
      <div class="cleanup-form">
        <p>清理多少天前的任务？</p>
        <el-input-number v-model="cleanupDays" :min="1" :max="365"></el-input-number>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <k-button @click="cleanupVisible = false">取消</k-button>
          <k-button type="error" @click="confirmCleanup">确认清理</k-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message } from '@koishijs/client'
import { TaskData, ChannelConfig } from '../types'
import { taskApi, channelApi } from '../api'
import StatusBadge from './StatusBadge.vue'
import ImageLightbox from './ImageLightbox.vue'

// 视图模式
const viewMode = ref<'list' | 'gallery'>('list')

// 时间范围
const timeRange = ref<'all' | 'today'>('all')

// 状态
const loading = ref(false)
const tasks = ref<TaskData[]>([])
const stats = ref<any>(null)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

// 筛选
const filter = ref({
  status: '' as string,
  uid: '' as string,
  channelId: undefined as number | undefined
})

// 渠道列表（用于下拉筛选）
const channels = ref<ChannelConfig[]>([])

// 详情
const detailVisible = ref(false)
const currentTask = ref<TaskData | null>(null)

// 画廊详情
const galleryDetailVisible = ref(false)
const currentGalleryItem = ref<GalleryItem | null>(null)

// Lightbox 状态
const lightboxVisible = ref(false)
const lightboxTaskId = ref<number | null>(null)
const lightboxIndex = ref(0)

// 清理
const cleanupVisible = ref(false)
const cleanupDays = ref(30)

// 获取任务的最终提示词
const getFinalPrompt = (task: TaskData): string => {
  return (task.middlewareLogs as any)?.preset?.transformedPrompt
    || task.requestSnapshot?.prompt
    || ''
}

// 画廊项目类型
interface GalleryItem {
  id: number
  assetIndex: number
  kind: 'image' | 'video'
  url: string
  prompt: string
  channelId: number
  createdAt: string
  uid: number | null
}

// 从任务列表提取画廊项目
const galleryItems = computed<GalleryItem[]>(() => {
  const items: GalleryItem[] = []
  for (const task of tasks.value) {
    if (task.status !== 'success' || !task.responseSnapshot) continue

    // 优先使用预设中间件处理后的最终提示词，如果没有则使用原始输入
    const finalPrompt = (task.middlewareLogs as any)?.preset?.transformedPrompt
      || task.requestSnapshot?.prompt
      || ''

    // 从 responseSnapshot 中提取图片/视频 URL
    task.responseSnapshot.forEach((asset, assetIndex) => {
      if ((asset.kind === 'image' || asset.kind === 'video') && asset.url) {
        items.push({
          id: task.id,
          assetIndex,
          kind: asset.kind,
          url: asset.url,
          prompt: finalPrompt,
          channelId: task.channelId,
          createdAt: task.startTime,
          uid: task.uid
        })
      }
    })
  }
  return items
})

// 计算总页数
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(total.value / pageSize.value))
})

// 获取今日开始时间（本地时间 00:00:00）
const getTodayStartDate = (): string => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return today.toISOString()
}

// 设置时间范围
const setTimeRange = (range: 'all' | 'today') => {
  timeRange.value = range
  page.value = 1  // 切换时间范围时重置到第一页
  fetchData()
}

// 筛选变化处理
const handleFilterChange = () => {
  page.value = 1  // 筛选变化时重置到第一页
  fetchData()
}

// 加载渠道列表
const loadChannels = async () => {
  try {
    channels.value = await channelApi.list()
  } catch (e) {
    console.error('Failed to load channels:', e)
  }
}

// 方法
const fetchData = async () => {
  loading.value = true
  try {
    // 构建查询参数，过滤掉空值
    const query: Record<string, any> = {
      limit: pageSize.value,
      offset: (page.value - 1) * pageSize.value
    }

    // 时间范围过滤
    if (timeRange.value === 'today') {
      query.startDate = getTodayStartDate()
    }

    // 只添加有值的筛选条件
    if (filter.value.status) {
      query.status = filter.value.status
    }
    if (filter.value.uid && filter.value.uid.trim()) {
      query.uid = Number(filter.value.uid.trim())
    }
    if (filter.value.channelId !== undefined && filter.value.channelId !== null) {
      query.channelId = filter.value.channelId
    }

    // stats 也需要使用相同的时间范围
    const statsParams: { channelId?: number, startDate?: string } = {}
    if (timeRange.value === 'today') {
      statsParams.startDate = getTodayStartDate()
    }

    const [listRes, statsRes] = await Promise.all([
      taskApi.list(query),
      taskApi.stats(statsParams)
    ])

    tasks.value = listRes.items
    total.value = listRes.total
    stats.value = statsRes
  } catch (e) {
    console.error('Failed to fetch tasks:', e)
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handlePageSizeChange = () => {
  // 改变每页条数时，重置到第一页
  page.value = 1
  fetchData()
}

const goToPage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage
    fetchData()
  }
}

const openDetailDialog = (task: TaskData) => {
  currentTask.value = task
  detailVisible.value = true
}

const openGalleryDetail = (item: GalleryItem) => {
  // 设置 taskId 和当前图片索引，ImageLightbox 会自己获取任务数据
  lightboxTaskId.value = item.id
  lightboxIndex.value = item.assetIndex
  lightboxVisible.value = true

  // 保留旧逻辑用于兼容
  currentGalleryItem.value = item
}

const openCleanupDialog = () => {
  cleanupVisible.value = true
}

const confirmCleanup = async () => {
  try {
    const res = await taskApi.cleanup(cleanupDays.value)
    message.success(`成功清理 ${res.deleted} 条任务`)
    cleanupVisible.value = false
    fetchData()
  } catch (e) {
    message.error('清理失败')
  }
}

// 删除单个任务
const confirmDeleteTask = async (task: TaskData) => {
  if (!confirm(`确定删除任务 #${task.id} 吗？`)) return
  try {
    await taskApi.delete(task.id)
    message.success('删除成功')
    fetchData()
  } catch (e) {
    message.error('删除失败')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  } catch {
    message.error('复制失败')
  }
}

const openInNewTab = (url: string) => {
  window.open(url, '_blank')
}

const getFilename = (item: GalleryItem) => {
  const ext = item.kind === 'video' ? 'mp4' : 'png'
  return `media-luna-${item.id}-${item.assetIndex}.${ext}`
}

onMounted(() => {
  fetchData()
  loadChannels()
})
</script>

<style scoped>
@import '../styles/shared.css';

/* ========== 任务视图特有样式 ========== */

/* 工具栏 */
.tasks-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 按钮组 */
.btn-group {
  display: flex;
  background-color: var(--k-color-bg-2);
  border: 1px solid var(--k-color-border);
  border-radius: 6px;
  padding: 2px;
}

.group-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  border: none;
  background: transparent;
  color: var(--k-color-text-description);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.group-btn.icon-only {
  padding: 5px 8px;
}

.group-btn:hover {
  color: var(--k-color-text);
}

.group-btn.active {
  color: var(--k-color-active);
  background-color: var(--k-card-bg);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

/* 工具栏按钮 */
.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--k-color-border);
  background: var(--k-card-bg);
  color: var(--k-color-text-description);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
  font-size: 13px;
}

.toolbar-btn:hover {
  color: var(--k-color-text);
  border-color: var(--k-color-active);
}

.toolbar-btn.danger:hover {
  color: var(--k-color-error);
  border-color: var(--k-color-error);
}

/* Stats Grid */
.stats-grid {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--k-card-bg);
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  background-color: var(--k-color-bg-2);
  color: var(--k-color-text-description);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

.stat-icon.total { background-color: rgba(var(--k-color-primary-rgb), 0.1); color: var(--k-color-primary); }
.stat-icon.success { background-color: rgba(var(--k-color-success-rgb), 0.1); color: var(--k-color-success); }
.stat-icon.failed { background-color: rgba(var(--k-color-error-rgb), 0.1); color: var(--k-color-error); }
.stat-icon.processing { background-color: rgba(var(--k-color-warning-rgb), 0.1); color: var(--k-color-warning); }
.stat-icon.rate { background-color: rgba(var(--k-color-info-rgb), 0.1); color: var(--k-color-info); }

.stat-content {
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  flex-grow: 1;
  margin-left: 1rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--k-color-text-description);
  margin-top: 0.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--k-color-text);
  line-height: 1;
  letter-spacing: -0.03em;
}

.stat-value.success { color: var(--k-color-success); }
.stat-value.failed { color: var(--k-color-error); }
.stat-value.pending { color: var(--k-color-warning); }

/* Filter Bar */
.filter-bar {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  background-color: var(--k-card-bg);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--k-color-border);
}

.filter-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination-info {
  color: var(--k-color-text-description);
  font-size: 0.9rem;
}

/* 筛选搜索按钮 */
.filter-search-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--k-color-text-description);
  transition: color 0.15s ease;
  padding: 2px;
}

.filter-search-btn:hover {
  color: var(--k-color-active);
}

/* Task Table */
.task-table {
  border: 1px solid var(--k-color-border);
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  --el-table-header-bg-color: var(--k-color-bg-1);
  --el-table-row-hover-bg-color: var(--k-color-bg-2);
  --el-table-border-color: var(--k-color-border);
}

.task-table :deep(.el-table__row) {
  transition: background-color 0.15s ease;
}

.task-table :deep(th.el-table__cell) {
  font-weight: 600;
  color: var(--k-color-text-description);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.mono-text {
  font-family: monospace;
  color: var(--k-color-text-description);
}

/* 删除按钮 */
.delete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: var(--k-color-text-description);
  cursor: pointer;
  transition: all 0.15s ease;
}

.delete-btn:hover {
  color: var(--k-color-error);
  background-color: rgba(var(--k-color-error-rgb, 245, 108, 108), 0.1);
}

.prompt-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--k-color-text);
}

.time-text {
  font-size: 0.85rem;
  color: var(--k-color-text-description);
}

.text-muted {
  color: var(--k-color-text-description);
}

/* Gallery Item */
.gallery-item {
  background: var(--k-card-bg);
  border: 1px solid var(--k-color-border);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gallery-item:hover {
  border-color: var(--k-color-active);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.gallery-image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--k-color-bg-2);
}

.gallery-image,
.gallery-video {
  width: 100%;
  display: block;
  transition: transform 0.3s;
}

.gallery-item:hover .gallery-image,
.gallery-item:hover .gallery-video {
  transform: scale(1.03);
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.zoom-icon {
  font-size: 2rem;
  color: #fff;
  margin-bottom: auto;
  align-self: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s;
}

.gallery-item:hover .zoom-icon {
  opacity: 1;
  transform: scale(1);
}

.gallery-info {
  padding: 0.75rem;
}

.gallery-prompt {
  font-size: 0.85rem;
  color: var(--k-color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.gallery-meta {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--k-color-text-description);
}

.empty-gallery {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--k-color-text-description);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Pagination Bar */
.pagination-bar {
  flex-shrink: 0;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  border-top: 1px solid var(--k-color-border);
  background-color: var(--k-card-bg);
  border-radius: 0 0 8px 8px;
}

.page-size-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-label {
  font-size: 0.85rem;
  color: var(--k-color-text-description);
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--k-color-border);
  border-radius: 6px;
  background-color: var(--k-color-bg-1);
  color: var(--k-color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--k-color-active);
  color: var(--k-color-active);
  background-color: var(--k-color-bg-2);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: var(--k-color-text);
  min-width: 60px;
  text-align: center;
}

.page-total {
  font-size: 0.85rem;
  color: var(--k-color-text-description);
}

/* Detail Modal Styles */
.task-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--k-color-border);
  color: var(--k-color-text);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  background-color: var(--k-color-bg-2);
  padding: 1rem;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-weight: 600;
  color: var(--k-color-text-description);
  flex-shrink: 0;
}

.code-block {
  background-color: var(--k-color-bg-2);
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--k-color-border);
}

.code-block.error {
  background-color: var(--k-color-error-bg);
  color: var(--k-color-error);
  border-color: var(--k-color-error);
}

.output-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.output-item {
  border: 1px solid var(--k-color-border);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--k-color-bg-2);
  transition: transform 0.2s;
}

.output-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.output-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.text-asset {
  padding: 0.75rem;
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 150px;
  overflow-y: auto;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: var(--k-color-active);
  text-decoration: none;
  font-size: 0.85rem;
  word-break: break-all;
}

/* Gallery Detail Dialog */
.gallery-detail-dialog :deep(.el-dialog__header) {
  display: none;
}

.gallery-detail-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.gallery-detail {
  display: flex;
  height: 80vh;
  background: var(--k-card-bg);
  border-radius: 12px;
  overflow: hidden;
}

.gallery-detail-media {
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.gallery-detail-media img,
.gallery-detail-media video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.gallery-detail-sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--k-color-border);
  background: var(--k-card-bg);
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--k-color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--k-color-text);
}

.sidebar-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.sidebar-content:hover {
  scrollbar-color: var(--k-color-border) transparent;
}

.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 3px;
}

.sidebar-content:hover::-webkit-scrollbar-thumb {
  background-color: var(--k-color-border);
}

.info-block {
  margin-bottom: 1.5rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--k-color-text-description);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.info-value {
  color: var(--k-color-text);
  font-size: 0.9rem;
}

.info-value.prompt {
  background: var(--k-color-bg-2);
  padding: 0.75rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--k-color-border);
  display: flex;
  gap: 0.5rem;
}

.download-btn {
  text-decoration: none;
}

/* Cleanup Form */
.cleanup-form {
  text-align: center;
}

.cleanup-form p {
  margin-bottom: 1rem;
  color: var(--k-color-text);
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>

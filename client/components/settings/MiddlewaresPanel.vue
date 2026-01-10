<template>
  <div class="pipeline-panel">
    <!-- 标题区 -->
    <div class="panel-header">
      <div class="header-title">
        <h3>请求执行流程</h3>
        <span class="subtitle">每个生成请求按以下阶段依次处理</span>
      </div>
    </div>

    <!-- 流程图 -->
    <div class="pipeline-flow">
      <div
        v-for="(phase, phaseIndex) in phases"
        :key="phase.id"
        class="phase-section"
      >
        <!-- 阶段标题 -->
        <div class="phase-header pop-card no-hover" :class="phase.colorClass">
          <div class="phase-icon">
            <span>{{ phase.emoji }}</span>
          </div>
          <div class="phase-info">
            <span class="phase-name">{{ phase.label }}</span>
            <span class="phase-desc">{{ phase.description }}</span>
          </div>
          <span class="phase-badge">{{ getPhaseMiddlewares(phase.id).length }}</span>
        </div>

        <!-- 中间件列表 -->
        <div class="phase-middlewares" v-if="getPhaseMiddlewares(phase.id).length > 0">
          <div
            v-for="(mw, index) in getPhaseMiddlewares(phase.id)"
            :key="mw.name"
            class="mw-item"
            :class="{ disabled: !mw.enabled }"
          >
            <div class="mw-card pop-card no-hover">
              <div class="mw-status" :class="{ active: mw.enabled }"></div>
              <div class="mw-content">
                <span class="mw-name">{{ mw.displayName }}</span>
                <span class="mw-desc">{{ mw.description || categoryLabels[mw.category] || mw.category }}</span>
              </div>
              <label class="toggle-switch" @click.stop :title="mw.enabled ? '点击禁用' : '点击启用'">
                <input
                  type="checkbox"
                  :checked="mw.enabled"
                  @change="toggleMiddleware(mw)"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-phase">
          <span>无中间件</span>
        </div>

        <!-- 阶段间连接箭头 -->
        <div v-if="phaseIndex < phases.length - 1" class="phase-connector">
          <div class="connector-line"></div>
          <div class="connector-arrow">⬇️</div>
          <div class="connector-line"></div>
        </div>
      </div>
    </div>

    <!-- 底部说明 -->
    <div class="pipeline-footer pop-card no-hover">
      <div class="footer-item">
        <span class="dot active"></span>
        <span>启用 - 中间件将在请求中执行</span>
      </div>
      <div class="footer-item">
        <span class="dot"></span>
        <span>禁用 - 中间件将被跳过</span>
      </div>
      <p class="footer-hint">同一阶段内的中间件可能并行执行。详细配置请前往「扩展插件」面板。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { middlewareApi } from '../../api'
import type { MiddlewareInfo } from '../../types'

const middlewares = ref<MiddlewareInfo[]>([])

const phases = [
  {
    id: 'lifecycle-prepare',
    label: '准备',
    description: '验证、权限检查、任务创建',
    emoji: '📋',
    colorClass: 'phase-prepare'
  },
  {
    id: 'lifecycle-pre-request',
    label: '预处理',
    description: '预设应用、参数处理',
    emoji: '⚙️',
    colorClass: 'phase-pre'
  },
  {
    id: 'lifecycle-request',
    label: '执行',
    description: '调用连接器生成',
    emoji: '▶️',
    colorClass: 'phase-request'
  },
  {
    id: 'lifecycle-post-request',
    label: '后处理',
    description: '结果缓存、格式转换',
    emoji: '📦',
    colorClass: 'phase-post'
  },
  {
    id: 'lifecycle-finalize',
    label: '完成',
    description: '计费结算、记录保存',
    emoji: '✅',
    colorClass: 'phase-finalize'
  }
]

const categoryLabels: Record<string, string> = {
  billing: '计费模块',
  transform: '转换处理',
  validation: '验证检查',
  preset: '预设系统',
  cache: '缓存管理',
  recording: '任务记录',
  request: '请求执行',
  custom: '自定义'
}

const getPhaseMiddlewares = (phaseId: string) => {
  return middlewares.value.filter(mw => mw.phase === phaseId)
}

const loadMiddlewares = async () => {
  try {
    middlewares.value = await middlewareApi.list()
  } catch (e) {
    alert('加载中间件列表失败')
  }
}

const toggleMiddleware = async (mw: MiddlewareInfo) => {
  const newEnabled = !mw.enabled
  try {
    await middlewareApi.update(mw.name, { enabled: newEnabled })
    mw.enabled = newEnabled
    alert(newEnabled ? '已启用' : '已禁用')
  } catch (e) {
    alert('操作失败')
  }
}

onMounted(loadMiddlewares)
</script>

<style lang="scss">
@use '../../styles/theme.scss';
</style>

<style scoped lang="scss">
.pipeline-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 560px;
  padding: 8px;
}

/* 头部 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--ml-text);
}

.header-title .subtitle {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--ml-text-muted);
}

/* 流程图 */
.pipeline-flow {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.phase-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

/* 阶段头部 */
.phase-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.phase-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--ml-radius);
  font-size: 20px;
  background: var(--ml-cream);
  border: 2px solid var(--ml-border-color);
}

.phase-prepare .phase-icon { background: #dbeafe; }
.phase-pre .phase-icon { background: #ede9fe; }
.phase-request .phase-icon { background: #dcfce7; }
.phase-post .phase-icon { background: #ffedd5; }
.phase-finalize .phase-icon { background: #e0e7ff; }

.phase-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.phase-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--ml-text);
}

.phase-desc {
  font-size: 11px;
  color: var(--ml-text-muted);
}

.phase-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 10px;
  background: var(--ml-primary);
  border: 2px solid var(--ml-border-color);
  border-radius: 14px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ml-text);
}

/* 中间件列表 */
.phase-middlewares {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-left: 24px;
  padding-left: 24px;
  border-left: 3px solid var(--ml-border-color);
}

.mw-item {
  position: relative;
}

.mw-item::before {
  content: '';
  position: absolute;
  left: -25px;
  top: 50%;
  width: 12px;
  height: 3px;
  background: var(--ml-border-color);
}

.mw-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  margin: 6px 0;
}

.mw-item.disabled .mw-card {
  opacity: 0.6;
}

.mw-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ml-text-muted);
  border: 2px solid var(--ml-border-color);
  flex-shrink: 0;
}

.mw-status.active {
  background: var(--ml-success);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}

.mw-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.mw-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ml-text);
}

.mw-desc {
  font-size: 11px;
  color: var(--ml-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 开关 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--ml-cream);
  border: 2px solid var(--ml-border-color);
  border-radius: 24px;
  transition: 0.2s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: var(--ml-text-muted);
  border-radius: 50%;
  transition: 0.2s;
}

.toggle-switch input:checked + .slider {
  background-color: var(--ml-primary);
  border-color: var(--ml-primary-dark);
}

.toggle-switch input:checked + .slider:before {
  transform: translateX(20px);
  background-color: var(--ml-text);
}

/* 空状态 */
.empty-phase {
  margin-left: 24px;
  padding: 12px 24px;
  border-left: 3px dashed var(--ml-border-color);
  color: var(--ml-text-muted);
  font-size: 12px;
  font-style: italic;
}

/* 阶段连接器 */
.phase-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
}

.connector-line {
  width: 3px;
  height: 8px;
  background: var(--ml-border-color);
}

.connector-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 14px;
}

/* 底部说明 */
.pipeline-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--ml-text-muted);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ml-text-muted);
  border: 2px solid var(--ml-border-color);
}

.dot.active {
  background: var(--ml-success);
}

.footer-hint {
  margin: 8px 0 0 0;
  padding-top: 8px;
  border-top: 2px solid var(--ml-border-color);
  font-size: 11px;
  color: var(--ml-text-muted);
}
</style>

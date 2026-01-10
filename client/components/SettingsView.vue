<template>
  <div class="settings-view">
    <!-- 侧边栏导航 -->
    <aside class="sidebar pop-card no-hover">
      <nav class="nav-list">
        <div
          v-for="panel in panels"
          :key="panel.id"
          class="nav-item"
          :class="{ active: activePanel === panel.id }"
          @click="activePanel = panel.id"
        >
          <span class="nav-emoji">{{ getPanelEmoji(panel.icon) }}</span>
          <span>{{ panel.name }}</span>
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <div v-if="loading" class="loading pop-card no-hover">
        <span class="spin">🔄</span>
        加载中...
      </div>

      <template v-else-if="currentPanel">
        <!-- 面板标题 -->
        <header class="panel-header">
          <h2>{{ currentPanel.name }}</h2>
          <p v-if="currentPanel.description">{{ currentPanel.description }}</p>
        </header>

        <!-- 功能模块面板 -->
        <div v-if="currentPanel.component === 'middlewares'" class="panel-content">
          <MiddlewaresPanel />
        </div>

        <!-- 扩展插件面板 -->
        <div v-else-if="currentPanel.component === 'plugins'" class="panel-content">
          <PluginsPanel />
        </div>

        <!-- 自定义面板 -->
        <template v-else-if="currentPanel.type === 'custom' && currentPanel.configFields">
          <div class="custom-panel pop-card no-hover">
            <ConfigRenderer
              :fields="currentPanel.configFields"
              v-model="customConfig"
            />
            <div class="actions">
              <button class="pop-btn primary" @click="saveCustomConfig">
                💾 保存
              </button>
            </div>
          </div>
        </template>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { settingsApi, SettingsPanelInfo } from '../api'
import ConfigRenderer from './ConfigRenderer.vue'
import MiddlewaresPanel from './settings/MiddlewaresPanel.vue'
import PluginsPanel from './settings/PluginsPanel.vue'

// 图标映射
const iconEmojiMap: Record<string, string> = {
  'layers': '🧱',
  'puzzle-piece': '🧩',
  'cog': '⚙️',
  'settings': '⚙️',
  'sliders': '🎚️',
  'paint-brush': '🎨',
  'image': '🖼️',
  'video': '🎬',
  'music': '🎵',
  'folder': '📁',
  'file': '📄',
  'database': '💾',
  'cloud': '☁️',
  'sync': '🔄',
  'refresh': '🔄',
  'default': '📋'
}

const getPanelEmoji = (icon: string) => {
  return iconEmojiMap[icon] || iconEmojiMap['default']
}

// 状态
const loading = ref(true)
const panels = ref<SettingsPanelInfo[]>([])
const activePanel = ref('')
const customConfig = ref<Record<string, any>>({})

// 当前面板
const currentPanel = computed(() =>
  panels.value.find(p => p.id === activePanel.value)
)

// 加载面板列表
const loadPanels = async () => {
  try {
    panels.value = await settingsApi.panels()
    if (panels.value.length && !activePanel.value) {
      activePanel.value = panels.value[0].id
    }
  } catch (e) {
    alert('加载设置面板失败')
  }
}

// 加载自定义面板配置
const loadCustomConfig = () => {
  if (currentPanel.value?.type === 'custom') {
    customConfig.value = { ...(currentPanel.value.config || {}) }
    // 填充默认值
    for (const field of currentPanel.value.configFields || []) {
      if (customConfig.value[field.key] === undefined && field.default !== undefined) {
        customConfig.value[field.key] = field.default
      }
    }
  }
}

// 保存自定义面板配置
const saveCustomConfig = async () => {
  if (!currentPanel.value) return
  try {
    await settingsApi.update(currentPanel.value.id, customConfig.value)
    alert('保存成功')
    await loadPanels()
  } catch (e) {
    alert('保存失败')
  }
}

// 监听面板切换
watch(activePanel, () => {
  if (currentPanel.value?.type === 'custom') {
    loadCustomConfig()
  }
})

onMounted(async () => {
  await loadPanels()
  loading.value = false
})
</script>

<style lang="scss">
@use '../styles/theme.scss';
</style>

<style scoped lang="scss">
/* ============ 视图容器 ============ */
.settings-view {
  display: flex;
  gap: 24px;
  height: 100%;
  min-height: 0;
  overflow: hidden; /* 视图本身不滚动 */
}

/* ============ 侧边栏 ============ */
.sidebar {
  width: 200px;
  flex-shrink: 0;
  padding: 12px;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--ml-radius);
  cursor: pointer;
  color: var(--ml-text-muted);
  font-size: 14px;
  font-weight: 600;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--ml-cream);
  color: var(--ml-text);
  border-color: var(--ml-border-color);
}

.nav-item.active {
  background: var(--ml-primary);
  color: var(--ml-text);
  border-color: var(--ml-border-color);
  box-shadow: var(--ml-shadow-sm);
}

.nav-emoji {
  font-size: 18px;
}

/* ============ 主内容区 ============ */
.main-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 4rem;
  color: var(--ml-text-muted);
  font-weight: 600;
}

.spin {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============ 面板标题 ============ */
.panel-header {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.panel-header h2 {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--ml-text);
  margin: 0 0 8px 0;
}

.panel-header p {
  color: var(--ml-text-muted);
  font-size: 14px;
  margin: 0;
}

/* ============ 面板内容 ============ */
.panel-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  /* 隐藏式滚动条 */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.panel-content:hover {
  scrollbar-color: var(--ml-border-color) transparent;
}

.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 3px;
}

.panel-content:hover::-webkit-scrollbar-thumb {
  background-color: var(--ml-border-color);
}

.custom-panel {
  flex: 1;
  min-height: 0;
  padding: 24px;
  overflow-y: auto;
  /* 隐藏式滚动条 */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.custom-panel:hover {
  scrollbar-color: var(--ml-border-color) transparent;
}

.custom-panel::-webkit-scrollbar {
  width: 6px;
}

.custom-panel::-webkit-scrollbar-track {
  background: transparent;
}

.custom-panel::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 3px;
}

.custom-panel:hover::-webkit-scrollbar-thumb {
  background-color: var(--ml-border-color);
}

.actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 2px solid var(--ml-border-color);
}
</style>

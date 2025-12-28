<template>
  <div class="config-renderer" ref="containerRef">
    <!-- 悬浮快速导航 -->
    <div
      v-if="showNav && visibleFields.length > 3"
      class="quick-nav"
      :class="{ collapsed: !navExpanded }"
    >
      <div class="nav-header" @click="navExpanded = !navExpanded">
        <div class="nav-header-left">
          <k-icon name="compass" class="nav-icon" />
          <span class="nav-title">快速导航</span>
        </div>
        <k-icon :name="navExpanded ? 'chevron-up' : 'chevron-down'" class="toggle-icon" />
      </div>
      <div v-if="navExpanded" class="nav-body">
        <div class="nav-list">
          <div
            v-for="field in visibleFields"
            :key="field.key"
            class="nav-item"
            :class="{ active: activeFieldKey === field.key }"
            @click="scrollToField(field.key)"
          >
            <span class="nav-item-dot"></span>
            <span class="nav-item-text">{{ field.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <template v-for="field in fields" :key="field.key">
      <div
        class="form-row"
        v-if="shouldShowField(field)"
        :ref="el => setFieldRef(field.key, el)"
        :data-field-key="field.key"
      >
        <div class="form-label" :class="{ required: field.required }">
          {{ field.label }}
        </div>
        <div class="field-container">
          <!-- Boolean 类型 -->
          <template v-if="field.type === 'boolean'">
            <el-switch
              :model-value="getFieldValue(field.key)"
              @update:model-value="setFieldValue(field.key, $event)"
            />
          </template>

          <!-- Select 类型 -->
          <template v-else-if="field.type === 'select'">
            <el-select
              :model-value="getFieldValue(field.key)"
              @update:model-value="setFieldValue(field.key, $event)"
              :placeholder="field.placeholder || '请选择'"
              :clearable="clearable"
              style="width: 100%"
            >
              <el-option
                v-for="opt in field.options"
                :key="String(opt.value)"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </template>

          <!-- Select Remote 类型（远程获取选项） -->
          <template v-else-if="field.type === 'select-remote'">
            <el-select
              :model-value="getFieldValue(field.key)"
              @update:model-value="setFieldValue(field.key, $event)"
              :placeholder="field.placeholder || '请选择'"
              :clearable="clearable"
              :loading="isRemoteLoading(field)"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="opt in getRemoteOptions(field)"
                :key="String(opt.value)"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </template>

          <!-- Number 类型 -->
          <template v-else-if="field.type === 'number'">
            <el-input-number
              :model-value="getFieldValue(field.key)"
              @update:model-value="setFieldValue(field.key, $event)"
              :placeholder="field.placeholder"
              :controls="true"
            />
          </template>

          <!-- Textarea 类型 -->
          <template v-else-if="field.type === 'textarea'">
            <el-input
              :model-value="getFieldValue(field.key)"
              @update:model-value="setFieldValue(field.key, $event)"
              type="textarea"
              :rows="4"
              :placeholder="field.placeholder"
            />
          </template>

          <!-- Table 类型（数组对象编辑） -->
          <template v-else-if="field.type === 'table' && field.columns">
            <TableFieldEditor
              :columns="field.columns"
              :model-value="getTableRows(field.key)"
              @update:model-value="setFieldValue(field.key, $event)"
              :table-config="field.tableConfig"
              :presets="getPresets(field.tableConfig?.presetsSource)"
            />
          </template>

          <!-- Password 类型 -->
          <template v-else-if="field.type === 'password'">
            <el-input
              :model-value="getFieldValue(field.key)"
              @update:model-value="setFieldValue(field.key, $event)"
              type="password"
              show-password
              :placeholder="field.placeholder"
            />
          </template>

          <!-- Text/String 类型 (默认) -->
          <template v-else>
            <el-input
              :model-value="getFieldValue(field.key)"
              @update:model-value="setFieldValue(field.key, $event)"
              :placeholder="field.placeholder"
              :clearable="clearable"
            />
          </template>

          <!-- 字段描述 -->
          <div v-if="field.description" class="field-desc">{{ field.description }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import type { ConfigField } from '../types'
import TableFieldEditor from './TableFieldEditor.vue'
import { send } from '@koishijs/client'

interface Props {
  /** 配置字段定义 */
  fields: ConfigField[]
  /** 配置值对象 (v-model) */
  modelValue: Record<string, any>
  /** 是否显示清除按钮 */
  clearable?: boolean
  /** 预设数据源（外部注入） */
  presetsMap?: Record<string, Record<string, any>[]>
  /** 是否显示快速导航 */
  showNav?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  presetsMap: () => ({}),
  showNav: true
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
}>()

// ============ 快速导航 ============
const containerRef = ref<HTMLElement | null>(null)
const navExpanded = ref(true)  // 默认展开
const activeFieldKey = ref('')
const fieldRefs = ref<Record<string, HTMLElement | null>>({})

// 设置字段 DOM 引用
const setFieldRef = (key: string, el: any) => {
  fieldRefs.value[key] = el as HTMLElement | null
}

// 可见字段列表
const visibleFields = computed(() => {
  return props.fields.filter(f => shouldShowField(f))
})

// 滚动到指定字段
const scrollToField = (key: string) => {
  const el = fieldRefs.value[key]
  if (el) {
    // 找到可滚动的父容器（向上查找具有 overflow-y: auto 或 scroll 的元素）
    const findScrollableParent = (element: HTMLElement): HTMLElement | null => {
      let parent = element.parentElement
      while (parent) {
        const style = getComputedStyle(parent)
        const overflowY = style.overflowY
        if (overflowY === 'auto' || overflowY === 'scroll') {
          return parent
        }
        parent = parent.parentElement
      }
      return null
    }

    const scrollParent = findScrollableParent(el)
    if (scrollParent) {
      // 计算元素相对于滚动容器的位置
      const containerRect = scrollParent.getBoundingClientRect()
      const elementRect = el.getBoundingClientRect()
      const relativeTop = elementRect.top - containerRect.top + scrollParent.scrollTop

      // 滚动到元素位置（居中显示）
      const targetScroll = relativeTop - scrollParent.clientHeight / 2 + el.offsetHeight / 2
      scrollParent.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      })
    } else {
      // 回退：如果找不到滚动容器，尝试使用 scrollIntoView
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    activeFieldKey.value = key
    // 高亮效果
    el.classList.add('highlight')
    setTimeout(() => {
      el.classList.remove('highlight')
    }, 1500)
  }
}

// ============ 嵌套 key 辅助函数 ============

// 获取嵌套属性值（支持 'a.b.c' 格式的 key）
const getNestedValue = (obj: Record<string, any>, key: string): any => {
  if (!key.includes('.')) {
    return obj[key]
  }
  const parts = key.split('.')
  let current = obj
  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined
    }
    current = current[part]
  }
  return current
}

// 设置嵌套属性值（支持 'a.b.c' 格式的 key）
const setNestedValue = (obj: Record<string, any>, key: string, value: any): Record<string, any> => {
  if (!key.includes('.')) {
    return { ...obj, [key]: value }
  }

  const parts = key.split('.')
  const result = { ...obj }
  let current = result

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    current[part] = current[part] ? { ...current[part] } : {}
    current = current[part]
  }

  current[parts[parts.length - 1]] = value
  return result
}

// ============ 远程选项缓存 ============
const remoteOptionsCache = ref<Record<string, { label: string; value: any }[]>>({})
const remoteOptionsLoading = ref<Record<string, boolean>>({})

// 构建带参数的缓存 key
const buildCacheKey = (source: string, params?: Record<string, any>) => {
  if (!params || Object.keys(params).length === 0) {
    return source
  }
  const sortedParams = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  return `${source}?${sortedParams}`
}

// 获取远程选项（支持带参数）
const fetchRemoteOptions = async (source: string, params?: Record<string, any>) => {
  const cacheKey = buildCacheKey(source, params)

  if (remoteOptionsCache.value[cacheKey] || remoteOptionsLoading.value[cacheKey]) {
    return
  }

  remoteOptionsLoading.value[cacheKey] = true
  try {
    const result = await send(source, params)
    if (result?.success && Array.isArray(result.data)) {
      remoteOptionsCache.value[cacheKey] = result.data
    } else {
      remoteOptionsCache.value[cacheKey] = []
    }
  } catch (e) {
    console.error(`Failed to fetch options from ${source}:`, e)
    remoteOptionsCache.value[cacheKey] = []
  } finally {
    remoteOptionsLoading.value[cacheKey] = false
  }
}

// 获取字段的参数（基于 dependsOn）
const getFieldParams = (field: ConfigField): Record<string, any> | undefined => {
  if (!field.dependsOn) return undefined
  const dependValue = getNestedValue(props.modelValue, field.dependsOn)
  if (dependValue === undefined || dependValue === null || dependValue === '') {
    return undefined
  }
  // 提取 dependsOn 的最后一段作为参数名（例如 'promptEnhance.platform' -> 'platform'）
  const paramName = field.dependsOn.includes('.')
    ? field.dependsOn.split('.').pop()!
    : field.dependsOn
  return { [paramName]: dependValue }
}

// 获取字段的缓存 key
const getFieldCacheKey = (field: ConfigField): string => {
  if (!field.optionsSource) return ''
  const params = getFieldParams(field)
  return buildCacheKey(field.optionsSource, params)
}

// 获取远程选项（同步访问缓存）
const getRemoteOptions = (field: ConfigField) => {
  const cacheKey = getFieldCacheKey(field)
  if (!cacheKey) return []
  return remoteOptionsCache.value[cacheKey] || []
}

// 检查是否正在加载
const isRemoteLoading = (field: ConfigField) => {
  const cacheKey = getFieldCacheKey(field)
  if (!cacheKey) return false
  return remoteOptionsLoading.value[cacheKey] || false
}

// 加载字段的远程选项
const loadFieldOptions = (field: ConfigField) => {
  if (field.type !== 'select-remote' || !field.optionsSource) return
  const params = getFieldParams(field)
  fetchRemoteOptions(field.optionsSource, params)
}

// 在组件挂载时预加载所有远程选项
onMounted(() => {
  for (const field of props.fields) {
    loadFieldOptions(field)
  }
})

// 监听依赖字段变化，重新加载选项
watch(() => props.modelValue, (newVal, oldVal) => {
  for (const field of props.fields) {
    if (field.type === 'select-remote' && field.dependsOn && field.optionsSource) {
      const newDependValue = getNestedValue(newVal, field.dependsOn)
      const oldDependValue = oldVal ? getNestedValue(oldVal, field.dependsOn) : undefined

      if (newDependValue !== oldDependValue) {
        // 依赖字段变化，重新加载选项
        loadFieldOptions(field)
      }
    }
  }
}, { deep: true })

// 获取字段值（支持默认值 fallback）
const getFieldValue = (key: string) => {
  const value = getNestedValue(props.modelValue, key)
  // 如果值为 undefined 或 null，尝试使用字段定义的默认值
  if (value === undefined || value === null) {
    const field = props.fields.find(f => f.key === key)
    if (field?.default !== undefined) {
      return field.default
    }
  }
  return value
}

// 设置字段值
const setFieldValue = (key: string, value: any) => {
  const newValue = setNestedValue(props.modelValue, key, value)
  emit('update:modelValue', newValue)
}

// 判断字段是否应该显示（基于 showWhen 条件，递归检查依赖链）
const shouldShowField = (field: ConfigField, visited = new Set<string>()): boolean => {
  if (!field.showWhen) return true

  const { field: dependField, value } = field.showWhen

  // 防止循环依赖
  if (visited.has(field.key)) return false
  visited.add(field.key)

  // 检查当前条件（支持嵌套 key）
  if (getNestedValue(props.modelValue, dependField) !== value) return false

  // 递归检查依赖字段的 showWhen 条件
  const dependentField = props.fields.find(f => f.key === dependField)
  if (dependentField) {
    return shouldShowField(dependentField, visited)
  }

  return true
}

// ============ Table 类型支持 ============

// 获取表格行数据
const getTableRows = (key: string): Record<string, any>[] => {
  const value = props.modelValue[key]
  return Array.isArray(value) ? value : []
}

// 获取预设数据
const getPresets = (source?: string): Record<string, any>[] => {
  if (!source) return []
  return props.presetsMap?.[source] || []
}
</script>

<style scoped>
.config-renderer {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
}

.form-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  transition: background-color 0.3s;
  padding: 0.5rem;
  margin: -0.5rem;
  margin-bottom: 0.75rem;
  border-radius: 8px;
}

.form-row.highlight {
  background-color: var(--k-color-active-bg, rgba(64, 158, 255, 0.1));
}

.form-label {
  width: 120px;
  flex-shrink: 0;
  color: var(--k-color-text-description);
  padding-top: 6px;
  font-size: 0.9rem;
}

.form-label.required::after {
  content: '*';
  color: var(--k-color-error, #f56c6c);
  margin-left: 4px;
}

.field-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-desc {
  font-size: 0.8rem;
  color: var(--k-color-text-description);
  margin-top: 0.25rem;
}

/* 快速导航 - 卡片式设计 */
.quick-nav {
  position: fixed;
  right: 24px;
  top: 120px;
  z-index: 100;
  background: var(--k-card-bg, #fff);
  border: 1px solid var(--k-color-border, #e4e7ed);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-width: 180px;
  max-width: 220px;
  overflow: hidden;
  transition: all 0.25s ease;
}

.quick-nav.collapsed {
  min-width: auto;
  max-width: none;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  cursor: pointer;
  background: var(--k-color-bg-2, #f5f7fa);
  border-bottom: 1px solid var(--k-color-border, #e4e7ed);
  transition: background 0.15s;
}

.quick-nav.collapsed .nav-header {
  border-bottom: none;
}

.nav-header:hover {
  background: var(--k-color-fill-light, #ebeef5);
}

.nav-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-icon {
  font-size: 16px;
  color: var(--k-color-active, #409eff);
}

.nav-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--k-color-text, #303133);
  letter-spacing: 0.02em;
}

.toggle-icon {
  font-size: 14px;
  color: var(--k-color-text-description, #909399);
  transition: transform 0.2s;
}

.nav-body {
  max-height: 280px;
  overflow: hidden;
}

.nav-list {
  padding: 8px;
  overflow-y: auto;
  max-height: 264px;
  /* 隐藏式滚动条 */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.nav-list:hover {
  scrollbar-color: var(--k-color-border) transparent;
}

.nav-list::-webkit-scrollbar {
  width: 4px;
}

.nav-list::-webkit-scrollbar-track {
  background: transparent;
}

.nav-list::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 2px;
}

.nav-list:hover::-webkit-scrollbar-thumb {
  background-color: var(--k-color-border);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--k-color-text, #303133);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.nav-item:hover {
  background: var(--k-color-fill-light, #f5f7fa);
  color: var(--k-color-active, #409eff);
}

.nav-item:hover .nav-item-dot {
  background: var(--k-color-active, #409eff);
  transform: scale(1.2);
}

.nav-item.active {
  background: var(--k-color-active-bg, rgba(64, 158, 255, 0.1));
  color: var(--k-color-active, #409eff);
}

.nav-item.active .nav-item-dot {
  background: var(--k-color-active, #409eff);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.nav-item-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--k-color-text-description, #c0c4cc);
  flex-shrink: 0;
  transition: all 0.15s;
}

.nav-item-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

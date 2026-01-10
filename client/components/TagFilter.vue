<template>
  <div class="tag-filter">
    <div class="filter-tags">
      <span
        v-for="tag in availableTags"
        :key="tag"
        class="filter-tag"
        :class="{ active: selectedTags.includes(tag) }"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </span>
    </div>
    <div class="filter-input-wrapper" v-if="showInput">
      <el-input
        v-model="inputValue"
        placeholder="输入标签筛选..."
        size="small"
        clearable
        @keyup.enter="addCustomTag"
        class="filter-input"
      >
        <template #prefix><k-icon name="search"></k-icon></template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  /** v-model 绑定值 */
  modelValue: string[]
  /** 所有可用的标签（从数据中提取） */
  allTags: string[]
  /** 预置的常用标签（始终显示） */
  presetTags?: string[]
  /** 是否显示输入框 */
  showInput?: boolean
  /** 最多显示多少个动态标签 */
  maxDynamicTags?: number
}>(), {
  modelValue: () => [],
  presetTags: () => [],
  showInput: true,
  maxDynamicTags: 20
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'change', value: string[]): void
}>()

const selectedTags = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    emit('change', val)
  }
})

const inputValue = ref('')

// 合并预置标签和动态标签
const availableTags = computed(() => {
  const dynamicTags = props.allTags
    .filter(t => !props.presetTags.includes(t))
    .slice(0, props.maxDynamicTags)

  // 预置标签在前，动态标签在后
  return [...props.presetTags, ...dynamicTags]
})

const toggleTag = (tag: string) => {
  const current = [...selectedTags.value]
  const index = current.indexOf(tag)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(tag)
  }
  selectedTags.value = current
}

const addCustomTag = () => {
  const tag = inputValue.value.trim()
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value = [...selectedTags.value, tag]
  }
  inputValue.value = ''
}
</script>

<style scoped>
/* 标签筛选 - 波普风格 */
.tag-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  padding: 5px 14px;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: var(--ml-radius, 12px);
  border: 2px solid var(--ml-border-color, #451a03);
  background-color: var(--ml-surface, #ffffff);
  color: var(--ml-text-secondary, #92400e);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  box-shadow: 2px 2px 0 var(--ml-border-color, #451a03);
}

.filter-tag:hover {
  border-color: var(--ml-primary, #fbbf24);
  color: var(--ml-text, #451a03);
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 var(--ml-border-color, #451a03);
}

.filter-tag.active {
  background-color: var(--ml-primary, #fbbf24);
  border-color: var(--ml-border-color, #451a03);
  color: var(--ml-text, #451a03);
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--ml-border-color, #451a03);
}

.filter-input-wrapper {
  flex-shrink: 0;
}

.filter-input {
  width: 180px;
}
</style>

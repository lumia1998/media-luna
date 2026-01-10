<template>
  <div class="empty-state" :class="sizeClass">
    <k-icon :name="icon" class="empty-icon" />
    <p class="empty-title" v-if="title">{{ title }}</p>
    <p class="empty-description" v-if="description">{{ description }}</p>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 图标名称 */
  icon?: string
  /** 标题 */
  title?: string
  /** 描述文字 */
  description?: string
  /** 尺寸: small, default, large */
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  title: '',
  description: '',
  size: 'default'
})

const sizeClass = computed(() => `size-${props.size}`)
</script>

<style scoped>
/* 空状态 - 波普风格 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--ml-text-secondary, #92400e);
  text-align: center;
  background: var(--ml-bg-alt, #fef3c7);
  border: 2px dashed var(--ml-border-color, #451a03);
  border-radius: var(--ml-radius, 12px);
}

.empty-state.size-small {
  padding: 1.5rem;
}

.empty-state.size-small .empty-icon {
  font-size: 1.5rem;
}

.empty-state.size-default {
  padding: 3rem;
}

.empty-state.size-default .empty-icon {
  font-size: 2rem;
}

.empty-state.size-large {
  padding: 4rem;
}

.empty-state.size-large .empty-icon {
  font-size: 2.5rem;
}

.empty-icon {
  opacity: 0.6;
  margin-bottom: 4px;
  color: var(--ml-text-muted, #92400e);
}

.empty-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--ml-text, #451a03);
}

.empty-description {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.85;
  max-width: 300px;
  line-height: 1.5;
}
</style>

<template>
  <div class="loading-state" :class="sizeClass">
    <k-icon :name="icon" class="loading-icon" />
    <span v-if="text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 加载提示文字 */
  text?: string
  /** 图标名称 */
  icon?: string
  /** 尺寸: small, default, large */
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  text: '加载中...',
  icon: 'sync',
  size: 'default'
})

const sizeClass = computed(() => `size-${props.size}`)
</script>

<style scoped>
/* 加载状态 - 波普风格 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--ml-text-secondary, #92400e);
  font-weight: 600;
}

.loading-state.size-small {
  padding: 1.5rem;
  gap: 8px;
}

.loading-state.size-small .loading-icon {
  font-size: 1.25rem;
}

.loading-state.size-default {
  padding: 3rem;
}

.loading-state.size-default .loading-icon {
  font-size: 1.5rem;
}

.loading-state.size-large {
  padding: 4rem;
}

.loading-state.size-large .loading-icon {
  font-size: 2rem;
}

.loading-icon {
  animation: spin 1s linear infinite;
  opacity: 0.7;
  color: var(--ml-primary-dark, #d97706);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

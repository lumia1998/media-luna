<template>
  <div class="view-mode-switch">
    <button
      class="mode-btn"
      :class="{ active: modelValue === 'card' }"
      @click="$emit('update:modelValue', 'card')"
      title="卡片视图"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <rect x="3" y="3" width="8" height="8" rx="1"/>
        <rect x="13" y="3" width="8" height="8" rx="1"/>
        <rect x="3" y="13" width="8" height="8" rx="1"/>
        <rect x="13" y="13" width="8" height="8" rx="1"/>
      </svg>
    </button>
    <button
      class="mode-btn"
      :class="{ active: modelValue === 'list' }"
      @click="$emit('update:modelValue', 'list')"
      title="列表视图"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <rect x="3" y="4" width="18" height="3" rx="1"/>
        <rect x="3" y="10.5" width="18" height="3" rx="1"/>
        <rect x="3" y="17" width="18" height="3" rx="1"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
export type ViewMode = 'card' | 'list'

defineProps<{
  modelValue: ViewMode
}>()

defineEmits<{
  (e: 'update:modelValue', value: ViewMode): void
}>()
</script>

<style scoped>
/* 视图切换 - 波普风格 */
.view-mode-switch {
  display: flex;
  gap: 2px;
  background-color: var(--ml-bg-alt, #fef3c7);
  border: 2px solid var(--ml-border-color, #451a03);
  border-radius: var(--ml-radius-sm, 8px);
  padding: 3px;
  box-shadow: 2px 2px 0 var(--ml-border-color, #451a03);
}

.mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--ml-text-secondary, #92400e);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
  font-size: 16px;
}

.mode-btn:hover {
  color: var(--ml-text, #451a03);
  background-color: var(--ml-cream, #fffbeb);
}

.mode-btn.active {
  color: var(--ml-text, #451a03);
  background-color: var(--ml-primary, #fbbf24);
  border: 2px solid var(--ml-border-color, #451a03);
}
</style>

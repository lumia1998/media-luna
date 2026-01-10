<template>
  <span class="status-badge" :class="status">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const label = computed(() => {
  switch (props.status) {
    case 'pending': return '等待中'
    case 'processing': return '处理中'
    case 'success': return '成功'
    case 'failed': return '失败'
    default: return props.status
  }
})
</script>

<style scoped>
/* 状态徽章 - 波普风格 */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--ml-radius-sm, 8px);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.2;
  border: 2px solid var(--ml-border-color, #451a03);
  box-shadow: 1px 1px 0 var(--ml-border-color, #451a03);
}

.status-badge.pending {
  background-color: var(--ml-bg-alt, #fef3c7);
  color: var(--ml-text-secondary, #92400e);
}

.status-badge.processing {
  background-color: var(--ml-primary-light, #fde68a);
  color: var(--ml-primary-dark, #d97706);
}

.status-badge.success {
  background-color: var(--ml-success-bg, #dcfce7);
  color: var(--ml-success, #10b981);
}

.status-badge.failed {
  background-color: var(--ml-error-bg, #fee2e2);
  color: var(--ml-error, #ef4444);
}
</style>
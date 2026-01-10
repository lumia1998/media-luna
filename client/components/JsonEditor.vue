<template>
  <div class="json-editor">
    <el-input
      v-model="internalValue"
      type="textarea"
      :rows="rows"
      class="code-input"
      @blur="validateAndEmit"
    ></el-input>
    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: any,
  rows?: number
}>()

const emit = defineEmits(['update:modelValue'])

const internalValue = ref('')
const error = ref('')

watch(() => props.modelValue, (val) => {
  try {
    internalValue.value = JSON.stringify(val, null, 2)
  } catch (e) {
    internalValue.value = ''
  }
}, { immediate: true })

const validateAndEmit = () => {
  try {
    const parsed = JSON.parse(internalValue.value)
    error.value = ''
    emit('update:modelValue', parsed)
  } catch (e) {
    error.value = 'Invalid JSON format'
  }
}
</script>

<style scoped>
/* JSON 编辑器 - 波普风格 */
.json-editor {
  width: 100%;
}
.code-input :deep(textarea) {
  font-family: monospace;
  font-size: 0.85rem;
  background-color: var(--ml-surface, #ffffff);
  color: var(--ml-text, #451a03);
  line-height: 1.5;
  border-radius: var(--ml-radius-sm, 8px);
  border: 2px solid var(--ml-border-color, #451a03);
}
.error-msg {
  color: var(--ml-error, #ef4444);
  font-size: 0.75rem;
  font-weight: 700;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.error-msg::before {
  content: "⚠";
}
</style>
<template>
  <div class="scroll-container pop-card no-hover">
    <div class="scroll-content ml-scrollbar">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss">
@use '../styles/theme.scss';
</style>

<style scoped>
.scroll-container {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}

.scroll-content {
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
  /* 隐藏式滚动条 */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.scroll-content:hover {
  scrollbar-color: var(--ml-border-color) transparent;
}

.scroll-content::-webkit-scrollbar {
  width: 6px;
}

.scroll-content::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-content::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 3px;
}

.scroll-content:hover::-webkit-scrollbar-thumb {
  background-color: var(--ml-border-color);
}
</style>

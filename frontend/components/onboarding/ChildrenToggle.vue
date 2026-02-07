<template>
  <label
    class="children-toggle"
    :class="{ 'children-toggle--checked': userStore.withChildren }"
  >
    <input
      type="checkbox"
      class="children-toggle__input"
      :checked="userStore.withChildren"
      @change="userStore.toggleChildren()"
    />
    <span class="children-toggle__box" />
    <span class="children-toggle__label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  label: string;
}

defineProps<Props>();

const userStore = useUserStore();
</script>

<style scoped>
.children-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2rem;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.children-toggle:hover {
  background: rgba(255, 255, 255, 0.18);
}

.children-toggle__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.children-toggle__box {
  position: relative;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 0.375rem;
  background: transparent;
  transition: all 0.2s ease;
}

.children-toggle__box::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  background: #10b981;
  border-radius: 0.125rem;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
  transition: all 0.2s ease;
}

.children-toggle--checked .children-toggle__box {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.children-toggle--checked .children-toggle__box::after {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.children-toggle__label {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}
</style>

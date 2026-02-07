<script setup lang="ts">
import type { Category } from '~/types'

interface Props {
  modelValue: Category
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Category]
}>()

const { t } = useI18n()

const categories: Array<{ id: Category; label: string; color: string }> = [
  { id: 'culture', label: t('categories.culture'), color: '#8b5cf6' },
  { id: 'nature', label: t('categories.nature'), color: '#10b981' },
  { id: 'sport', label: t('categories.sport'), color: '#f59e0b' },
  { id: 'history', label: t('categories.history'), color: '#ef4444' },
]

function selectCategory(cat: Category) {
  emit('update:modelValue', cat)
}
</script>

<template>
  <div class="category-filter">
    <button
      v-for="cat in categories"
      :key="cat.id"
      class="category-filter__chip"
      :class="{ 'category-filter__chip--active': modelValue === cat.id }"
      :style="{ '--cat-color': cat.color }"
      @click="selectCategory(cat.id)"
    >
      {{ cat.label }}
    </button>
  </div>
</template>

<style scoped>
.category-filter {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-filter::-webkit-scrollbar {
  display: none;
}

.category-filter__chip {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: #fff;
  border: 1px solid transparent;
  border-radius: 9999px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.category-filter__chip:hover {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.category-filter__chip--active {
  background: var(--cat-color);
  color: #fff;
  border-color: transparent;
}
</style>

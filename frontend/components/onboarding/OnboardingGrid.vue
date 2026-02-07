<template>
  <div class="onboarding-grid">
    <CategoryTile
      v-for="category in categories"
      :key="category.id"
      :category-id="category.id"
      :label="category.label"
      :image="category.image"
      :position="category.position"
      :visible="tilesVisible"
      @select="$emit('select', category.id)"
    />
  </div>
</template>

<script setup lang="ts">
import CategoryTile from "./CategoryTile.vue";

type Category = "culture" | "nature" | "sport" | "history";

interface CategoryItem {
  id: Category;
  label: string;
  image?: string;
  position: "left" | "right";
}

interface Props {
  categories: CategoryItem[];
  tilesVisible: boolean;
}

defineProps<Props>();

defineEmits<{
  select: [categoryId: Category];
}>();
</script>

<style scoped>
.onboarding-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
  max-height: calc(100dvh - 180px);
}

/* Desktop adjustments */
@media (min-width: 768px) {
  .onboarding-grid {
    width: 100%;
    max-width: 1200px;
    max-height: none;
    aspect-ratio: 16 / 9;
    padding: 0;
    gap: 1rem;
  }
}
</style>

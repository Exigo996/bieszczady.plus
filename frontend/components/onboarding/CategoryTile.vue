<template>
  <button
    class="category-tile"
    :class="[
      `category-tile--${position}`,
      { 'category-tile--visible': visible },
    ]"
    :aria-label="label"
    :disabled="!visible"
    @click="$emit('select')"
  >
    <div
      class="category-tile__bg"
      :class="`category-tile__bg--${categoryId}`"
    >
      <img
        v-if="image"
        :src="image"
        alt=""
        loading="eager"
      />
    </div>
    <span class="category-tile__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
type Category = "culture" | "nature" | "sport" | "history";

interface Props {
  categoryId: Category;
  label: string;
  image?: string;
  position: "left" | "right";
  visible: boolean;
}

defineProps<Props>();

defineEmits<{
  select: [];
}>();
</script>

<style scoped>
.category-tile {
  position: relative;
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.4s ease-out,
    opacity 0.4s ease-out;
  opacity: 0;
}

/* Initial positions - off screen */
.category-tile--left {
  transform: translateX(-100vw);
}

.category-tile--right {
  transform: translateX(100vw);
}

/* Visible state - animate in */
.category-tile--visible {
  opacity: 1;
  transform: translateX(0);
}

.category-tile:disabled {
  cursor: default;
}

.category-tile:focus-visible {
  outline: 3px solid #10b981;
  outline-offset: 2px;
}

.category-tile__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* CSS gradient fallbacks for each category */
.category-tile__bg--culture {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.category-tile__bg--nature {
  background: linear-gradient(135deg, #2d5a27 0%, #1a3d18 100%);
}

.category-tile__bg--sport {
  background: linear-gradient(135deg, #c73e1d 0%, #8b2d15 100%);
}

.category-tile__bg--history {
  background: linear-gradient(135deg, #6b4423 0%, #4a2f18 100%);
}

.category-tile__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.6);
  transition: filter 0.3s ease;
}

.category-tile--visible:not(:disabled):hover .category-tile__bg img,
.category-tile--visible:not(:disabled):focus .category-tile__bg img,
.category-tile--visible:not(:disabled):active .category-tile__bg img {
  filter: brightness(0.85);
}

.category-tile__label {
  position: relative;
  z-index: 1;
  font-size: clamp(1.125rem, 4vw, 1.5rem);
  font-weight: 600;
  color: #fff;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.4);
}

/* Touch feedback */
@media (hover: none) {
  .category-tile--visible:not(:disabled):active .category-tile__bg img {
    filter: brightness(0.9);
  }
}

/* Desktop adjustments */
@media (min-width: 768px) {
  .category-tile {
    border-radius: 1.5rem;
  }
}
</style>

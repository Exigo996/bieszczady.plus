<template>
  <div ref="containerRef" class="dropdown">
    <button
      type="button"
      class="dropdown__trigger"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="isOpen = !isOpen"
      @keydown.enter="isOpen = true"
      @keydown.space.prevent="isOpen = true"
      @keydown.esc="isOpen = false"
    >
      <span class="dropdown__current">
        <span v-if="currentItem?.icon" class="dropdown__icon">{{
          currentItem.icon
        }}</span>
        <span class="dropdown__label">{{ currentItem?.label }}</span>
      </span>
      <span class="dropdown__arrow" :class="{ 'dropdown__arrow--open': isOpen }"
        >▼</span
      >
    </button>

    <Transition name="dropdown">
      <ul v-if="isOpen" class="dropdown__menu" :class="`dropdown__menu--${position}`">
        <li v-for="item in items" :key="item.value" class="dropdown__item">
          <button
            type="button"
            class="dropdown__option"
            :class="{ 'dropdown__option--active': item.value === modelValue }"
            @click="select(item.value)"
          >
            <span v-if="item.icon" class="dropdown__icon">{{ item.icon }}</span>
            <span class="dropdown__label">{{ item.label }}</span>
            <span v-if="item.value === modelValue" class="dropdown__check"
              >✓</span
            >
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";

interface DropdownItem {
  value: string;
  label: string;
  icon?: string;
}

interface Props {
  items: DropdownItem[];
  modelValue: string;
  position?: "bottom-right" | "bottom-left";
}

const props = withDefaults(defineProps<Props>(), { position: "bottom-right" });
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement>();

const currentItem = computed(
  () => props.items.find((i) => i.value === props.modelValue) || props.items[0],
);

const select = (value: string) => {
  emit("update:modelValue", value);
  isOpen.value = false;
};

onClickOutside(containerRef, () => (isOpen.value = false));
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  cursor: pointer;
  font-size: 1rem;
  color: #fff;
  transition: background 0.2s, transform 0.1s;
}

.dropdown__trigger:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dropdown__trigger:active {
  transform: scale(0.95);
}

.dropdown__current {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.dropdown__icon {
  font-size: 1.25rem;
  line-height: 1;
}

.dropdown__label {
  font-weight: 500;
}

.dropdown__arrow {
  font-size: 0.625rem;
  margin-left: 0.25rem;
  transition: transform 0.2s ease;
}

.dropdown__arrow--open {
  transform: rotate(180deg);
}

.dropdown__menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  min-width: 100%;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem;
  padding: 0.375rem;
  margin: 0;
  list-style: none;
  z-index: 100;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.dropdown__menu--bottom-right {
  right: 0;
}

.dropdown__menu--bottom-left {
  left: 0;
}

.dropdown__item {
  margin: 0.125rem 0;
}

.dropdown__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  transition: all 0.15s ease;
}

.dropdown__option:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.dropdown__option--active {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.dropdown__check {
  margin-left: auto;
  font-size: 0.875rem;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

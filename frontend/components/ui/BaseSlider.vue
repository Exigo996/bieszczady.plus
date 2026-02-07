<script setup lang="ts">
interface Props {
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  label: "",
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100;
});

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = Number(target.value);
  emit("update:modelValue", value);
}
</script>

<template>
  <div class="base-slider">
    <div v-if="label" class="base-slider__label">
      {{ label }}
    </div>
    <div class="base-slider__track-container">
      <div class="base-slider__track">
        <div class="base-slider__fill" :style="{ width: `${percentage}%` }" />
      </div>
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        :disabled="disabled"
        class="base-slider__input"
        @input="handleInput"
      />
    </div>
    <div class="base-slider__value">
      <slot name="value">{{ modelValue }}</slot>
    </div>
  </div>
</template>

<style scoped>
.base-slider {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.base-slider__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.base-slider__track-container {
  position: relative;
  height: 1.5rem;
  display: flex;
  align-items: center;
}

.base-slider__track {
  position: absolute;
  inset: 0;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
}

.base-slider__fill {
  height: 100%;
  background: #10b981;
  border-radius: 0.25rem;
  transition: width 0.15s ease-out;
}

.base-slider__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.base-slider__input:disabled {
  cursor: not-allowed;
}

.base-slider__input:disabled + .base-slider__track .base-slider__fill {
  background: #9ca3af;
}

.base-slider__value {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: right;
}
</style>

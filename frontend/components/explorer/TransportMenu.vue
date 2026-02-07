<script setup lang="ts">
import type { TransportMode, SearchMode } from "~/stores/filters";

interface Props {
  transport: TransportMode;
  searchMode: SearchMode;
  value: number;
  loading?: boolean;
  descriptionText?: string;
  resultsCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  descriptionText: "",
  resultsCount: 0,
});

const emit = defineEmits<{
  "update:transport": [mode: TransportMode];
  "update:searchMode": [mode: SearchMode];
  "update:value": [value: number];
}>();

const { t } = useI18n();

// Advanced settings expand/collapse state
const showAdvanced = ref(false);

function toggleAdvanced() {
  showAdvanced.value = !showAdvanced.value;
}

const transportModes: { key: TransportMode; icon: string }[] = [
  { key: "car", icon: "🚗" },
  { key: "bike", icon: "🚲" },
  { key: "walk", icon: "🚶" },
];

const sliderConfig = computed(() => {
  if (props.searchMode === "time") {
    return {
      min: 15,
      max: 120,
      step: 5,
      unit: "min",
    };
  }
  return {
    min: 5,
    max: 200,
    step: 5,
    unit: "km",
  };
});

const valueDisplay = computed(() => {
  if (props.searchMode === "time") {
    return `${props.value} min`;
  }
  return `${props.value} km`;
});

function setTransport(mode: TransportMode) {
  emit("update:transport", mode);
}

function toggleMode() {
  const newMode: SearchMode = props.searchMode === "time" ? "distance" : "time";
  emit("update:searchMode", newMode);
  if (newMode === "time") {
    emit("update:value", 30);
  } else {
    emit("update:value", 30);
  }
}
</script>

<template>
  <div class="transport-menu">
    <!-- Main Row -->
    <div class="transport-menu__main">
      <!-- Transport Icons -->
      <div class="transport-menu__icons">
        <button
          v-for="mode in transportModes"
          :key="mode.key"
          class="transport-menu__icon-btn"
          :class="{
            'transport-menu__icon-btn--active': transport === mode.key,
          }"
          :disabled="loading"
          @click="setTransport(mode.key)"
        >
          {{ mode.icon }}
        </button>
      </div>

      <!-- Time/Distance Toggle + Slider in one line -->
      <div class="transport-menu__controls">
        <button
          class="transport-menu__mode-toggle"
          :class="{
            'transport-menu__mode-toggle--time': searchMode === 'time',
          }"
          :disabled="loading"
          @click="toggleMode"
        >
          <svg
            v-if="searchMode === 'time'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </button>

        <input
          type="range"
          class="transport-menu__slider"
          :min="sliderConfig.min"
          :max="sliderConfig.max"
          :step="sliderConfig.step"
          :value="value"
          :disabled="loading"
          @input="
            emit(
              'update:value',
              Number(($event.target as HTMLInputElement).value),
            )
          "
        />

        <!-- Advanced Settings Toggle -->
        <button
          class="transport-menu__advanced-toggle"
          :class="{ 'transport-menu__advanced-toggle--active': showAdvanced }"
          @click="toggleAdvanced"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Results Description -->
    <div v-if="descriptionText || resultsCount > 0" class="transport-menu__results">
      <span v-if="descriptionText" class="transport-menu__results-text">{{ descriptionText }}</span>
      <span v-if="resultsCount > 0" class="transport-menu__results-count">
        {{ t("explorer.results", { n: resultsCount }) }}
      </span>
    </div>

    <!-- Advanced Settings Panel -->
    <Transition name="transport-menu__expand">
      <div v-if="showAdvanced" class="transport-menu__advanced">
        <slot name="advanced" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.transport-menu {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  max-width: 100%;
  overflow: hidden;
}

.transport-menu__main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem 0.5rem 1rem;
}

.transport-menu__icons {
  display: flex;
  gap: 0.25rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.125rem;
  flex-shrink: 0;
}

.transport-menu__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  font-size: 1.25rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.transport-menu__icon-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.transport-menu__icon-btn--active {
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.transport-menu__icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.transport-menu__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.transport-menu__mode-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  background: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.transport-menu__mode-toggle:hover:not(:disabled) {
  background: #e5e7eb;
}

.transport-menu__mode-toggle--time {
  background: #ecfdf5;
  color: #10b981;
}

.transport-menu__mode-toggle svg {
  width: 1rem;
  height: 1rem;
}

.transport-menu__mode-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.transport-menu__slider {
  width: 100px;
  height: 0.375rem;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 0.25rem;
  outline: none;
  cursor: pointer;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .transport-menu__slider {
    width: 150px;
  }
}

.transport-menu__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.125rem;
  height: 1.125rem;
  background: #10b981;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s;
}

.transport-menu__slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.transport-menu__slider::-moz-range-thumb {
  width: 1.125rem;
  height: 1.125rem;
  background: #10b981;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s;
}

.transport-menu__slider::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.transport-menu__slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.transport-menu__value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  min-width: 3rem;
  text-align: right;
  flex-shrink: 0;
}

.transport-menu__advanced-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  background: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  margin-left: auto;
}

.transport-menu__advanced-toggle:hover {
  background: #e5e7eb;
}

.transport-menu__advanced-toggle--active {
  background: #3b82f6;
  color: #fff;
}

.transport-menu__advanced-toggle svg {
  width: 1rem;
  height: 1rem;
}

.transport-menu__results {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 1rem 0.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.transport-menu__results-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.transport-menu__results-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
}

.transport-menu__advanced {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  max-width: 100%;
  overflow: hidden;
}

.transport-menu__expand-enter-active,
.transport-menu__expand-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  overflow: hidden;
  max-height: 500px;
}

.transport-menu__expand-enter-from,
.transport-menu__expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.transport-menu__expand-enter-to,
.transport-menu__expand-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>

<template>
  <header class="onboarding-header">
    <h1 class="onboarding-header__greeting">
      <span class="onboarding-header__text">{{ displayedGreeting }}</span>
      <span
        class="onboarding-header__cursor"
        :class="{ 'onboarding-header__cursor--hidden': !showCursor }"
        aria-hidden="true"
        >|</span
      >
    </h1>
    <p class="onboarding-header__subtitle">
      <span class="onboarding-header__text">{{ displayedSubtitle }}</span>
    </p>
  </header>
</template>

<script setup lang="ts">
interface Props {
  greeting: string;
  subtitle: string;
}

const props = defineProps<Props>();

const {
  displayedText: greetingText,
  showCursor,
  start: startGreeting,
  delay,
} = useTypewriter({ speed: 30, cursorBlinkInterval: 530 });

const {
  displayedText: subtitleText,
  start: startSubtitle,
} = useTypewriter({ speed: 30, cursorBlinkInterval: 530 });

const displayedGreeting = computed(() => greetingText.value);
const displayedSubtitle = computed(() => subtitleText.value);

const runAnimation = async () => {
  // Type greeting
  await startGreeting(props.greeting);

  // Pause between lines
  await delay(200);

  // Type subtitle
  await startSubtitle(props.subtitle);
};

// Only run animation on client side
onMounted(() => {
  runAnimation();
});

// Also re-run when text changes (client only)
watch(
  () => [props.greeting, props.subtitle] as const,
  () => {
    runAnimation();
  },
);

defineExpose({
  runAnimation,
});
</script>

<style scoped>
.onboarding-header {
  text-align: center;
  padding: 2rem 1rem 1.5rem;
  flex-shrink: 0;
}

.onboarding-header__greeting {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 700;
  margin: 0 0 0.25rem;
  min-height: 1.2em;
}

.onboarding-header__subtitle {
  font-size: clamp(1rem, 3vw, 1.25rem);
  opacity: 0.8;
  margin: 0;
  font-weight: 400;
  min-height: 1.2em;
}

.onboarding-header__text {
  display: inline;
}

.onboarding-header__cursor {
  display: inline;
  font-weight: 400;
  opacity: 1;
  transition: opacity 0.1s;
}

.onboarding-header__cursor--hidden {
  opacity: 0;
}
</style>

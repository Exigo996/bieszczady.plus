import { tryOnScopeDispose } from "@vueuse/core";

export interface TypewriterOptions {
  /** Speed in ms per character (default: 50) */
  speed?: number;
  /** Cursor blink interval in ms (default: 530) */
  cursorBlinkInterval?: number;
}

/**
 * Composable for typewriter animation effect
 *
 * @example
 * const { displayedText, isTyping, start, stop } = useTypewriter()
 * start("Hello World")
 */
export function useTypewriter(options: TypewriterOptions = {}) {
  const { speed = 50, cursorBlinkInterval = 530 } = options;

  const displayedText = ref("");
  const isTyping = ref(false);
  const showCursor = ref(true);

  // Track all timeouts for cleanup
  const pendingTimeouts = new Set<NodeJS.Timeout>();

  // Safe timeout that tracks IDs for cleanup
  const safeTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const id = setTimeout(() => {
      pendingTimeouts.delete(id);
      callback();
    }, delay);
    pendingTimeouts.add(id);
    return id;
  };

  // Cursor blink interval
  let cursorInterval: NodeJS.Timeout | null = null;

  const startCursorBlink = () => {
    stopCursorBlink();
    cursorInterval = setInterval(() => {
      showCursor.value = !showCursor.value;
    }, cursorBlinkInterval);
  };

  const stopCursorBlink = () => {
    if (cursorInterval) {
      clearInterval(cursorInterval);
      cursorInterval = null;
    }
    showCursor.value = false;
  };

  /**
   * Start typewriter animation with given text
   */
  const start = (text: string, customSpeed?: number): Promise<void> => {
    return new Promise((resolve) => {
      isTyping.value = true;
      displayedText.value = "";
      startCursorBlink();

      const actualSpeed = customSpeed ?? speed;
      let index = 0;

      const type = () => {
        if (index < text.length) {
          displayedText.value = text.slice(0, index + 1);
          index++;
          safeTimeout(type, actualSpeed);
        } else {
          stopCursorBlink();
          isTyping.value = false;
          resolve();
        }
      };

      type();
    });
  };

  /**
   * Stop animation and clear all timeouts
   */
  const stop = () => {
    stopCursorBlink();
    isTyping.value = false;
    // Clear all pending timeouts
    pendingTimeouts.forEach((id: NodeJS.Timeout) => clearTimeout(id));
    pendingTimeouts.clear();
  };

  /**
   * Simple delay promise that tracks timeouts
   */
  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      safeTimeout(() => resolve(), ms);
    });
  };

  // Cleanup on unmount
  tryOnScopeDispose(stop);

  return {
    displayedText,
    isTyping,
    showCursor,
    start,
    stop,
    delay,
  };
}

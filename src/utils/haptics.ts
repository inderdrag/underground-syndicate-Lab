/**
 * Mobile Touch Haptics Utility
 * Triggers subtle tactile vibrations on smartphones using navigator.vibrate
 */

export const hapticFeedback = {
  // Light tap feedback for tab switches, selection, checkboxes
  light: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch (_) {}
    }
  },

  // Medium feedback for button clicks, buying items, crafting actions
  medium: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch (_) {}
    }
  },

  // Heavy feedback for warnings, reset game, error states
  heavy: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 20, 35]);
      } catch (_) {}
    }
  },

  // Success fanfare vibration for completing mini-games or big sales
  success: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 30, 20, 30, 40]);
      } catch (_) {}
    }
  }
};

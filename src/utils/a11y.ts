/**
 * Accessibility Utilities: Focus Trapping & Keyboard Navigation
 */

export function trapFocus(container: HTMLElement, e: KeyboardEvent) {
  if (e.key !== 'Tab') return;

  const focusable = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      last.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }
}

export function handleEscapeKey(onClose: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
}

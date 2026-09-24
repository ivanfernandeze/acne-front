'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Closes a popover when the user clicks outside it or presses Escape.
 *
 * Written because the study-mode switch shipped without either: its panel could only be closed by
 * its own button, so clicking anywhere else left it hovering over the page. A menu that does not
 * close the way every other menu closes reads as broken.
 *
 * `pointerdown` rather than `click`: a `click` listener fires after the target has already reacted,
 * so a button underneath the panel would run before the panel knew it should close.
 *
 * @returns the ref to attach to the element that must stay open while it holds the interaction.
 */
export function useDismissable<T extends HTMLElement>(
  open: boolean,
  onDismiss: () => void,
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent): void => {
      const node = ref.current;
      if (node !== null && !node.contains(event.target as Node)) onDismiss();
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onDismiss();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onDismiss]);

  return ref;
}

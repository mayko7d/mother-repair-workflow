import { useCallback, useEffect, useState } from 'react';

interface StepNavigation {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  prev: () => void;
  goTo: (i: number) => void;
  reset: () => void;
}

/**
 * Gestiona el índice del paso activo de una secuencia y la navegación con teclado
 * (← / → para avanzar/retroceder, Home / End para ir al principio/final).
 *
 * @param count número de pasos
 * @param enableKeyboard si se habilita la navegación global por teclado
 */
export function useStepNavigation(count: number, enableKeyboard = true): StepNavigation {
  const [index, setIndex] = useState(0);

  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(count - 1, i)),
    [count],
  );

  const goTo = useCallback((i: number) => setIndex(() => clamp(i)), [clamp]);
  const next = useCallback(() => setIndex((i) => clamp(i + 1)), [clamp]);
  const prev = useCallback(() => setIndex((i) => clamp(i - 1)), [clamp]);
  const reset = useCallback(() => setIndex(0), []);

  // Si cambia el número de pasos (cambio de secuencia), vuelve al inicio.
  useEffect(() => {
    setIndex(0);
  }, [count]);

  useEffect(() => {
    if (!enableKeyboard) return;
    const onKey = (e: KeyboardEvent) => {
      // No interferir mientras se escribe en un campo.
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(count - 1);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enableKeyboard, next, prev, goTo, count]);

  return {
    index,
    isFirst: index === 0,
    isLast: index === count - 1,
    next,
    prev,
    goTo,
    reset,
  };
}

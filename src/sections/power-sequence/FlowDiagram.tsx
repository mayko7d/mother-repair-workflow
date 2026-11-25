import { useEffect, useRef } from 'react';
import type { SequenceStep } from '../../types/sequence';
import { StepNode } from './StepNode';
import styles from './powerSequence.module.css';

interface Props {
  steps: SequenceStep[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Flujo 2D de la secuencia: una riel horizontal de nodos conectados, navegable.
 * El nodo activo se desplaza automáticamente a la vista.
 */
export function FlowDiagram({ steps, activeIndex, onSelect }: Props) {
  const railRef = useRef<HTMLOListElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    // En el primer render no desplazamos (evita empujar el encabezado al cargar).
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const active = rail.querySelector<HTMLElement>('[data-state="active"]');
    if (!active) return;
    // Centrar el nodo activo dentro del riel sin desplazar la página verticalmente.
    const railRect = rail.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const offset =
      activeRect.left - railRect.left - railRect.width / 2 + activeRect.width / 2;
    rail.scrollBy({ left: offset, behavior: 'smooth' });
  }, [activeIndex]);

  return (
    <nav className={styles.flow} aria-label="Pasos de la secuencia de encendido">
      <ol className={styles.rail} ref={railRef}>
        {steps.map((step, i) => (
          <StepNode
            key={step.id}
            step={step}
            state={i === activeIndex ? 'active' : i < activeIndex ? 'visited' : 'pending'}
            onSelect={() => onSelect(i)}
          />
        ))}
      </ol>
    </nav>
  );
}
